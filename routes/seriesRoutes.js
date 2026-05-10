const express = require('express');
const router = express.Router();

const { getSeriesById } = require('../services/cricSeriesApi');
const { getUpcomingSeries } = require('../services/cricUpcomingSeriesApi');
const { normalizeSeries } = require('../utils/formatSeries');

const seriesCache = new Map();
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

// GET /api/series/upcoming
router.get('/upcoming', async (req, res) => {
  try {
    const { format, status, search } = req.query;
    const series = await getUpcomingSeries(search);
    let normalizedSeries = (series || []).map(s => normalizeSeries(s)).filter(Boolean);

    // Sort ascendingly by startDate (nearer first)
    normalizedSeries.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Global filter: exclude series that have ended based strictly on Month/Day
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentMonthIndex = now.getMonth(); // 0-11
    const currentDay = now.getDate();

    normalizedSeries = normalizedSeries.filter(s => {
      // Parse end date strictly by month name and day number, ignoring year
      let endMonthStr = '';
      let endDayNum = 0;

      const parts = (s.endDate || '').split(/[\s,]+/);
      const mIdx = MONTHS.findIndex(m => m.toLowerCase() === (parts[0] || '').toLowerCase());

      if (mIdx !== -1) {
        endMonthStr = parts[0];
        endDayNum = parseInt(parts[1], 10);
      } else {
        // fallback if format is standard Date string like 2024-10-21
        const parsed = new Date(s.endDate);
        if (!isNaN(parsed.getTime())) {
          endMonthStr = MONTHS[parsed.getMonth()];
          endDayNum = parsed.getDate();
        }
      }

      const endMonthIndex = MONTHS.findIndex(m => m.toLowerCase() === endMonthStr.toLowerCase());

      // If we completely failed to parse the month, keep the series just in case
      if (endMonthIndex === -1) return true;

      if (currentMonthIndex < endMonthIndex) {
        return true; // Current month is before end month -> Show
      } else if (currentMonthIndex === endMonthIndex) {
        return currentDay <= endDayNum; // Same month -> Show if current day <= end day
      }

      return false; // Current month > end month -> Don't show
    });

    // Filter by format
    if (format && format !== 'all') {
      normalizedSeries = normalizedSeries.filter(s => {
        const isT20 = s.t20 > 0;
        const isOdi = s.odi > 0;
        const isTest = s.test > 0;
        const formatsCount = (isT20 ? 1 : 0) + (isOdi ? 1 : 0) + (isTest ? 1 : 0);

        if (format === 't20') return isT20 && formatsCount === 1;
        if (format === 'odi') return isOdi && formatsCount === 1;
        if (format === 'test') return isTest && formatsCount === 1;
        if (format === 'multiformat') return formatsCount > 1;
        return true;
      });
    }

    // Filter by status (live vs upcoming)
    if (status && status !== 'all') {
      normalizedSeries = normalizedSeries.filter(s => {
        const startDate = new Date(s.startDate);

        if (status === 'live') {
          return startDate <= now;
        } else if (status === 'upcoming') {
          return startDate > now;
        }
        return true;
      });
    }

    res.json({
      count: normalizedSeries.length,
      series: normalizedSeries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch upcoming series' });
  }
});

// GET /api/series/:seriesId
router.get('/:seriesId', async (req, res) => {
  try {
    const { seriesId } = req.params;
    console.log('[Route] Fetching series:', seriesId);

    // Check in-memory cache first
    const cachedItem = seriesCache.get(seriesId);
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_DURATION_MS)) {
      console.log('[Cache] Using in-memory cache for series:', seriesId);
      return res.json({ series: cachedItem.data });
    }

    const data = await getSeriesById(seriesId);
    console.log('[Route] Got data:', !!data, Object.keys(data || {}));

    if (!data) {
      return res.status(404).json({ error: 'Series not found' });
    }

    console.log('[Route] data.info keys:', Object.keys(data.info || {}));
    console.log('[Route] data.matchList:', data.matchList ? `${data.matchList.length} matches` : 'undefined');

    // Pass the info with matchList attached and sorted chronologically
    const infoWithMatches = {
      ...data.info,
      matchList: data.matchList
        ? data.matchList.sort((a, b) => new Date(a.dateTimeGMT) - new Date(b.dateTimeGMT))
        : [],
    };

    console.log('[Route] infoWithMatches keys:', Object.keys(infoWithMatches));
    console.log('[Route] infoWithMatches.matchList:', infoWithMatches.matchList ? `${infoWithMatches.matchList.length}` : 'undefined');

    const normalized = normalizeSeries(infoWithMatches);
    console.log('[Route] Normalized keys:', Object.keys(normalized));
    console.log('[Route] Normalized.matchList:', normalized.matchList ? `${normalized.matchList.length}` : 'undefined');

    // Save to in-memory cache
    seriesCache.set(seriesId, {
      data: normalized,
      timestamp: Date.now()
    });

    console.log('[Route] Sending response with keys:', Object.keys(normalized));
    res.json({ series: normalized });
  } catch (err) {
    console.error('[Route] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch series details' });
  }
});

module.exports = router;

