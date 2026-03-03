const mongoose = require("../db");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: Number,
  subject: String,
  year: Number,
});

module.exports = mongoose.model("Question", questionSchema);
