// Normalizes series payloads into a stable shape used by the app.

const normalizeSeries = (seriesInfo) => {
  if (!seriesInfo) return null;

  console.log('[normalizeSeries] Input keys:', Object.keys(seriesInfo));
  console.log('[normalizeSeries] Has matchList input?', !!seriesInfo.matchList);

  // Expected from your sample:
  // { id, name, startdate, enddate, odi, t20, test, squads, matches }
  const result = {
    seriesId: String(seriesInfo.id || seriesInfo.seriesId || ''),
    name: seriesInfo.name || null,

    // CricAPI uses lower-case keys in sample: startdate/enddate
    startDate: seriesInfo.startdate || seriesInfo.startDate || null,
    endDate: seriesInfo.enddate || seriesInfo.endDate || null,

    odi: seriesInfo.odi ?? null,
    t20: seriesInfo.t20 ?? null,
    test: seriesInfo.test ?? null,
    squads: seriesInfo.squads ?? null,
    matches: seriesInfo.matches ?? null,
    
    // Preserve matchList if provided
    ...(seriesInfo.matchList && { matchList: seriesInfo.matchList }),
  };
  
  console.log('[normalizeSeries] Output keys:', Object.keys(result));
  console.log('[normalizeSeries] Has matchList output?', !!result.matchList);
  
  return result;
};

module.exports = {
  normalizeSeries,
};

