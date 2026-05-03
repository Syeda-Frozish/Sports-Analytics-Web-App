const express = require('express');
const router = express.Router();

const { getCurrentMatches } = require('../services/cricApi');
const formatMatch = require('../utils/formatMatch');
const filterMatches = require('../utils/filterMatches');
const {
  analyzeApiResponse,
  analyzeFormattedMatches,
  analyzeFilteredMatches,
} = require('../utils/debugMatches');

/**
 * DEBUG ENDPOINT - Test and troubleshoot the entire pipeline
 * Shows raw API data, formatted data, filtered data, and detailed analysis
 * Visit: http://localhost:5000/api/debug/analyze
 */
router.get('/analyze', async (req, res) => {
  try {
    console.log('\n' + '█'.repeat(80));
    console.log('🔍 MATCH SYSTEM DEBUG - Starting');
    console.log('█'.repeat(80));

    // Step 1: Get raw data from API
    console.log('\n📡 STEP 1: Fetching data from CricAPI...');
    const rawMatches = await getCurrentMatches();
    analyzeApiResponse(rawMatches);

    // Step 2: Format matches
    console.log('🎨 STEP 2: Formatting matches...');
    const formattedMatches = rawMatches
      .map(formatMatch)
      .filter(match => match !== null);
    analyzeFormattedMatches(formattedMatches, rawMatches);

    // Step 3: Filter for major matches
    console.log('🎯 STEP 3: Filtering for major matches...');
    const filteredMatches = filterMatches(formattedMatches);

    // Step 4: Categorize by status
    console.log('📊 STEP 4: Categorizing by match status...');
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

    console.log('█'.repeat(80));
    console.log('✅ DEBUG COMPLETE');
    console.log('█'.repeat(80) + '\n');

    // Return detailed response
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
      rawSample: rawMatches.slice(0, 1),
      formattedSample: formattedMatches.slice(0, 1),
      filteredSample: filteredMatches.slice(0, 1),
      live: liveMatches,
      recent: recentMatches,
      upcoming: upcomingMatches,
    });
  } catch (err) {
    console.error('❌ Debug endpoint error:', err);
    res.status(500).json({
      error: err.message || 'Debug failed',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

module.exports = router;
