const express = require('express');
const router = express.Router();

const Player = require('../models/cricketPlayers');
const FPlayer = require('../models/fPlayer');

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

// Batters
router.get('/batters', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

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

// Bowlers
router.get('/bowlers', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const q = { position: { $in: ['Bowler'] } };

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

// Featured players
router.get('/featured', async (req, res) => {
  try {
    const fPlayers = await FPlayer.find({});
    const playerIds = fPlayers.map(fp => fp.playerId);

    const players = await Player.find({ playerId: { $in: playerIds } }).select('-__v');

    const orderedPlayers = playerIds
      .map(id => players.find(p => p.playerId === id))
      .filter(Boolean);

    res.json({ players: orderedPlayers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Player by ID (LAST ROUTE)
router.get('/id/:playerId', async (req, res) => {
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