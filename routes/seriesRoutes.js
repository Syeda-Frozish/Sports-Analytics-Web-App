const express = require('express');
const router = express.Router();

const { getSeriesById } = require('../services/cricSeriesApi');
const { getUpcomingSeries } = require('../services/cricUpcomingSeriesApi');
const { normalizeSeries } = require('../utils/formatSeries');
const Series = require('../models/cricketSeries');

// GET /api/series/upcoming
router.get('/upcoming', async (req, res) => {
  try {
    const series = await getUpcomingSeries();
    const normalizedSeries = (series || []).map(s => normalizeSeries(s)).filter(Boolean);
    
    // Save series to DB
    for (const s of normalizedSeries) {
      await Series.updateOne({ seriesId: s.seriesId }, s, { upsert: true });
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
    
    const data = await getSeriesById(seriesId);
    console.log('[Route] Got data:', !!data, Object.keys(data || {}));
    
    if (!data) {
      return res.status(404).json({ error: 'Series not found' });
    }

    console.log('[Route] data.info keys:', Object.keys(data.info || {}));
    console.log('[Route] data.matchList:', data.matchList ? `${data.matchList.length} matches` : 'undefined');

    // Pass the info with matchList attached
    const infoWithMatches = {
      ...data.info,
      matchList: data.matchList,
    };
    
    console.log('[Route] infoWithMatches keys:', Object.keys(infoWithMatches));
    console.log('[Route] infoWithMatches.matchList:', infoWithMatches.matchList ? `${infoWithMatches.matchList.length}` : 'undefined');
    
    const normalized = normalizeSeries(infoWithMatches);
    console.log('[Route] Normalized keys:', Object.keys(normalized));
    console.log('[Route] Normalized.matchList:', normalized.matchList ? `${normalized.matchList.length}` : 'undefined');
    
    // Save series to DB with matchList
    await Series.updateOne({ seriesId: normalized.seriesId }, normalized, { upsert: true });

    console.log('[Route] Sending response with keys:', Object.keys(normalized));
    res.json({ series: normalized });
  } catch (err) {
    console.error('[Route] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch series details' });
  }
});

module.exports = router;

