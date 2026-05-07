// Cron job to fetch and save recent matches every 5 minutes
const cron = require('node-cron');
const { getCurrentMatches } = require('../services/cricApi1');
const formatMatch = require('../utils/formatMatch');
const filterMatches = require('../utils/filterMatches');
const { saveRecentMatches } = require('../utils/storeMatches');

async function fetchAndSaveRecentMatches() {
  try {
    const matches = await getCurrentMatches();
    if (!matches || matches.length === 0) {
      console.log('[CRON] No recent matches found');
      return;
    }
    const formattedMatches = matches
      .map(formatMatch)
      .filter(match => match !== null);
    const filteredMatches = filterMatches(formattedMatches);
    const recentMatches = filteredMatches.filter(match => match.matchEnded === true);
    const result = await saveRecentMatches(recentMatches);
    console.log(`[CRON] Saved ${result.saved} recent matches, failed: ${result.failed}`);
  } catch (err) {
    console.error('[CRON] Error saving recent matches:', err);
  }
}

// Schedule every 60 minutes
cron.schedule('*/60 * * * *', fetchAndSaveRecentMatches);

// Run once on startup
fetchAndSaveRecentMatches();
