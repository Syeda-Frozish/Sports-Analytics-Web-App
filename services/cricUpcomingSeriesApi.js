const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICKET_API_KEY;

// CricAPI endpoint for listing series
const UPCOMING_SERIES_PATH = '/series';

const getUpcomingSeries = async () => {
  try {
    if (!API_KEY) {
      throw new Error('CRICKET_API_KEY environment variable is not set');
    }

    const res = await axios.get(`${BASE_URL}${UPCOMING_SERIES_PATH}`, {
      params: {
        apikey: API_KEY,
      },
    });

    // Expected from your sample:
    // { data: [ { id, name, startDate, endDate, odi, t20, test, squads, matches }, ... ] }
    return Array.isArray(res?.data?.data) ? res.data.data : [];
  } catch (error) {
    console.error('CricUpcomingSeriesApi error (getUpcomingSeries):', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
};

module.exports = { getUpcomingSeries };

