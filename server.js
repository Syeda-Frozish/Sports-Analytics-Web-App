const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const matchRoutes = require('./routes/matchRoutes');
const debugRoutes = require('./routes/debugRoutes');
const playerRoutes = require('./routes/playerRoutes');
<<<<<<< HEAD
=======
const seriesRoutes = require('./routes/seriesRoutes');
>>>>>>> 8c84ccc810bfb2e46de97aba7283b7f62126cfdb

dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/matches', matchRoutes); // cricket matches; live, recent, upcoming
app.use('/api/players', playerRoutes); // cricket players
<<<<<<< HEAD
=======
app.use('/api/series', seriesRoutes); // cricket series; upcoming + details
>>>>>>> 8c84ccc810bfb2e46de97aba7283b7f62126cfdb

// Debug routes (optional - for development/troubleshooting)
app.use('/api/debug', debugRoutes);

app.get('/', (req, res) => {
  res.send('Sports Analytics API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});