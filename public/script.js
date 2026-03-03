// =============================================
// STATE
// =============================================
let questions = [];
let currentIndex = 0;
let userAnswers = {};
let questionState = {};
let timerInterval;
let timeLeft = 3600;
let isReviewMode = false;
let paletteFilter = "all";
let lastResult = null; // for leaderboard + share

// =============================================
// AUDIO (Web Audio API — no files needed)
// =============================================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playSound(type) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "select") {
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === "correct") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "wrong") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "navigate") {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {}
}

// =============================================
// CONFETTI
// =============================================
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = [
    "#1877f2",
    "#38ef7d",
    "#f7b733",
    "#f093fb",
    "#00c6ff",
    "#f7294c",
    "#a78bfa",
  ];
  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 10 + 6,
    h: Math.random() * 5 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360,
    vy: Math.random() * 4 + 2,
    vx: (Math.random() - 0.5) * 2,
    vr: (Math.random() - 0.5) * 6,
    opacity: 1,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach((p) => {
      if (p.y < canvas.height + 20) {
        alive = true;
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vr;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.015;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });
    if (alive) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
  setTimeout(() => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 5000);
}

// =============================================
// DARK MODE
// =============================================
function toggleDark() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", isDark ? "light" : "dark");
  document.querySelector(".dark-toggle").textContent = isDark ? "🌙" : "☀️";
  localStorage.setItem("ssc-theme", isDark ? "light" : "dark");
}

function applyStoredTheme() {
  const t = localStorage.getItem("ssc-theme");
  if (t === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.querySelector(".dark-toggle").textContent = "☀️";
  }
}

// =============================================
// DIFFICULTY TAG (mock — based on question id parity)
// =============================================
function getDifficulty(q) {
  if (q.difficulty) return q.difficulty;
  const n = parseInt(q.id) || 0;
  if (n % 3 === 0) return "Hard";
  if (n % 2 === 0) return "Easy";
  return "Medium";
}

function diffClass(d) {
  if (d === "Easy") return "diff-easy";
  if (d === "Hard") return "diff-hard";
  return "diff-medium";
}

// =============================================
// PROGRESS BAR
// =============================================
function updateProgressBar() {
  const answered = Object.values(questionState).filter(
    (s) => s === "answered",
  ).length;
  const pct = questions.length ? (answered / questions.length) * 100 : 0;
  document.getElementById("topProgressFill").style.width = pct + "%";
}

// =============================================
// SECTION TAB HIGHLIGHT
// =============================================
function updateSectionTabs() {
  const q = questions[currentIndex];
  if (!q) return;
  document.querySelectorAll(".section-select button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.sec === q.subject);
  });
}

// =============================================
// LOAD DATA
// =============================================
function loadFullMock() {
  applyStoredTheme();

  Promise.all([
    fetch("data/quant.json").then((r) => r.json()),
    fetch("data/reasoning.json").then((r) => r.json()),
    fetch("data/gs.json").then((r) => r.json()),
    fetch("data/english.json").then((r) => r.json()),
  ]).then(([q, r, g, e]) => {
    questions = [...q, ...r, ...g, ...e];
    questions.forEach((q) => (questionState[q.id] = "notVisited"));
    currentIndex = 0;
    loadQuestion();
    renderPalette();
    startTimer();
  });
}

// =============================================
// QUESTION LOAD
// =============================================
function loadQuestion() {
  if (isReviewMode) return;

  const q = questions[currentIndex];
  if (questionState[q.id] === "notVisited") questionState[q.id] = "notAnswered";

  // Meta bar
  document.getElementById("qNumber").textContent =
    `Q${currentIndex + 1} / ${questions.length}`;
  document.getElementById("qSubject").textContent = q.subject;
  const diff = getDifficulty(q);
  const diffEl = document.getElementById("qDifficulty");
  diffEl.textContent = diff;
  diffEl.className = "q-difficulty " + diffClass(diff);

  document.getElementById("question").innerHTML = `<p>${q.question}</p>`;

  const letters = ["A", "B", "C", "D"];
  document.getElementById("options").innerHTML = q.options
    .map(
      (o, i) => `
    <div class="option-label ${userAnswers[q.id] === i ? "selected" : ""}"
         onclick="selectAnswer(${i})" id="opt-${i}">
      <span class="option-letter">${letters[i]}</span>
      <span>${o}</span>
    </div>`,
    )
    .join("");

  updateStatusCount();
  updateProgressBar();
  updateSectionTabs();
  renderPalette();
}

