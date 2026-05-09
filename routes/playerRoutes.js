const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// ADD PLAYER
router.post('/add', async (req, res) => {
  try {
    const player = new Player(req.body);
    await player.save();
    res.status(201).json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;