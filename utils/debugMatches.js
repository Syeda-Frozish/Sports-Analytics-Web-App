/**
 * Debug utility to inspect match data at each transformation stage
 * Helps identify where data issues occur (API, formatting, filtering)
 */

const debugMatches = (label, data, depth = 2) => {
  console.log('\n' + '='.repeat(60));
  console.log(`DEBUG: ${label}`);
  console.log('='.repeat(60));
  console.log(JSON.stringify(data, null, depth));
  console.log('='.repeat(60) + '\n');
};

const analyzeApiResponse = (rawMatches) => {
  console.log('\n' + '='.repeat(60));
  console.log('API RESPONSE ANALYSIS');
  console.log('='.repeat(60));

  if (!rawMatches || !Array.isArray(rawMatches)) {
    console.log('❌ ERROR: API did not return an array');
    console.log('Type:', typeof rawMatches);
    return;
  }

  console.log(`✅ Total matches from API: ${rawMatches.length}`);

  if (rawMatches.length === 0) {
    console.log('⚠️  WARNING: API returned empty array');
    return;
  }

  // Analyze first match structure
  const firstMatch = rawMatches[0];
  console.log('\n📋 First match structure:');
  console.log('Keys:', Object.keys(firstMatch));

  // Check required fields
  console.log('\n🔍 Required fields check:');
  const requiredFields = ['id', 'name', 'status', 'matchType', 'teamInfo', 'score', 'venue', 'date'];
  requiredFields.forEach(field => {
    const exists = field in firstMatch;
    const hasValue = firstMatch[field] !== undefined && firstMatch[field] !== null;
    console.log(
      `  ${exists ? '✅' : '❌'} ${field}: ${exists ? (hasValue ? '✅ has value' : '⚠️  null/undefined') : 'missing'}`
    );
  });

  // Check team info structure
  console.log('\n👥 Team Info structure:');
  if (Array.isArray(firstMatch.teamInfo) && firstMatch.teamInfo.length > 0) {
    console.log('  Team A keys:', Object.keys(firstMatch.teamInfo[0]));
    console.log('  Team A sample:', JSON.stringify(firstMatch.teamInfo[0], null, 2));
  } else {
    console.log('  ❌ teamInfo is not properly structured');
  }

  // Check score structure
  console.log('\n📊 Score structure:');
  if (Array.isArray(firstMatch.score) && firstMatch.score.length > 0) {
    console.log('  Score keys:', Object.keys(firstMatch.score[0]));
    console.log('  Score sample:', JSON.stringify(firstMatch.score[0], null, 2));
  } else {
    console.log('  ⚠️  No scores available');
  }

  // Analyze match statuses
  console.log('\n📈 Match statuses in API response:');
  const statuses = {};
  rawMatches.forEach(match => {
    const status = match.status || 'undefined';
    statuses[status] = (statuses[status] || 0) + 1;
  });
  Object.entries(statuses).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} matches`);
  });

  // Analyze match types
  console.log('\n🏆 Match types in API response:');
  const types = {};
  rawMatches.forEach(match => {
    const type = match.matchType || 'undefined';
    types[type] = (types[type] || 0) + 1;
  });
  Object.entries(types).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} matches`);
  });

  console.log('='.repeat(60) + '\n');
};

const analyzeFormattedMatches = (formattedMatches, rawMatches) => {
  console.log('\n' + '='.repeat(60));
  console.log('FORMATTING ANALYSIS');
  console.log('='.repeat(60));

  console.log(`✅ Raw matches: ${rawMatches.length}`);
  console.log(`✅ Successfully formatted: ${formattedMatches.length}`);
  console.log(`❌ Failed to format: ${rawMatches.length - formattedMatches.length}`);

  if (formattedMatches.length === 0) {
    console.log('\n⚠️  WARNING: All matches failed to format!');
    console.log('This means the data structure from API does not match expectations');
    return;
  }

  // Show formatted structure
  console.log('\n📋 Formatted match structure:');
  console.log(JSON.stringify(formattedMatches[0], null, 2));

  console.log('='.repeat(60) + '\n');
};

