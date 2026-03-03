const express = require("express");
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
