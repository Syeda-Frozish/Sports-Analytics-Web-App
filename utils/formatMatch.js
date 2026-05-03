const formatMatch = (match) => {
  try {
    // Validate required fields
    if (!match || !match.id || !match.name) {
      return null;
    }

    const teamInfo = Array.isArray(match.teamInfo) ? match.teamInfo : [];
    const scoreData = Array.isArray(match.score) ? match.score : [];

    return {
      id: match.id,
      name: match.name || 'Unknown Match',
      format: match.matchType || 'Unknown',
      status: match.status || 'scheduled',
      venue: match.venue || 'Unknown Venue',
      date: match.date || null,

      teamA: {
        name: teamInfo[0]?.name || null,
        short: teamInfo[0]?.shortname || null,
        logo: teamInfo[0]?.img || null,
      },

      teamB: {
        name: teamInfo[1]?.name || null,
        short: teamInfo[1]?.shortname || null,
        logo: teamInfo[1]?.img || null,
      },

      score: scoreData.map((inning) => ({
        runs: inning.r || 0,
        wickets: inning.w || 0,
        overs: inning.o || '0.0',
        inning: inning.inning || null,
      })),

      matchStarted: match.matchStarted || false,
      matchEnded: match.matchEnded || false,
    };
  } catch (error) {
    console.error('Error formatting match:', error);
    return null;
  }
};

module.exports = formatMatch;