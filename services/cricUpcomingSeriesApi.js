const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICKET_API_KEY;

// CricAPI endpoint for listing series
const UPCOMING_SERIES_PATH = '/series';

const getUpcomingSeries = async (searchStr = '') => {
  try {
    if (!API_KEY) {
      throw new Error('CRICKET_API_KEY environment variable is not set');
    }

    let allSeries = [];
    // Fetch up to 4 pages (100 series) to ensure we get a sufficient range of dates
    for (let offset = 0; offset < 100; offset += 25) {
      const params = {
        apikey: API_KEY,
        offset: offset,
      };
      if (searchStr) {
        params.search = searchStr;
      }

      const res = await axios.get(`${BASE_URL}${UPCOMING_SERIES_PATH}`, { params });

      const data = res?.data?.data;
      if (Array.isArray(data)) {
        allSeries = allSeries.concat(data);
      }

      // If we received less than 25 items, we've reached the end of the available data
      if (!data || data.length < 25) {
        break;
      }
    }

    return allSeries;
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

