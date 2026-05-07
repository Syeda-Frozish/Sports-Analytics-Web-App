const express = require('express');
const router = express.Router();

const { getCurrentMatches } = require('../services/cricApi1');
const { getUpcomingMatches } = require('../services/cricApi2');
const formatMatch = require('../utils/formatMatch');
const formatUpcomingMatch = require('../utils/formatUpcomingMatch');
const filterMatches = require('../utils/filterMatches');
const Match = require('../models/cricketMatch');
const { setCache, getCache } = require('../utils/cache');
const {
  analyzeApiResponse,
  analyzeFormattedMatches,
  analyzeFilteredMatches,
  analyzeUpcomingMatchesApi,
  compareApis,
  recommendApiUsage,
} = require('../utils/debugMatches');
// Show cache status for live and upcoming endpoints
router.get('/cache', (req, res) => {
  const liveMajor = getCache('live_major');
  const upcomingMajor = getCache('upcoming_major');
  res.json({
    live_major: liveMajor ? 'HIT' : 'MISS',
    upcoming_major: upcomingMajor ? 'HIT' : 'MISS',
    live_major_data: liveMajor,
    upcoming_major_data: upcomingMajor,
  });
});

// Show recent DB writes (recent matches)
router.get('/cron-status', async (req, res) => {
  try {
    const recent = await Match.find({ matchEnded: true }).sort({ updatedAt: -1 }).limit(5);
    res.json({
      recentSaved: recent.length,
      recent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DEBUG ENDPOINT - Test and troubleshoot the entire pipeline
 * Shows raw API data, formatted data, filtered data, and detailed analysis
 * Visit: http://localhost:5000/api/debug/analyze
 */
router.get('/analyze', async (req, res) => {
  try {
    const rawMatches = await getCurrentMatches();
    analyzeApiResponse(rawMatches);
    const formattedMatches = rawMatches.map(formatMatch).filter(match => match !== null);
    analyzeFormattedMatches(formattedMatches, rawMatches);
    const filteredMatches = filterMatches(formattedMatches);
    const liveMatches = filteredMatches.filter(match => match.status === 'live' || (match.matchStarted && !match.matchEnded));
    const recentMatches = filteredMatches.filter(match => match.matchEnded);
    const upcomingMatches = filteredMatches.filter(match => !match.matchStarted && !match.matchEnded);
    analyzeFilteredMatches(filteredMatches, formattedMatches, liveMatches, recentMatches, upcomingMatches);
    res.json({
      summary: {
        apiMatches: rawMatches.length,
        formattedMatches: formattedMatches.length,
        failedToFormat: rawMatches.length - formattedMatches.length,
        majorMatches: filteredMatches.length,
        liveMatches: liveMatches.length,
        recentMatches: recentMatches.length,
        upcomingMatches: upcomingMatches.length,
      },
      samples: {
        raw: rawMatches.slice(0, 2),
        formatted: formattedMatches.slice(0, 2),
        filtered: filteredMatches.slice(0, 2),
        live: liveMatches.slice(0, 2),
        recent: recentMatches.slice(0, 2),
        upcoming: upcomingMatches.slice(0, 2),
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Debug failed' });
  }
});

// for debugging both APIs

// Debug: Test OLD API
router.get('/old-api', async (req, res) => {
  try {
    const rawMatches = await getCurrentMatches();
    analyzeApiResponse(rawMatches);
    const formattedMatches = rawMatches.map(formatMatch).filter(match => match !== null);
    analyzeFormattedMatches(formattedMatches, rawMatches);
    const filteredMatches = filterMatches(formattedMatches);
    const liveMatches = filteredMatches.filter(match => match.status === 'live' || (match.matchStarted && !match.matchEnded));
    const recentMatches = filteredMatches.filter(match => match.matchEnded);
    const upcomingMatches = filteredMatches.filter(match => !match.matchStarted && !match.matchEnded);
    analyzeFilteredMatches(filteredMatches, formattedMatches, liveMatches, recentMatches, upcomingMatches);
    res.json({
      stats: {
        totalRaw: rawMatches.length,
        totalFormatted: formattedMatches.length,
        totalFiltered: filteredMatches.length,
        live: liveMatches.length,
        recent: recentMatches.length,
        upcoming: upcomingMatches.length,
      },
      samples: {
        raw: rawMatches.slice(0, 2),
        formatted: formattedMatches.slice(0, 2),
        filtered: filteredMatches.slice(0, 2),
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug: Test NEW API
router.get('/new-api', async (req, res) => {
  try {
    const rawMatches = await getUpcomingMatches();
    analyzeUpcomingMatchesApi(rawMatches);
    const formattedMatches = rawMatches.map(formatUpcomingMatch).filter(match => match !== null);
    analyzeFormattedMatches(formattedMatches, rawMatches);
    const filteredMatches = filterMatches(formattedMatches);
    const liveMatches = filteredMatches.filter(match => match.matchStarted && !match.matchEnded);
    const recentMatches = filteredMatches.filter(match => match.matchEnded);
    const upcomingMatches = filteredMatches.filter(match => !match.matchStarted && !match.matchEnded);
    analyzeFilteredMatches(filteredMatches, formattedMatches, liveMatches, recentMatches, upcomingMatches);
    res.json({
      stats: {
        totalRaw: rawMatches.length,
        totalFormatted: formattedMatches.length,
        totalFiltered: filteredMatches.length,
        live: liveMatches.length,
        recent: recentMatches.length,
        upcoming: upcomingMatches.length,
      },
      samples: {
        raw: rawMatches.slice(0, 2),
        formatted: formattedMatches.slice(0, 2),
        filtered: filteredMatches.slice(0, 2),
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug: Compare both APIs
router.get('/compare', async (req, res) => {
  try {
    const oldApiData = await getCurrentMatches();
    const newApiData = await getUpcomingMatches();
    compareApis(oldApiData, newApiData);
    recommendApiUsage();
    res.json({
      stats: {
        oldApiMatches: oldApiData.length,
        newApiMatches: newApiData.length,
      },
      samples: {
        oldApi: oldApiData.slice(0, 2),
        newApi: newApiData.slice(0, 2),
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
