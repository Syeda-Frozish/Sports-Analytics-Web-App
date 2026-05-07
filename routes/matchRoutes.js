const express = require('express');
const router = express.Router();

const { getCurrentMatches } = require('../services/cricApi1');
const { getUpcomingMatches } = require('../services/cricApi2');
const formatMatch = require('../utils/formatMatch');
const formatUpcomingMatch = require('../utils/formatUpcomingMatch');
const filterMatches = require('../utils/filterMatches');
const Match = require('../models/cricketMatch');
const { setCache, getCache } = require('../utils/cache');


// Live matches (cache for 30 seconds)
router.get('/live', async (req, res) => {
  try {
    const filterMode = req.query.filter === 'all' ? null : filterMatches;
    const cacheKey = `live_${req.query.filter || 'major'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const matches = await getCurrentMatches();
    if (!matches || matches.length === 0) {
      const response = { count: 0, filter: req.query.filter || 'major', matches: [] };
      setCache(cacheKey, response, 30 * 1000);
      return res.json(response);
    }

    const formattedMatches = matches
      .map(formatMatch)
      .filter(match => match !== null);

    const filteredMatches = filterMode ? filterMode(formattedMatches) : formattedMatches;
    const liveMatches = filteredMatches.filter(match => match.status === 'live' || (match.matchStarted && !match.matchEnded));

    const response = {
      count: liveMatches.length,
      filter: req.query.filter || 'major',
      matches: liveMatches,
    };
    setCache(cacheKey, response, 30 * 1000); // 30 seconds
    res.json(response);
  } catch (err) {
    console.error('Error fetching live matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to fetch live matches',
    });
  }
});


// Completed/Recent matches
router.get('/recent', async (req, res) => {
  try {
    const filterMode = req.query.filter === 'all' ? null : filterMatches;
    
    const matches = await getCurrentMatches();

    if (!matches || matches.length === 0) {
      return res.json({
        count: 0,
        filter: req.query.filter || 'major',
        matches: [],
      });
    }

    const formattedMatches = matches
      .map(formatMatch)
      .filter(match => match !== null);

    const filteredMatches = filterMode ? filterMode(formattedMatches) : formattedMatches;
    const recentMatches = filteredMatches.filter(
      match => match.matchEnded === true
    );

    res.json({
      count: recentMatches.length,
      filter: req.query.filter || 'major',
      matches: recentMatches,
    });
  } catch (err) {
    console.error('Error fetching recent matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to fetch recent matches',
    });
  }
});


// Upcoming matches (cache for 5 minutes)
router.get('/upcoming', async (req, res) => {
  try {
    const filterMode = req.query.filter === 'all' ? null : filterMatches;
    const cacheKey = `upcoming_${req.query.filter || 'major'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const matches = await getUpcomingMatches();
    if (!matches || matches.length === 0) {
      const response = { count: 0, filter: req.query.filter || 'major', matches: [] };
      setCache(cacheKey, response, 5 * 60 * 1000);
      return res.json(response);
    }

    const formattedMatches = matches
      .map(formatUpcomingMatch)
      .filter(match => match !== null);

    const filteredMatches = filterMode ? filterMode(formattedMatches) : formattedMatches;
    const upcomingMatches = filteredMatches.filter(
      match => !match.matchStarted && !match.matchEnded
    );

    const response = {
      count: upcomingMatches.length,
      filter: req.query.filter || 'major',
      matches: upcomingMatches,
    };
    setCache(cacheKey, response, 5 * 60 * 1000); // 5 minutes
    res.json(response);
  } catch (err) {
    console.error('Error fetching upcoming matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to fetch upcoming matches',
    });
  }
});


// Save recently completed matches to database
router.post('/save-recent', async (req, res) => {
  try {
    const matches = await getCurrentMatches();

    if (!matches || matches.length === 0) {
      return res.json({
        message: 'No recent matches available',
        saved: 0,
        failed: 0,
      });
    }

    const formattedMatches = matches
      .map(formatMatch)
      .filter(match => match !== null);

    const filteredMatches = filterMatches(formattedMatches);
    const recentMatches = filteredMatches.filter(
      match => match.matchEnded === true
    );

    const { saveRecentMatches } = require('../utils/storeMatches');
    const result = await saveRecentMatches(recentMatches);

    res.json({
      message: `Saved recent completed matches to database`,
      total: recentMatches.length,
      ...result,
    });
  } catch (err) {
    console.error('Error saving recent matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to save recent matches',
    });
  }
});


// Get database stats
router.get('/stats', async (req, res) => {
  try {
    const { getStats } = require('../utils/storeMatches');
    const stats = await getStats();
    
    res.json({
      success: true,
      ...stats,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({
      error: err.message || 'Failed to fetch stats',
    });
  }
});

// Cleanup old matches
router.delete('/cleanup', async (req, res) => {
  try {
    const { deleteOldMatches } = require('../utils/storeMatches');
    const days = parseInt(req.query.days) || 30;
    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - days);
    
    const deleted = await deleteOldMatches(beforeDate);
    
    res.json({
      message: `Deleted ${deleted} matches older than ${days} days`,
      deleted,
    });
  } catch (err) {
    console.error('Error cleaning up matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to cleanup matches',
    });
  }
});

// Get saved matches from database
router.get('/saved', async (req, res) => {
  try {
    const savedMatches = await Match.find().sort({ date: -1 });
    
    res.json({
      count: savedMatches.length,
      matches: savedMatches,
    });
  } catch (err) {
    console.error('Error fetching saved matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to fetch saved matches',
    });
  }
});

module.exports = router;