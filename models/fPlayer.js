const mongoose = require('mongoose');

const fPlayerSchema = new mongoose.Schema({
  playerId: { type: Number, required: true }
}, { collection: 'f_players' });

module.exports = mongoose.model('FPlayer', fPlayerSchema);