// =============================================
// TIMER
// =============================================
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitTest();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  document.getElementById("timer").textContent =
    `${m}:${String(s).padStart(2, "0")}`;
  const box = document.getElementById("timerBox");
  box.classList.remove("timer-warning", "timer-danger");
  if (timeLeft < 300) box.classList.add("timer-danger");
  else if (timeLeft < 600) box.classList.add("timer-warning");
}

// =============================================
// ANSWERS
// =============================================
function selectAnswer(ans) {
  const q = questions[currentIndex];
  userAnswers[q.id] = ans;
  questionState[q.id] = "answered";
  playSound("select");
  // Update option visuals without re-rendering whole question
  document.querySelectorAll(".option-label").forEach((el, i) => {
    el.classList.toggle("selected", i === ans);
    el.querySelector(".option-letter").style.background = i === ans ? "" : "";
  });
  updateStatusCount();
  updateProgressBar();
  renderPalette();
}

function clearResponse() {
  const q = questions[currentIndex];
  delete userAnswers[q.id];
  questionState[q.id] = "notAnswered";
  loadQuestion();
}

// =============================================
// NAVIGATION
// =============================================
function saveNext() {
  playSound("navigate");
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    loadQuestion();
  }
}
function prevQuestion() {
  playSound("navigate");
  if (currentIndex > 0) {
    currentIndex--;
    loadQuestion();
  }
}
function markReview() {
  const q = questions[currentIndex];
  questionState[q.id] = "review";
  saveNext();
}

// =============================================
// PALETTE
// =============================================
function jumpQuestion(i) {
  currentIndex = i;
  isReviewMode ? showReviewQuestion(i) : loadQuestion();
}
function jumpSection(sec) {
  const i = questions.findIndex((q) => q.subject === sec);
  if (i !== -1) {
    currentIndex = i;
    loadQuestion();
  }
}
function renderPalette() {
  let html = "";
  const sections = ["Quant", "Reasoning", "GS", "English"];
  sections.forEach((sec) => {
    html += `<div class="section-title">${sec}</div>`;
    questions.forEach((q, i) => {
      if (q.subject !== sec) return;
      if (isReviewMode) {
        const u = userAnswers[q.id];
        const isCorrect = u !== undefined && u === q.answer;
        const isWrong = u !== undefined && u !== q.answer;
        const isUnattempted = u === undefined;
        if (paletteFilter === "correct" && !isCorrect) return;
        if (paletteFilter === "wrong" && !isWrong) return;
        if (paletteFilter === "unattempted" && !isUnattempted) return;
      }
      let cls = isReviewMode ? getReviewPaletteClass(q) : questionState[q.id];
      if (i === currentIndex) cls += " currentQuestion";
      html += `<button class="${cls}" onclick="jumpQuestion(${i})">${i + 1}</button>`;
    });
  });
  document.getElementById("palette").innerHTML = html;
}

// =============================================
// STATUS
// =============================================
function updateStatusCount() {
  let a = 0,
    r = 0,
    n = 0;
  questions.forEach((q) => {
    const s = questionState[q.id];
    if (s === "answered") a++;
    else if (s === "review") r++;
    else n++;
  });
  document.getElementById("answeredCount").textContent = a;
  document.getElementById("reviewCount").textContent = r;
  document.getElementById("notCount").textContent = n;
}

// =============================================
// SUBMIT
// =============================================
function submitTest() {
  clearInterval(timerInterval);
  document.querySelector(".submit-btn").style.display = "none";

  let score = 0,
    attempted = 0,
    correct = 0,
    wrong = 0;
  questions.forEach((q) => {
    if (userAnswers[q.id] !== undefined) {
      attempted++;
      if (userAnswers[q.id] === q.answer) {
        score += 2;
        correct++;
      } else {
        score -= 0.5;
        wrong++;
      }
    }
  });

  showResult(score, attempted, correct, wrong);
}

