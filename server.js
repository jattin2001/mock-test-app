const express = require("express");

const app = express();

app.use(express.static("public"));
app.use(express.json());

app.post("/submit", (req, res) => {
  res.json({ message: "Submit endpoint working (DB disabled)" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
