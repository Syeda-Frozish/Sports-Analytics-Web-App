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

}, {
  timestamps: true,
});

module.exports = mongoose.model('Match', matchSchema);