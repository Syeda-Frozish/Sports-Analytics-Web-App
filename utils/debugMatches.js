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

module.exports = {
  debugMatches,
  analyzeApiResponse,
  analyzeFormattedMatches,
  analyzeFilteredMatches,
};
