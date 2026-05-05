const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const matchRoutes = require('./routes/matchRoutes');
const debugRoutes = require('./routes/debugRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Main match routes
app.use('/api/matches', matchRoutes);

// Debug routes (optional - for development/troubleshooting)
app.use('/api/debug', debugRoutes);

app.get('/', (req, res) => {
  res.send('Sports Analytics API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});