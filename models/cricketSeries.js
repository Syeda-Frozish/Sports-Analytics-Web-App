const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  seriesId: {
    type: String,
    unique: true,
    required: true,
  },
  name: String,
  startDate: String,
  endDate: String,
  odi: Number,
  t20: Number,
  test: Number,
  squads: Number,
  matches: Number,
  matchList: [
    {
      id: String,
      name: String,
      matchType: String,
      status: String,
      venue: String,
      date: String,
      dateTimeGMT: String,
      teams: [String],
      teamInfo: [
        {
          name: String,
          shortname: String,
          img: String,
        }
      ],
      fantasyEnabled: Boolean,
      bbbEnabled: Boolean,
      hasSquad: Boolean,
      matchStarted: Boolean,
      matchEnded: Boolean,
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Series', seriesSchema);