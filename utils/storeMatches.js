/**
 * Database Storage Utility
 * Handles storing cricket matches in MongoDB
 * 
 * Uses the NEW API (cricScore) because:
 * - Returns 96 matches vs 25 from old API
 * - Has 21 recent matches vs 11 from old API
 * - More data to preserve in your database
 */

const Match = require('../models/cricketMatch');

/**
 * Save recently completed matches to database
 * Automatically handles duplicates with upsert
 */
const saveRecentMatches = async (recentMatches) => {
  let saved = 0;
  let failed = 0;
  const errors = [];

  const { getSeriesById } = require('../services/cricSeriesApi');
  const { normalizeSeries } = require('./formatSeries');

  // Simple in-memory cache to avoid calling the same seriesId multiple times in one run.
  const seriesCache = new Map();

  for (const match of recentMatches) {
    try {
      // Use updateOne with upsert to prevent duplicate key errors
      const result = await Match.updateOne(
        { matchId: match.id },
        {
          matchId: match.id,
          name: match.name,
          format: match.format,
          status: match.status,
          venue: match.venue,
          date: match.date,
          teamA: match.teamA,
          teamB: match.teamB,
          score: match.score,
          matchStarted: match.matchStarted,
          matchEnded: match.matchEnded,

          // Series enrichment (optional)
          seriesId: match.seriesId || null,
          series: (() => {
            // Note: This is replaced below by enrichment result.
            return match.series || null;
          })(),
        },
        { upsert: true }
      );
      
      if (result.modifiedCount > 0 || result.upsertedCount > 0) {
        saved++;
      }

      // Enrich series after successful upsert (or even before, but keep it simple).
      // If seriesId is present, fetch series info and update doc.
      if (match.seriesId) {
        const seriesId = String(match.seriesId);
        let cached = seriesCache.get(seriesId);
        if (cached === undefined) {
          const rawSeries = await getSeriesById(seriesId);
          cached = normalizeSeries(rawSeries);
          seriesCache.set(seriesId, cached);
        }

        if (cached) {
          await Match.updateOne(
            { matchId: match.id },
            {
              $set: {
                seriesId,
                series: cached,
              },
            }
          );
        }
      }
    } catch (err) {
      failed++;
      errors.push({
        matchId: match.id,
        name: match.name,
        error: err.message,
      });
      console.error(`Failed to save match ${match.id}:`, err.message);
    }
  }

  return { saved, failed, errors };
};

/**
 * Get recently completed matches from database
 */
const getRecentMatches = async (limit = 50) => {
  try {
    return await Match.find({ matchEnded: true })
      .sort({ date: -1 })
      .limit(limit);
  } catch (err) {
    console.error('Error fetching recent matches:', err);
    return [];
  }
};

/**
 * Get upcoming matches from database
 */
const getUpcomingMatches = async (limit = 50) => {
  try {
    return await Match.find({ matchStarted: false, matchEnded: false })
      .sort({ date: 1 })
      .limit(limit);
  } catch (err) {
    console.error('Error fetching upcoming matches:', err);
    return [];
  }
};

/**
 * Get live matches from database
 */
const getLiveMatches = async () => {
  try {
    return await Match.find({ matchStarted: true, matchEnded: false });
  } catch (err) {
    console.error('Error fetching live matches:', err);
    return [];
  }
};

/**
 * Delete old matches from database (cleanup)
 * @param {Date} beforeDate - Delete matches before this date
 */
const deleteOldMatches = async (beforeDate) => {
  try {
    const result = await Match.deleteMany({ date: { $lt: beforeDate } });
    return result.deletedCount;
  } catch (err) {
    console.error('Error deleting old matches:', err);
    return 0;
  }
};

/**
 * Get database statistics
 */
const getStats = async () => {
  try {
    const total = await Match.countDocuments();
    const completed = await Match.countDocuments({ matchEnded: true });
    const upcoming = await Match.countDocuments({
      matchStarted: false,
      matchEnded: false,
    });
    const live = await Match.countDocuments({
      matchStarted: true,
      matchEnded: false,
    });

    return { total, completed, upcoming, live };
  } catch (err) {
    console.error('Error getting stats:', err);
    return { total: 0, completed: 0, upcoming: 0, live: 0 };
  }
};

const saveUpcomingMatches = async (upcomingMatches) => {
  let saved = 0;
  let failed = 0;
  const errors = [];

  for (const match of upcomingMatches) {
    try {
      const result = await Match.updateOne(
        { matchId: match.id },
        {
          matchId: match.id,
          name: match.name,
          format: match.format,
          status: match.status,
          venue: match.venue,
          date: match.date,
          teamA: match.teamA,
          teamB: match.teamB,
          score: match.score,
          matchStarted: match.matchStarted,
          matchEnded: match.matchEnded,
          series: match.series,
        },
        { upsert: true }
      );
      
      if (result.modifiedCount > 0 || result.upsertedCount > 0) {
        saved++;
      }
    } catch (err) {
      failed++;
      errors.push({
        matchId: match.id,
        name: match.name,
        error: err.message,
      });
      console.error(`Failed to save upcoming match ${match.id}:`, err.message);
    }
  }

  return { saved, failed, errors };
};

module.exports = {
  saveRecentMatches,
  getRecentMatches,
  getUpcomingMatches,
  getLiveMatches,
  deleteOldMatches,
  getStats,
};