const analyzeFilteredMatches = (
  filteredMatches,
  formattedMatches,
  liveMatches,
  recentMatches,
  upcomingMatches
) => {
  console.log('\n' + '='.repeat(60));
  console.log('FILTERING ANALYSIS');
  console.log('='.repeat(60));

  console.log(`📊 Formatted matches: ${formattedMatches.length}`);
  console.log(`🎯 Major matches (filtered): ${filteredMatches.length}`);
  console.log(`  ├─ Live matches: ${liveMatches.length}`);
  console.log(`  ├─ Recent matches: ${recentMatches.length}`);
  console.log(`  └─ Upcoming matches: ${upcomingMatches.length}`);

  const filterRate = (
    (filteredMatches.length / formattedMatches.length) *
    100
  ).toFixed(2);
  console.log(`\n📈 Filter success rate: ${filterRate}%`);

  if (filteredMatches.length === 0) {
    console.log(
      '\n⚠️  WARNING: No matches passed filtering!'
    );
    console.log('Possible issues:');
    console.log('  1. Match names don\'t contain major keywords');
    console.log('  2. Check filterMatches.js for the keyword list');
    console.log('\n Sample match names:');
    formattedMatches.slice(0, 5).forEach((match, i) => {
      console.log(`  ${i + 1}. "${match.name}"`);
    });
  }

  // Show sample of each category
  if (liveMatches.length > 0) {
    console.log('\n🔴 Sample Live Match:');
    console.log(JSON.stringify(liveMatches[0], null, 2));
  }

  if (recentMatches.length > 0) {
    console.log('\n✅ Sample Recent Match:');
    console.log(JSON.stringify(recentMatches[0], null, 2));
  }

  if (upcomingMatches.length > 0) {
    console.log('\n⏳ Sample Upcoming Match:');
    console.log(JSON.stringify(upcomingMatches[0], null, 2));
  }

  console.log('='.repeat(60) + '\n');
};

/**
 * UPCOMING MATCHES API - NEW API ANALYSIS
 * Analyzes the new upcomingMatches API response from CricAPI
 * Data structure is different from currentMatches API
 */
const analyzeUpcomingMatchesApi = (rawMatches) => {
  console.log('\n' + '='.repeat(70));
  console.log('🆕 NEW API: UPCOMING MATCHES ANALYSIS');
  console.log('='.repeat(70));

  if (!rawMatches || !Array.isArray(rawMatches)) {
    console.log('❌ ERROR: API did not return an array');
    console.log('Type:', typeof rawMatches);
    return;
  }

  console.log(`✅ Total matches from new API: ${rawMatches.length}`);

  if (rawMatches.length === 0) {
    console.log('⚠️  WARNING: API returned empty array');
    return;
  }

  // Analyze first match structure
  const firstMatch = rawMatches[0];
  console.log('\n📋 New API Match Structure (First Match):');
  console.log('Keys:', Object.keys(firstMatch));
  console.log('\nSample Match Data:');
  console.log(JSON.stringify(firstMatch, null, 2));

  // Check new API required fields
  console.log('\n🔍 New API Fields Check:');
  const newApiFields = {
    'id': 'Match unique identifier',
    'dateTimeGMT': 'Match date/time in GMT',
    'matchType': 'Format (t20, odi, test, etc)',
    'status': 'Human-readable status',
    'ms': 'Machine status (fixture/live/result)',
    't1': 'Team 1 name with code',
    't2': 'Team 2 name with code',
    't1s': 'Team 1 score',
    't2s': 'Team 2 score',
    't1img': 'Team 1 logo URL',
    't2img': 'Team 2 logo URL',
    'series': 'Tournament/League name',
  };

  Object.entries(newApiFields).forEach(([field, description]) => {
    const exists = field in firstMatch;
    const value = firstMatch[field];
    const hasValue = value !== undefined && value !== null && value !== '';
    console.log(
      `  ${exists ? '✅' : '❌'} ${field.padEnd(15)} | ${description.padEnd(35)} | Value: ${hasValue ? '✅' : '⚠️  empty'}`
    );
  });

  // Analyze match statuses
  console.log('\n📈 Match Statuses in New API:');
  const statuses = {};
  rawMatches.forEach(match => {
    const status = match.ms || 'undefined';
    statuses[status] = (statuses[status] || 0) + 1;
  });
  Object.entries(statuses).forEach(([status, count]) => {
    console.log(`  ${status.padEnd(15)} : ${count} matches`);
  });

  // Analyze match types
  console.log('\n🏆 Match Types in New API:');
  const types = {};
  rawMatches.forEach(match => {
    const type = match.matchType || 'undefined';
    types[type] = (types[type] || 0) + 1;
  });
  Object.entries(types).forEach(([type, count]) => {
    console.log(`  ${type.padEnd(15)} : ${count} matches`);
  });

  // Check team name parsing
  console.log('\n👥 Team Name Parsing (New API):');
  console.log(`  Team 1: "${firstMatch.t1}"`);
  console.log(`  Team 2: "${firstMatch.t2}"`);
  console.log('  ℹ️  Note: Team names include codes in brackets [CODE]');

  // Check for score data
  console.log('\n📊 Score Information (New API):');
  console.log(`  Team 1 Score: "${firstMatch.t1s}" ${firstMatch.t1s ? '✅' : '(empty - not started)'}`);
  console.log(`  Team 2 Score: "${firstMatch.t2s}" ${firstMatch.t2s ? '✅' : '(empty - not started)'}`);

  // Analyze series/tournament distribution
  console.log('\n🎯 Tournament Distribution:');
  const series = {};
  rawMatches.forEach(match => {
    const seriesName = match.series || 'Unknown';
    series[seriesName] = (series[seriesName] || 0) + 1;
  });
  Object.entries(series)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([seriesName, count]) => {
      console.log(`  ${count.toString().padStart(3)} matches | ${seriesName}`);
    });

  console.log('\n' + '='.repeat(70));
};

