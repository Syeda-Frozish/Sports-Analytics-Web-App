const express = require('express');
const router = express.Router();

const { getCurrentMatches } = require('../services/cricApi1');
const { getUpcomingMatches } = require('../services/cricApi2');
const formatMatch = require('../utils/formatMatch');
const formatUpcomingMatch = require('../utils/formatUpcomingMatch');
const filterMatches = require('../utils/filterMatches');
const Match = require('../models/Match');


// Live matches
router.get('/live', async (req, res) => {
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
    const liveMatches = filteredMatches.filter(match => match.status === 'live' || (match.matchStarted && !match.matchEnded));

    res.json({
      count: liveMatches.length,
      filter: req.query.filter || 'major',
      matches: liveMatches,
    });
  } catch (err) {
    console.error('Error fetching live matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to fetch live matches',
    });
  }
});


// Completed/Recent matches - Using NEW API
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


// Upcoming matches  
router.get('/upcoming', async (req, res) => {
  try {
    const filterMode = req.query.filter === 'all' ? null : filterMatches;
    
    const matches = await getUpcomingMatches();

    if (!matches || matches.length === 0) {
      return res.json({
        count: 0,
        filter: req.query.filter || 'major',
        matches: [],
      });
    }

    const formattedMatches = matches
      .map(formatUpcomingMatch)
      .filter(match => match !== null);

    const filteredMatches = filterMode ? filterMode(formattedMatches) : formattedMatches;
    const upcomingMatches = filteredMatches.filter(
      match => !match.matchStarted && !match.matchEnded
    );

    res.json({
      count: upcomingMatches.length,
      filter: req.query.filter || 'major',
      matches: upcomingMatches,
    });
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


// Save upcoming matches to database
router.post('/save-upcoming', async (req, res) => {
  try {
    const matches = await getUpcomingMatches();

    if (!matches || matches.length === 0) {
      return res.json({
        message: 'No upcoming matches available',
        saved: 0,
        failed: 0,
      });
    }

    const formattedMatches = matches
      .map(formatUpcomingMatch)
      .filter(match => match !== null);

    const filteredMatches = filterMatches(formattedMatches);
    const upcomingMatches = filteredMatches.filter(
      match => !match.matchStarted && !match.matchEnded
    );

    const { saveUpcomingMatches } = require('../utils/storeMatches');
    const result = await saveUpcomingMatches(upcomingMatches);

    res.json({
      message: `Saved upcoming matches to database`,
      total: upcomingMatches.length,
      ...result,
    });
  } catch (err) {
    console.error('Error saving upcoming matches:', err);
    res.status(500).json({
      error: err.message || 'Failed to save upcoming matches',
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


// Add these BEFORE module.exports = router;

// Debug: Test OLD API
router.get('/debug/old-api', async (req, res) => {
  try {
    const { getCurrentMatches } = require('../services/cricApi1');
    const {
      analyzeApiResponse,
      analyzeFormattedMatches,
      analyzeFilteredMatches,
    } = require('../utils/debugMatches');
    const formatMatch = require('../utils/formatMatch');
    const filterMatches = require('../utils/filterMatches');

    console.log('\n\n🔍 TESTING OLD API (currentMatches)\n');
    
    const rawMatches = await getCurrentMatches();
    analyzeApiResponse(rawMatches);

    const formattedMatches = rawMatches
      .map(formatMatch)
      .filter(match => match !== null);
    analyzeFormattedMatches(formattedMatches, rawMatches);

    const filteredMatches = filterMatches(formattedMatches);
    const liveMatches = filteredMatches.filter(
      match => match.status === 'live' || (match.matchStarted && !match.matchEnded)
    );
    const recentMatches = filteredMatches.filter(match => match.matchEnded);
    const upcomingMatches = filteredMatches.filter(
      match => !match.matchStarted && !match.matchEnded
    );

    analyzeFilteredMatches(
      filteredMatches,
      formattedMatches,
      liveMatches,
      recentMatches,
      upcomingMatches
    );

    res.json({
      message: '✅ Debug output sent to server console',
      stats: {
        totalRaw: rawMatches.length,
        totalFormatted: formattedMatches.length,
        totalFiltered: filteredMatches.length,
        live: liveMatches.length,
        recent: recentMatches.length,
        upcoming: upcomingMatches.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug: Test NEW API
router.get('/debug/new-api', async (req, res) => {
  try {
    const { getUpcomingMatches } = require('../services/cricApi2');
    const {
      analyzeUpcomingMatchesApi,
      analyzeFormattedMatches,
      analyzeFilteredMatches,
    } = require('../utils/debugMatches');
    const formatUpcomingMatch = require('../utils/formatUpcomingMatch');
    const filterMatches = require('../utils/filterMatches');

    console.log('\n\n🔍 TESTING NEW API (upcomingMatches)\n');
    
    const rawMatches = await getUpcomingMatches();
    analyzeUpcomingMatchesApi(rawMatches);

    const formattedMatches = rawMatches
      .map(formatUpcomingMatch)
      .filter(match => match !== null);
    analyzeFormattedMatches(formattedMatches, rawMatches);

    const filteredMatches = filterMatches(formattedMatches);
    const liveMatches = filteredMatches.filter(
      match => match.matchStarted && !match.matchEnded
    );
    const recentMatches = filteredMatches.filter(match => match.matchEnded);
    const upcomingMatches = filteredMatches.filter(
      match => !match.matchStarted && !match.matchEnded
    );

    analyzeFilteredMatches(
      filteredMatches,
      formattedMatches,
      liveMatches,
      recentMatches,
      upcomingMatches
    );

    res.json({
      message: '✅ Debug output sent to server console',
      stats: {
        totalRaw: rawMatches.length,
        totalFormatted: formattedMatches.length,
        totalFiltered: filteredMatches.length,
        live: liveMatches.length,
        recent: recentMatches.length,
        upcoming: upcomingMatches.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug: Compare both APIs
router.get('/debug/compare', async (req, res) => {
  try {
    const { getCurrentMatches } = require('../services/cricApi1');
    const { getUpcomingMatches } = require('../services/cricApi2');
    const {
      compareApis,
      recommendApiUsage,
    } = require('../utils/debugMatches');

    console.log('\n\n🔍 COMPARING BOTH APIs\n');
    
    const oldApiData = await getCurrentMatches();
    const newApiData = await getUpcomingMatches();

    compareApis(oldApiData, newApiData);
    recommendApiUsage();

    res.json({
      message: '✅ Comparison output sent to server console',
      stats: {
        oldApiMatches: oldApiData.length,
        newApiMatches: newApiData.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;