const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({

  matchId: {
    type: String,
    unique: true,
    required: true,
  },

  name: String,

  format: String,

  status: String,

  venue: String,

  date: Date,

  teamA: {
    name: String,
    short: String,
    logo: String,
  },

  teamB: {
    name: String,
    short: String,
    logo: String,
  },

  score: [
    {
      runs: Number,
      wickets: Number,
      overs: mongoose.Schema.Types.Mixed,
      inning: String,
    }
  ],

  matchStarted: Boolean,

  matchEnded: Boolean,

  // Series enrichment (from separate series-by-id API)
  seriesId: {
    type: String,
    index: true,
    default: null,
  },

  series: {
    type: {
      seriesId: { type: String, default: null },
      name: { type: String, default: null },
      startDate: { type: String, default: null },
      endDate: { type: String, default: null },
      odi: { type: Number, default: null },
      t20: { type: Number, default: null },
      test: { type: Number, default: null },
      squads: { type: Number, default: null },
      matches: { type: Number, default: null },
    },
    default: null,
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model('Match', matchSchema);