const mongoose = require("../db");

const attemptSchema = new mongoose.Schema({
  score: Number,
  attempted: Number,
  totalQuestions: Number,
  answers: Object,
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Attempt", attemptSchema);
