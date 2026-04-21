const express = require('express');
const router = express.Router();
const Match = require('../models/Match');


// ✅ CREATE (Insert dummy data)
router.post('/add-dummy', async (req, res) => {
  try {
    const match = new Match({
      teamA: "Pakistan",
      teamB: "India",
      date: new Date(),
      score: "280/6 vs 275/9"
    });

    const saved = await match.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ READ (Get all matches)
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ DELETE (Delete ALL matches — for testing)
router.delete('/delete-all', async (req, res) => {
  try {
    await Match.deleteMany({});
    res.json({ message: "All matches deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;