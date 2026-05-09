const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const Player = require('../models/Player');
=======
const Player = require('../models/cricketPlayers');
const FPlayer = require('../models/fPlayer');
>>>>>>> 8c84ccc810bfb2e46de97aba7283b7f62126cfdb

// ADD PLAYER
router.post('/add', async (req, res) => {
  try {
    const player = new Player(req.body);
    await player.save();
    res.status(201).json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
module.exports = router;
=======
/** 
 * GET /api/players
 * Players directory with filtering/search/pagination
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const q = (req.query.q || '').trim();

    const filter = {};

    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.battingStyle) filter.battingStyle = req.query.battingStyle;

    // bowlingStyle can be literal 'null' from frontend
    if (req.query.bowlingStyle && req.query.bowlingStyle !== 'null') {
      filter.bowlingStyle = req.query.bowlingStyle;
    } else if (req.query.bowlingStyle === 'null') {
      filter.bowlingStyle = null;
    }

    if (req.query.position) filter.position = req.query.position;

    if (req.query.countryId) filter['country.id'] = parseInt(req.query.countryId, 10);
    if (req.query.continent) filter['country.continent'] = req.query.continent;

    const and = [];
    if (Object.keys(filter).length) and.push(filter);

    if (q) {
      const orConditions = [
        { 'name.first': { $regex: q, $options: 'i' } },
        { 'name.last': { $regex: q, $options: 'i' } },
        { 'name.full': { $regex: q, $options: 'i' } },
      ];

      if (!isNaN(q)) {
        orConditions.push({ playerId: Number(q) });
      }

      and.push({ $or: orConditions });
    }

    const mongoFilter = and.length ? { $and: and } : {};

    const sortBy = req.query.sortBy || 'playerId';
    const order = (req.query.order || 'asc').toLowerCase() === 'desc' ? -1 : 1;

    let sort = { playerId: order };
    if (sortBy === 'createdAt') sort = { createdAt: order };
    if (sortBy === 'name') sort = { 'name.full': order };
    if (sortBy === 'playerId') sort = { playerId: order };

    const [count, players] = await Promise.all([
      Player.countDocuments(mongoFilter),
      Player.find(mongoFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v')
    ]);

    return res.json({
      count,
      page,
      limit,
      players,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/players/filters
 * Distinct values for dropdowns and classification UI
 */
router.get('/filters', async (req, res) => {
  try {
    const [genders, battingStyles, bowlingStyles, positions, continents, countries] =
      await Promise.all([
        Player.distinct('gender'),
        Player.distinct('battingStyle'),
        Player.distinct('bowlingStyle'),
        Player.distinct('position'),
        Player.distinct('country.continent'),
        // countries is a projection of nested country fields
        Player.aggregate([
          {
            $group: {
              _id: '$country.id',
              id: { $first: '$country.id' },
              name: { $first: '$country.name' },
              continent: { $first: '$country.continent' },
              image: { $first: '$country.image' },
            },
          },
          { $sort: { name: 1 } },
        ]),
      ]);

    res.json({
      genders: (genders || []).filter(Boolean).sort(),
      battingStyles: (battingStyles || []).filter(Boolean).sort(),
      bowlingStyles: (bowlingStyles || []).sort(),
      positions: (positions || []).filter(Boolean).sort(),
      continents: (continents || []).filter(Boolean).sort(),
      countries: countries || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/players/countries
 */
router.get('/countries', async (req, res) => {
  try {
    const countries = await Player.aggregate([
      {
        $group: {
          _id: '$country.id',
          id: { $first: '$country.id' },
          name: { $first: '$country.name' },
          continent: { $first: '$country.continent' },
          image: { $first: '$country.image' },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.json({ countries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/players/countries/:countryId/players
 */
router.get('/countries/:countryId/players', async (req, res) => {
  try {
    const countryId = parseInt(req.params.countryId, 10);
    if (Number.isNaN(countryId)) {
      return res.status(400).json({ error: 'countryId must be a number' });
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [count, players] = await Promise.all([
      Player.countDocuments({ 'country.id': countryId }),
      Player.find({ 'country.id': countryId })
        .sort({ playerId: 1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
    ]);

    res.json({ count, page, limit, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/players/continents/:continent/players
 */
router.get('/continents/:continent/players', async (req, res) => {
  try {
    const continent = req.params.continent;

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [count, players] = await Promise.all([
      Player.countDocuments({ 'country.continent': continent }),
      Player.find({ 'country.continent': continent })
        .sort({ playerId: 1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
    ]);

    res.json({ count, page, limit, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Classification-style routes (batters/bowlers + by style + by position)
 * These are just convenience endpoints that wrap filtering logic.
 */

// GET /api/players/positions/:position/players
router.get('/positions/:position/players', async (req, res) => {
  try {
    const position = req.params.position;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const q = { position };

    const [count, players] = await Promise.all([
      Player.countDocuments(q),
      Player.find(q)
        .sort({ playerId: 1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
    ]);

    res.json({ count, page, limit, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/players/batting-styles/:style/players
router.get('/batting-styles/:style/players', async (req, res) => {
  try {
    const style = req.params.style;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const q = { battingStyle: style };

    const [count, players] = await Promise.all([
      Player.countDocuments(q),
      Player.find(q)
        .sort({ playerId: 1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
    ]);

    res.json({ count, page, limit, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/players/bowling-styles/:style/players
router.get('/bowling-styles/:style/players', async (req, res) => {
  try {
    const style = req.params.style;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const q = { bowlingStyle: style };

    const [count, players] = await Promise.all([
      Player.countDocuments(q),
      Player.find(q)
        .sort({ playerId: 1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
    ]);

    res.json({ count, page, limit, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/players/batters (convenience by position string)
router.get('/batters', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    // If your dataset uses exactly these position values, this will work.
    // Common options: "Batsman", "Batter"
    const positions = ['Batsman', 'Batter'];

    const q = { position: { $in: positions } };

    const [count, players] = await Promise.all([
      Player.countDocuments(q),
      Player.find(q)
        .sort({ playerId: 1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
    ]);

    res.json({ count, page, limit, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/players/bowlers (convenience by position string)
router.get('/bowlers', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const positions = ['Bowler'];
    const q = { position: { $in: positions } };

    const [count, players] = await Promise.all([
      Player.countDocuments(q),
      Player.find(q)
        .sort({ playerId: 1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
    ]);

    res.json({ count, page, limit, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/players/featured
 * Fetch featured players defined in the f_players collection
 */
router.get('/featured', async (req, res) => {
  try {
    const fPlayers = await FPlayer.find({});
    const playerIds = fPlayers.map(fp => fp.playerId);

    // Fetch matching players
    const players = await Player.find({ playerId: { $in: playerIds } }).select('-__v');

    // Preserve the exact order from f_players
    const orderedPlayers = playerIds
      .map(id => players.find(p => p.playerId === id))
      .filter(Boolean);

    res.json({ players: orderedPlayers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/players/:playerId
 * Must be LAST to avoid matching other specific routes like /filters, /countries, etc.
 */
router.get('/id/:playerId', async (req, res) => { // player detail

  try {
    const playerId = parseInt(req.params.playerId, 10);
    if (Number.isNaN(playerId)) {
      return res.status(400).json({ error: 'playerId must be a number' });
    }

    const player = await Player.findOne({ playerId }).select('-__v');
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    return res.json({ player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


>>>>>>> 8c84ccc810bfb2e46de97aba7283b7f62126cfdb
