const express = require('express');
const { listPlaces, getPlace } = require('../controllers/placesController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, listPlaces);
router.get('/:id', getPlace);

module.exports = router;
