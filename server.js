const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const matchRoutes = require('./routes/matchRoutes');
const debugRoutes = require('./routes/debugRoutes');
const tennisDebugRoutes = require('./routes/tennisDebugRoutes');

const playerRoutes = require('./routes/playerRoutes');
const seriesRoutes = require('./routes/seriesRoutes');

// Tennis routes
const tennisFixtures = require('./routes/tennisFixturesRoutes');
const tennisPlayers = require('./routes/tennisPlayersRoutes');
const tennisTournaments = require('./routes/tennisTournamentsRoutes');
const tennisRankings = require('./routes/tennisRankingsRoutes');

dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/matches', matchRoutes); // cricket matches; live, recent, upcoming
app.use('/api/players', playerRoutes); // cricket players
app.use('/api/series', seriesRoutes); // cricket series; upcoming + details

// Tennis routes
app.use('/api/tennis/fixtures', tennisFixtures); // tennis fixtures; today, date, range, tournament, player
app.use('/api/tennis/players', tennisPlayers); // tennis players; profile, matches, stats, surface, titles, finals
app.use('/api/tennis/tournaments', tennisTournaments); // tennis tournaments; calendar, info, seasons, champions, results
app.use('/api/tennis/rankings', tennisRankings); // tennis rankings; singles, doubles, race
/*
// Debug routes (optional - for development/troubleshooting)
app.use('/api/debug', debugRoutes);
app.use('/api/tennis/debug', tennisDebugRoutes);
*/

app.get('/', (req, res) => {
  res.send('SportScope is running...');
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});