// =============================================
// LEADERBOARD (localStorage)
// =============================================
function saveAttempt(score, correct, wrong, skipped, total) {
  const attempts = getAttempts();
  attempts.unshift({
    score,
    correct,
    wrong,
    skipped,
    total,
    accuracy: total ? ((correct / total) * 100).toFixed(1) : 0,
    date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
  const trimmed = attempts.slice(0, 10);
  try {
    localStorage.setItem("ssc-attempts", JSON.stringify(trimmed));
  } catch (e) {}
  return trimmed;
}

function getAttempts() {
  try {
    return JSON.parse(localStorage.getItem("ssc-attempts") || "[]");
  } catch (e) {
    return [];
  }
}

function renderLeaderboard(attempts) {
  const el = document.getElementById("leaderboard");
  if (!attempts.length) {
    el.innerHTML = '<div class="lb-empty">No past attempts yet.</div>';
    return;
  }
  const sorted = [...attempts].sort((a, b) => b.score - a.score);
  el.innerHTML = sorted
    .map((a, i) => {
      const rankClass =
        i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
      const isCurrent = i === 0 && a === attempts[0];
      return `
      <div class="lb-row ${isCurrent ? "lb-current" : ""}">
        <div class="lb-rank ${rankClass}">${i + 1}</div>
        <div class="lb-info">
          <div class="lb-date">${a.date} ${a.time}</div>
          <div class="lb-meta">✅ ${a.correct}  ❌ ${a.wrong}  ⏭ ${a.skipped}  — ${a.accuracy}% accuracy</div>
        </div>
        <div class="lb-score">${a.score}</div>
      </div>`;
    })
    .join("");
}

// =============================================
// GRADE
// =============================================
function getGrade(pct) {
  if (pct >= 90)
    return { g: "S", msg: "🎉 Outstanding! You crushed it!", emoji: "🏆" };
  if (pct >= 75)
    return { g: "A", msg: "🌟 Excellent performance!", emoji: "🥇" };
  if (pct >= 60)
    return { g: "B", msg: "👍 Good job! Keep pushing.", emoji: "🎯" };
  if (pct >= 45)
    return { g: "C", msg: "📚 Decent. Room to improve.", emoji: "📈" };
  return { g: "D", msg: "💪 Keep practising, you'll get there!", emoji: "🔥" };
}

// =============================================
// SHOW RESULT
// =============================================
function showResult(score, a, c, w) {
  const total = questions.length;
  const skipped = total - a;
  const maxScore = total * 2;
  const pct = total ? (c / total) * 100 : 0;
  const grade = getGrade(pct);

  lastResult = { score, a, c, w, skipped, total, maxScore, pct };

  // Save to leaderboard
  const attempts = saveAttempt(score, c, w, skipped, total);

  // Hide exam UI
  document.querySelector(".container").style.display = "none";
  document.querySelector(".section-select").style.display = "none";
  document.getElementById("resultBox").style.display = "block";

  // Score values
  document.getElementById("rScore").textContent =
    score % 1 === 0 ? score : score.toFixed(1);
  document.getElementById("rMax").textContent = maxScore;
  document.getElementById("rAttempted").textContent = a;
  document.getElementById("rCorrect").textContent = c;
  document.getElementById("rWrong").textContent = w;
  document.getElementById("rSkipped").textContent = skipped;

  // Grade badge
  document.getElementById("resultTrophy").textContent = grade.emoji;
  document.getElementById("resultTitle").textContent = "Exam Complete";
  document.getElementById("resultSubtitle").textContent = grade.msg;
  const badge = document.getElementById("gradeBadge");
  badge.textContent = grade.g;
  badge.className = `grade-badge grade-${grade.g}`;

  // Bars
  const accuracyPct = pct.toFixed(1);
  const correctPct = pct.toFixed(1);
  const wrongPct = ((w / total) * 100).toFixed(1);
  const skippedPct = ((skipped / total) * 100).toFixed(1);

  setTimeout(() => {
    setBar("barAccuracy", accuracyPct, "rAccuracy", accuracyPct + "%");
    setBar("barCorrect", correctPct, "rCorrectPct", `${c} / ${total}`);
    setBar("barWrong", wrongPct, "rWrongPct", `${w} / ${total}`);
    setBar("barSkipped", skippedPct, "rSkippedPct", `${skipped} / ${total}`);
  }, 150);

  buildSubjectCharts();
  renderLeaderboard(attempts);

  // Confetti for good scores
  if (pct >= 60) setTimeout(launchConfetti, 400);

  // Play sound
  playSound(pct >= 60 ? "correct" : "wrong");
}

function setBar(barId, pct, labelId, labelText) {
  const bar = document.getElementById(barId);
  const lbl = document.getElementById(labelId);
  if (bar) bar.style.width = Math.max(pct, 3) + "%";
  if (lbl) lbl.textContent = labelText;
}

// =============================================
// SUBJECT CHARTS
// =============================================
function buildSubjectCharts() {
  const subjects = [
    { name: "Quant", icon: "🔢", accent: "quant-accent", badge: "quant-badge" },
    {
      name: "Reasoning",
      icon: "🧩",
      accent: "reason-accent",
      badge: "reason-badge",
    },
    { name: "GS", icon: "🌍", accent: "gs-accent", badge: "gs-badge" },
    {
      name: "English",
      icon: "📖",
      accent: "english-accent",
      badge: "english-badge",
    },
  ];
  let html = "";
  subjects.forEach(({ name, icon, accent, badge }) => {
    const subQs = questions.filter((q) => q.subject === name);
    if (!subQs.length) return;
    const total = subQs.length;
    let correct = 0,
      wrong = 0,
      attempted = 0;
    subQs.forEach((q) => {
      const u = userAnswers[q.id];
      if (u !== undefined) {
        attempted++;
        if (u === q.answer) correct++;
        else wrong++;
      }
    });
    const skipped = total - attempted;
    const accuracy = attempted ? ((correct / attempted) * 100).toFixed(0) : 0;
    const pC = ((correct / total) * 100).toFixed(1);
    const pW = ((wrong / total) * 100).toFixed(1);
    const pS = ((skipped / total) * 100).toFixed(1);
    const pA = ((attempted / total) * 100).toFixed(1);
    html += `
      <div class="subject-block">
        <div class="subject-header">
          <span class="subject-name">${icon} ${name}</span>
          <span class="subject-badge ${badge}">${accuracy}% accuracy</span>
        </div>
        <div class="subject-mini-bars">
          <div class="mini-row"><span class="mini-label">Correct</span><div class="mini-track"><div class="mini-fill correct-bar sub-bar" data-pct="${pC}" style="width:0%"></div></div><span class="mini-pct">${correct}/${total}</span></div>
          <div class="mini-row"><span class="mini-label">Wrong</span><div class="mini-track"><div class="mini-fill wrong-bar sub-bar" data-pct="${pW}" style="width:0%"></div></div><span class="mini-pct">${wrong}/${total}</span></div>
          <div class="mini-row"><span class="mini-label">Skipped</span><div class="mini-track"><div class="mini-fill skip-bar sub-bar" data-pct="${pS}" style="width:0%"></div></div><span class="mini-pct">${skipped}/${total}</span></div>
          <div class="mini-row"><span class="mini-label">Attempted</span><div class="mini-track"><div class="mini-fill ${accent} sub-bar" data-pct="${pA}" style="width:0%"></div></div><span class="mini-pct">${attempted}/${total}</span></div>
        </div>
      </div>`;
  });
  document.getElementById("subjectCharts").innerHTML = html;
  setTimeout(() => {
    document.querySelectorAll(".sub-bar").forEach((bar) => {
      bar.style.width = Math.max(parseFloat(bar.dataset.pct), 3) + "%";
    });
  }, 200);
}

// =============================================
// SHARE
// =============================================
function shareScore() {
  if (!lastResult) return;
  const { score, maxScore, c, w, skipped, total, pct } = lastResult;
  document.getElementById("shareScoreBig").textContent =
    `${score} / ${maxScore}`;
  document.getElementById("shareStats").textContent =
    `✅ ${c} Correct  ❌ ${w} Wrong  ⏭ ${skipped} Skipped  |  ${pct.toFixed(1)}% accuracy`;
  document.getElementById("shareDate").textContent =
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  document.getElementById("shareModal").classList.add("open");
}
function closeShare() {
  document.getElementById("shareModal").classList.remove("open");
}
function copyShareText() {
  if (!lastResult) return;
  const { score, maxScore, c, w, skipped, pct } = lastResult;
  const text = `📋 SSC Mock Test Result\n🏆 Score: ${score}/${maxScore}\n✅ Correct: ${c}  ❌ Wrong: ${w}  ⏭ Skipped: ${skipped}\n📊 Accuracy: ${pct.toFixed(1)}%\n📅 ${new Date().toLocaleDateString()}`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    btn.textContent = "✅ Copied!";
    setTimeout(() => (btn.textContent = "📋 Copy Text"), 2000);
  });
}

