const express = require("express");
// const Attempt = require("./models/Attempt");  ← comment this

const app = express();

app.use(express.static("public"));
app.use(express.json());

app.post("/submit", async (req, res) => {
  try {
    // const attempt = new Attempt(req.body);
    // await attempt.save();

    res.json({ message: "Attempt received (DB disabled)" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save attempt" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
