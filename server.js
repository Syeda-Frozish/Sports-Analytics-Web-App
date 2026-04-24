const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sports Analytics API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const matchRoutes = require('./routes/matchRoutes');

app.use('/api/matches', matchRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});