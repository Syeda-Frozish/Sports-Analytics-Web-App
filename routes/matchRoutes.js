const express = require('express');
const router = express.Router();

const { getCurrentMatches } = require('../services/cricApi');
const formatMatch = require('../utils/formatMatch');

// 🔴 Live matches
router.get('/live', async (req, res) => {
  try {
    const matches = await getCurrentMatches();

    const formattedMatches = matches.map(formatMatch);

    res.json({
      count: formattedMatches.length,
      matches: formattedMatches,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;