/**
 * COMPARE TWO APIS
 * Side-by-side comparison of old currentMatches vs new upcomingMatches API
 */
const compareApis = (oldApiResponse, newApiResponse) => {
  console.log('\n' + '='.repeat(90));
  console.log('📊 API COMPARISON: OLD (currentMatches) vs NEW (upcomingMatches)');
  console.log('='.repeat(90));

  // Basic stats
  console.log('\n📈 BASIC STATISTICS:');
  console.log(`${'Metric'.padEnd(25)} | ${'Old API'.padEnd(30)} | ${'New API'.padEnd(30)}`);
  console.log('-'.repeat(90));
  console.log(
    `${'Total Matches'.padEnd(25)} | ${(oldApiResponse?.length || 0).toString().padEnd(30)} | ${(newApiResponse?.length || 0).toString().padEnd(30)}`
  );

  // Data structure comparison
  console.log('\n🔧 DATA STRUCTURE COMPARISON:');
  console.log(`${'Aspect'.padEnd(25)} | ${'Old API'.padEnd(30)} | ${'New API'.padEnd(30)}`);
  console.log('-'.repeat(90));

  const comparisons = [
    {
      aspect: 'Team Names',
      old: 'teamInfo[].name (separate)',
      new: 't1, t2 (combined with code)',
    },
    {
      aspect: 'Team Logos',
      old: 'teamInfo[].img',
      new: 't1img, t2img',
    },
    {
      aspect: 'Team Scores',
      old: 'score[] array (multiple innings)',
      new: 't1s, t2s (strings)',
    },
    {
      aspect: 'Match Status',
      old: 'status (text), matchStarted, matchEnded (booleans)',
      new: 'ms (fixture/live/result), status (text)',
    },
    {
      aspect: 'Match Type',
      old: 'matchType',
      new: 'matchType',
    },
    {
      aspect: 'Venue',
      old: 'venue (included)',
      new: 'Not provided',
    },
    {
      aspect: 'Date/Time',
      old: 'date (Unix timestamp)',
      new: 'dateTimeGMT (ISO string)',
    },
    {
      aspect: 'League/Series',
      old: 'May be in name',
      new: 'series (explicit field)',
    },
    {
      aspect: 'Multiple Scores',
      old: 'Multiple innings supported',
      new: 'Only team scores, no innings details',
    },
  ];

  comparisons.forEach(({ aspect, old, new: newVal }) => {
    console.log(`${aspect.padEnd(25)} | ${old.padEnd(30)} | ${newVal.padEnd(30)}`);
  });

  console.log('\n' + '='.repeat(90));
};

