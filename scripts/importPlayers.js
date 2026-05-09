/*
  Usage:
    node scripts/importPlayers.js path/to/players.json

  Environment:
    - requires MONGO_URI in .env

  What it does:
    - reads players.json (must be an array of player objects)
    - inserts into MongoDB using bulkWrite upsert by playerId

  Note:
    - Your schema enforces playerId unique.
    - This script will avoid duplicates by upserting.
*/

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

const Player = require('../models/cricketPlayers');

function requireArg() {
  const p = process.argv[2];
  if (!p) {
    console.error('Missing players.json path. Example: node scripts/importPlayers.js ./players.json');
    process.exit(1);
  }
  return p;
}

async function main() {
  const jsonPath = requireArg();
  const resolved = path.isAbsolute(jsonPath)
    ? jsonPath
    : path.join(process.cwd(), jsonPath);

  if (!fs.existsSync(resolved)) {
    console.error('File not found:', resolved);
    process.exit(1);
  }

  const raw = fs.readFileSync(resolved, 'utf8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    console.error('Invalid players.json. Expected an array of player objects.');
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Missing MONGO_URI. Add it to your .env');
    process.exit(1);
  }

  console.log(`Connecting to Mongo... (${mongoose.version})`);
  await mongoose.connect(mongoUri);
  console.log('Connected. Total players in file:', data.length);

  // Build bulk upsert operations (keyed by playerId)
  const ops = data.map((p) => ({
    updateOne: {
      filter: { playerId: p.playerId },
      update: {
        $set: {
          playerId: p.playerId,
          name: p.name,
          image: p.image,
          dateOfBirth: p.dateOfBirth,
          gender: p.gender,
          battingStyle: p.battingStyle,
          bowlingStyle: p.bowlingStyle ?? null,
          position: p.position,
          country: p.country,
        },
      },
      upsert: true,
    },
  }));

  // Avoid blowing memory for very large files by chunking
  const chunkSize = 500;
  let insertedOrUpdated = 0;
  let chunks = 0;

  for (let i = 0; i < ops.length; i += chunkSize) {
    chunks++;
    const chunk = ops.slice(i, i + chunkSize);
    console.log(`Bulk upsert chunk ${chunks} (${i}..${i + chunk.length - 1})`);

    const res = await Player.bulkWrite(chunk, { ordered: false });
    insertedOrUpdated += (res.upsertedCount || 0) + (res.modifiedCount || 0);
  }

  console.log('Done. Upsert result (approx modified+upserted):', insertedOrUpdated);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});