// =============================================
// REVIEW MODE
// =============================================
function showReview() {
  isReviewMode = true;
  currentIndex = 0;
  paletteFilter = "all";

  document.getElementById("resultBox").style.display = "none";
  document.querySelector(".container").style.display = "flex";
  document.getElementById("mockPanel").style.display = "none";
  document.getElementById("reviewLayout").style.display = "block";
  document.getElementById("statusBox").style.display = "none";
  document.getElementById("reviewFilters").style.display = "flex";
  document.querySelector(".section-select").style.display = "flex";

  showReviewQuestion(0);
  renderPalette();
}

// Explanation generator (mock — can be replaced with real data from JSON)
function getExplanation(q) {
  if (q.explanation) return q.explanation;
  const correct = q.options[q.answer];
  return `The correct answer is <strong>${correct}</strong>. Review the relevant concept for ${q.subject} to strengthen your understanding of this topic.`;
}

function showReviewQuestion(i) {
  currentIndex = i;
  const q = questions[i];
  const u = userAnswers[q.id];
  const letters = ["A", "B", "C", "D"];
  const diff = getDifficulty(q);

  document.getElementById("reviewContent").innerHTML = `
    <div class="q-meta" style="margin-bottom:14px">
      <span class="q-number">Q${i + 1} / ${questions.length}</span>
      <span class="q-subject">${q.subject}</span>
      <span class="q-difficulty ${diffClass(diff)}">${diff}</span>
    </div>
    <p>${q.question}</p>
    <div style="margin-top:14px">
    ${q.options
      .map((o, idx) => {
        let cls = "";
        let icon = letters[idx];
        if (idx === q.answer) {
          cls = "correct";
          icon = "✅";
        } else if (idx === u) {
          cls = "wrong";
          icon = "❌";
        }
        return `<div class="review-option ${cls}"><span style="font-weight:700;flex-shrink:0">${icon}</span>${o}</div>`;
      })
      .join("")}
    </div>`;

  // Explanation panel
  const expEl = document.getElementById("reviewExplanation");
  expEl.innerHTML = `<h4>💡 Explanation</h4><p>${getExplanation(q)}</p>`;
  expEl.classList.add("visible");

  // Sound on review
  if (u !== undefined) playSound(u === q.answer ? "correct" : "wrong");

  renderPalette();
}

