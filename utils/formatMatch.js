const formatMatch = (match) => {
  return {
    id: match.id,
    name: match.name,
    format: match.matchType,
    status: match.status,
    venue: match.venue,
    date: match.date,

    teamA: {
      name: match.teamInfo?.[0]?.name || null,
      short: match.teamInfo?.[0]?.shortname || null,
      logo: match.teamInfo?.[0]?.img || null,
    },

    teamB: {
      name: match.teamInfo?.[1]?.name || null,
      short: match.teamInfo?.[1]?.shortname || null,
      logo: match.teamInfo?.[1]?.img || null,
    },

    score: match.score?.map((inning) => ({
      runs: inning.r,
      wickets: inning.w,
      overs: inning.o,
      inning: inning.inning,
    })) || [],

    matchStarted: match.matchStarted,
    matchEnded: match.matchEnded,
  };
};

module.exports = formatMatch;