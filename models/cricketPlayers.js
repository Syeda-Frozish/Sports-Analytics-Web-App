const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    playerId: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      first: {
        type: String,
        required: true,
      },

      last: {
        type: String,
        required: true,
      },

      full: {
        type: String,
        required: true,
      },
    },

    image: {
      type: String,
      required: true,
    },

    dateOfBirth: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      required: true,
    },

    battingStyle: {
      type: String,
      required: true,
    },

    bowlingStyle: {
      type: String,
      default: null,
    },

    position: {
      type: String,
      required: true,
    },

    country: {
      id: {
        type: Number,
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      continent: {
        type: String,
        required: true,
      },

      image: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Player = mongoose.model("Player", playerSchema);

module.exports = Player;