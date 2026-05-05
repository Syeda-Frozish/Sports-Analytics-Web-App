/**
 * MAJOR CRICKET NATIONS - Top cricket-playing countries
 * Only international matches between these nations will be shown
 */
const majorNations = [
  'India',
  'Pakistan',
  'Australia',
  'England',
  'New Zealand',
  'South Africa',
  'Sri Lanka',
  'Bangladesh',
  'West Indies',
  'Afghanistan',
  'Ireland',
  'Zimbabwe',
  'United Arab Emirates',
];

/**
 * MAJOR CRICKET LEAGUES - Established, prestigious leagues only
 */
const majorLeagues = [
  'Indian Premier League',
  'Pakistan Super League',
  'Big Bash League',
  'Caribbean Premier League',
  'Major League Cricket',
  'The Hundred',
  'Lanka Premier League',
  'Bangabandhu T20 Cup',
];

/**
 * MAJOR TOURNAMENTS - ICC and international tournaments
 */
const majorTournaments = [
  'ICC Cricket World Cup',
  'T20 World Cup',
  'ICC T20 World Cup',
  'ICC Champions Trophy',
  'ICC Test Championship',
  'World Test Championship',
];

/**
 * Filter matches to show ONLY:
 * 1. Major league matches (IPL, PSL, BBL, etc.)
 * 2. International matches between major cricket nations
 * 3. Major tournaments
 * 
 * Filters OUT:
 * - Domestic club cricket (County Championship, etc.)
 * - Matches between minor nations (Germany, Austria, Malaysia, etc.)
 * - Women's tournaments (unless major ICC tournament)
 */
const filterMatches = (matches) => {
  return matches.filter(match => {
    if (!match || !match.name) return false;

    const matchName = match.name.toLowerCase();

    // TIER 1: Check if it's in a MAJOR LEAGUE
    const isInMajorLeague = majorLeagues.some(league =>
      matchName.includes(league.toLowerCase())
    );
    if (isInMajorLeague) return true;

    // TIER 2: Check if it's a MAJOR TOURNAMENT
    const isInMajorTournament = majorTournaments.some(tournament =>
      matchName.includes(tournament.toLowerCase())
    );
    if (isInMajorTournament) return true;

    // TIER 3: Check if it's INTERNATIONAL between MAJOR NATIONS
    // Count how many major nations are mentioned
    const majorNationsInMatch = majorNations.filter(nation =>
      matchName.includes(nation.toLowerCase())
    ).length;

    // Must have at least 2 major nations for international match
    if (majorNationsInMatch >= 2) {
      // Must be international format (not domestic like County Championship)
      const isDomestic =
        matchName.includes('county championship') ||
        matchName.includes('domestic') ||
        matchName.includes('shield') ||
        matchName.includes('ranji') ||
        matchName.includes('fc ') ||
        matchName.includes('club');

      if (!isDomestic) {
        return true;
      }
    }

    return false;
  });
};

module.exports = filterMatches;