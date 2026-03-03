const express = require("express");

const Attempt = require("./models/Attempt");
const app = express();

app.use(express.static("public"));
app.use(express.json());

app.post("/submit", async (req, res) => {
  try {
    const attempt = new Attempt(req.body);
    await attempt.save();

    res.json({ message: "Attempt saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save attempt" });
  }
});
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
