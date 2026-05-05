const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICKET_API_KEY;

// Get upcoming matches from cricScore endpoint
const getUpcomingMatches = async () => {
  try {
    if (!API_KEY) {
      throw new Error('CRICKET_API_KEY environment variable is not set');
    }

    console.log('Calling CricAPI cricScore endpoint...');
    const res = await axios.get(`${BASE_URL}/cricScore`, {
      params: {
        apikey: API_KEY,
      },
    });

    console.log('CricAPI cricScore response received');
    console.log('Response keys:', Object.keys(res.data));
    console.log('Has data.data?', !!res.data?.data);
    console.log('Data type:', typeof res.data?.data);
    console.log('Data is array?', Array.isArray(res.data?.data));

    // Check what structure the API returned
    if (!res.data) {
      console.error('No data in response');
      return [];
    }

    if (res.data?.data && Array.isArray(res.data.data)) {
      console.log(`Found ${res.data.data.length} matches (upcoming + live + completed)`);
      return res.data.data;
    }

    if (Array.isArray(res.data)) {
      console.log(`Found ${res.data.length} matches (direct array)`);
      return res.data;
    }

    console.error('Unexpected response structure:');
    console.error(JSON.stringify(res.data, null, 2));
    return [];
  } catch (error) {
    console.error('CricAPI Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to fetch matches: ${error.message}`);
  }
};

module.exports = {
  getUpcomingMatches,
};