function getReviewPaletteClass(q) {
  const u = userAnswers[q.id];
  if (u === undefined) return "notVisited";
  return u === q.answer ? "correctPalette" : "wrongPalette";
}

function reviewNext() {
  if (currentIndex < questions.length - 1) showReviewQuestion(++currentIndex);
}
function reviewPrev() {
  if (currentIndex > 0) showReviewQuestion(--currentIndex);
}

function backToResult() {
  isReviewMode = false;
  paletteFilter = "all";

  document.querySelector(".container").style.display = "none";
  document.getElementById("reviewLayout").style.display = "none";
  document.getElementById("reviewFilters").style.display = "none";
  document.getElementById("statusBox").style.display = "none";
  document.querySelector(".section-select").style.display = "none";
  document.getElementById("resultBox").style.display = "block";
}

function setFilter(type) {
  paletteFilter = type;
  document.querySelectorAll("#reviewFilters button").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.textContent.toLowerCase().includes(type) ||
        (type === "all" && btn.textContent === "All"),
    );
  });
  renderPalette();
  const filtered = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => {
      const u = userAnswers[q.id];
      if (type === "correct") return u !== undefined && u === q.answer;
      if (type === "wrong") return u !== undefined && u !== q.answer;
      if (type === "unattempted") return u === undefined;
      return true;
    });
  if (filtered.length > 0) showReviewQuestion(filtered[0].i);
}