/**
 * RECOMMENDATION ENGINE
 * Analyzes both APIs and provides recommendations for the project
 */
const recommendApiUsage = () => {
  console.log('\n' + '='.repeat(90));
  console.log('🎯 RECOMMENDATION FOR YOUR PROJECT');
  console.log('='.repeat(90));

  console.log('\n✅ STRENGTHS OF NEW API (upcomingMatches):');
  console.log('  1. Dedicated endpoint for upcoming matches (no filtering needed)');
  console.log('  2. Better date/time format (ISO string: dateTimeGMT)');
  console.log('  3. Explicit series/tournament field (easier filtering)');
  console.log('  4. Cleaner response structure for upcoming matches');
  console.log('  5. Contains recently completed matches too (good for combined view)');

  console.log('\n❌ WEAKNESSES OF NEW API (upcomingMatches):');
  console.log('  1. Missing venue information');
  console.log('  2. No innings-level score details (only final/current scores)');
  console.log('  3. Team names include codes in brackets [t1, t2] - needs parsing');
  console.log('  4. Different data structure - requires new formatMatch logic');
  console.log('  5. No matchStarted/matchEnded boolean flags');

  console.log('\n✅ STRENGTHS OF OLD API (currentMatches):');
  console.log('  1. Includes venue information');
  console.log('  2. Multiple innings/score details');
  console.log('  3. Clean team info structure (separate objects)');
  console.log('  4. Boolean flags (matchStarted, matchEnded) - easier filtering');
  console.log('  5. Works with your existing formatMatch.js');

  console.log('\n❌ WEAKNESSES OF OLD API (currentMatches):');
  console.log('  1. No dedicated endpoint for upcoming matches');
  console.log('  2. Returns mixed data (live, upcoming, completed)');
  console.log('  3. Need to filter by matchStarted/matchEnded flags');
  console.log('  4. Date format may vary (Unix timestamp)');

  console.log('\n' + '='.repeat(90));
  console.log('📋 RECOMMENDED STRATEGY:');
  console.log('='.repeat(90));

  console.log('\n🎯 HYBRID APPROACH (RECOMMENDED):');
  console.log('┌─────────────────────────────────────────────────────────────────┐');
  console.log('│ Use BOTH APIs with this strategy:                              │');
  console.log('│                                                                 │');
  console.log('│ 1. LIVE MATCHES → Use OLD API (currentMatches)                │');
  console.log('│    Reason: Better for real-time updates, has venue info       │');
  console.log('│                                                                 │');
  console.log('│ 2. UPCOMING MATCHES → Use NEW API (upcomingMatches)           │');
  console.log('│    Reason: Purpose-built endpoint, cleaner data               │');
  console.log('│    Action: Create new formatUpcomingMatch() function          │');
  console.log('│                                                                 │');
  console.log('│ 3. RECENT/COMPLETED → Use OLD API (currentMatches)           │');
  console.log('│    Reason: Has all score details, venue info                  │');
  console.log('│                                                                 │');
  console.log('└─────────────────────────────────────────────────────────────────┘');

  console.log('\n⚙️  IMPLEMENTATION STEPS:');
  console.log('  1. Create formatUpcomingMatch.js for new API structure');
  console.log('  2. Keep circApi1.js (getCurrentMatches) for live/recent');
  console.log('  3. Keep circApi2.js (getUpcomingMatches) for upcoming');
  console.log('  4. Update filterMatches.js if needed for new series field');
  console.log('  5. Handle missing venue in upcoming matches gracefully');

  console.log('\n' + '='.repeat(90));
  console.log('🔄 ALTERNATIVE: Single API Approach');
  console.log('='.repeat(90));
  console.log('\nIf you want to keep it simple (not recommended):');
  console.log('  ❌ Use ONLY old API: Lose dedicated upcoming matches endpoint');
  console.log('  ❌ Use ONLY new API: Miss venue info & detailed innings scores');
  console.log('  ✅ Use HYBRID: Best of both worlds (recommended)');

  console.log('\n' + '='.repeat(90));
};

module.exports = {
  debugMatches,
  analyzeApiResponse,
  analyzeFormattedMatches,
  analyzeFilteredMatches,
  analyzeUpcomingMatchesApi,
  compareApis,
  recommendApiUsage,
};
