const axios = require('axios');

const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICKET_API_KEY;

// Get current matches
const getCurrentMatches = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/currentMatches`, {
      params: {
        apikey: API_KEY,
        offset: 0,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error('CricAPI Error:', error.message);
    throw new Error('Failed to fetch matches');
  }
};

module.exports = {
  getCurrentMatches,
};