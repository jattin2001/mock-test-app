const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/mocktestDB");

const db = mongoose.connection;

db.once("open", () => {
  console.log("MongoDB Connected");
});

module.exports = mongoose;
