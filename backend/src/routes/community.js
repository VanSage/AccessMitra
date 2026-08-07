const express = require('express');
const { leaderboard } = require('../controllers/communityController');

const router = express.Router();

router.get('/leaderboard', leaderboard);

module.exports = router;
