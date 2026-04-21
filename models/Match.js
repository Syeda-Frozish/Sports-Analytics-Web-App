const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  teamA: String,
  teamB: String,
  date: Date,
  score: String
});

module.exports = mongoose.model('Match', matchSchema);