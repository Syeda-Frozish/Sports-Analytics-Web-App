const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICKET_API_KEY;

// If your endpoints differ from these guesses, adjust here.
// CricAPI series details by seriesId usually follows a pattern like: /series_info
const SERIES_BY_ID_PATH = '/series_info';

const getSeriesById = async (seriesId) => {
  if (!seriesId) return null;
  try {
    if (!API_KEY) {
      throw new Error('CRICKET_API_KEY environment variable is not set');
    }

    const res = await axios.get(`${BASE_URL}${SERIES_BY_ID_PATH}`, {
      params: {
        apikey: API_KEY,
        id: seriesId,
      },
    });

    // Expected shape from your sample:
    // { apikey, data: { info: {id, name, startdate, enddate, odi, t20, test, ...}, matchList: [...] }, status: ... }
    const data = res?.data?.data;
    if (!data || !data.info) return null;

    return data; // Return full data with both info and matchList
  } catch (error) {
    console.error('CricSeriesApi error (getSeriesById):', seriesId, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
};

module.exports = {
  getSeriesById,
};

