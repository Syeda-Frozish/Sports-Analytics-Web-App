const express = require('express');
const router = express.Router();

const { getCurrentMatches } = require('../services/cricApi');
const formatMatch = require('../utils/formatMatch');
const filterMatches = require('../utils/filterMatches');


// Live matches - Major matches only
router.get('/live', async (req, res) => {
  try {
    const matches = await getCurrentMatches();

    if (!matches || matches.length === 0) {
      return res.json({
        count: 0,
        matches: [],
      });
    }

    // Format matches and filter out nulls
    const formattedMatches = matches
      .map(formatMatch)
      .filter(match => match !== null);

    // Filter for major matches only
    const filteredMatches = filterMatches(formattedMatches);

    const liveMatches = filteredMatches.filter(match => match.status === 'live' || (match.matchStarted && !match.matchEnded));

    res.json({
      count: liveMatches.length,
      matches: liveMatches,
    });
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to fetch matches',
    });
  }
});

// Completed/Recent matches
router.get('/recent', async (req, res) => {
  try {
    const matches = await getCurrentMatches();

    if (!matches || matches.length === 0) {
      return res.json({
        count: 0,
        matches: [],
      });
    }

    const formattedMatches = matches
      .map(formatMatch)
      .filter(match => match !== null);

    const filteredMatches = filterMatches(formattedMatches);

    const recentMatches = filteredMatches.filter(
      match => match.matchEnded
    );

    res.json({
      count: recentMatches.length,
      matches: recentMatches,
    });
  } catch (err) {
    console.error('Error fetching recent matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to fetch recent matches',
    });
  }
});

// Upcoming matches
router.get('/upcoming', async (req, res) => {
  try {
    const matches = await getCurrentMatches();

    if (!matches || matches.length === 0) {
      return res.json({
        count: 0,
        matches: [],
      });
    }

    const formattedMatches = matches
      .map(formatMatch)
      .filter(match => match !== null);

    const filteredMatches = filterMatches(formattedMatches);

    const upcomingMatches = filteredMatches.filter(
      match => !match.matchStarted && !match.matchEnded
    );

    res.json({
      count: upcomingMatches.length,
      matches: upcomingMatches,
    });
  } catch (err) {
    console.error('Error fetching upcoming matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to fetch upcoming matches',
    });
  }
});

module.exports = router;