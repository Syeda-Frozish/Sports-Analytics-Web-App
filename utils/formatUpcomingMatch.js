/**
 * FORMAT UPCOMING MATCH
 * Converts new upcomingMatches API response to standard match format
 * 
 * NEW API STRUCTURE (incoming):
 * {
 *   id, dateTimeGMT, matchType, status, ms, t1, t2, t1s, t2s, t1img, t2img, series
 * }
 * 
 * STANDARD FORMAT (outgoing):
 * {
 *   id, name, format, status, venue, date,
 *   teamA: {name, short, logo}, teamB: {name, short, logo},
 *   score: [{runs, wickets, overs, inning}],
 *   matchStarted, matchEnded
 * }
 */

const formatUpcomingMatch = (match) => {
  try {
    // Validate required fields
    if (!match || !match.id || !match.t1 || !match.t2) {
      return null;
    }

    // Parse team names (format: "Team Name [CODE]")
    const parseTeamName = (teamString) => {
      if (!teamString) return { name: null, short: null };
      
      const match = teamString.match(/^(.+?)\s*\[(.+?)\]$/);
      if (match) {
        return {
          name: match[1].trim(),
          short: match[2].trim(),
        };
      }
      
      // Fallback if no brackets found
      return {
        name: teamString,
        short: teamString.substring(0, 3).toUpperCase(),
      };
    };

    const teamA = parseTeamName(match.t1);
    const teamB = parseTeamName(match.t2);

    // Determine match status and started/ended flags
    const getMatchStatus = (msStatus, matchType) => {
      const ms = msStatus?.toLowerCase() || '';
      
      if (ms === 'live') {
        return {
          status: 'live',
          matchStarted: true,
          matchEnded: false,
        };
      }
      
      if (ms === 'result') {
        return {
          status: 'completed',
          matchStarted: true,
          matchEnded: true,
        };
      }
      
      // fixture or unknown = upcoming/scheduled
      return {
        status: 'scheduled',
        matchStarted: false,
        matchEnded: false,
      };
    };

    const statusInfo = getMatchStatus(match.ms, match.matchType);

    // Parse scores if available
    const parseScores = (t1Score, t2Score) => {
      const scores = [];
      
      // Team A score
      if (t1Score && t1Score.trim()) {
        const match = t1Score.match(/^(\d+)\/(\d+)\s*\((\d+(?:\.\d+)?)\)/);
        if (match) {
          scores.push({
            runs: parseInt(match[1]),
            wickets: parseInt(match[2]),
            overs: match[3],
            inning: 'team_a',
          });
        }
      }
      
      // Team B score
      if (t2Score && t2Score.trim()) {
        const match = t2Score.match(/^(\d+)\/(\d+)\s*\((\d+(?:\.\d+)?)\)/);
        if (match) {
          scores.push({
            runs: parseInt(match[1]),
            wickets: parseInt(match[2]),
            overs: match[3],
            inning: 'team_b',
          });
        }
      }
      
      return scores;
    };

    // Create match name
    const matchName = `${teamA.short || 'TBA'} vs ${teamB.short || 'TBA'} - ${match.series || 'Unknown'}`;

    // Parse date
    let matchDate = null;
    if (match.dateTimeGMT) {
      try {
        matchDate = new Date(match.dateTimeGMT);
      } catch (e) {
        console.warn('Failed to parse date:', match.dateTimeGMT);
      }
    }

    return {
      id: match.id,
      name: matchName,
      format: match.matchType || 'unknown',
      status: statusInfo.status,
      venue: null, // ⚠️ NOT available in new API
      date: matchDate,
      
      teamA: {
        name: teamA.name,
        short: teamA.short,
        logo: match.t1img || null,
      },
      
      teamB: {
        name: teamB.name,
        short: teamB.short,
        logo: match.t2img || null,
      },
      
      score: parseScores(match.t1s, match.t2s),
      
      matchStarted: statusInfo.matchStarted,
      matchEnded: statusInfo.matchEnded,
      
      // Additional fields from new API
      series: match.series || null,
      rawStatus: match.status || null, // Human-readable status from API
    };
  } catch (error) {
    console.error('Error formatting upcoming match:', error);
    return null;
  }
};

module.exports = formatUpcomingMatch;
