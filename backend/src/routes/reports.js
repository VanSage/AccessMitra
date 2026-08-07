const express = require('express');
const { listReports, createReport, upvoteReport } = require('../controllers/reportsController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listReports);
router.post('/', optionalAuth, createReport);
router.post('/:id/upvote', optionalAuth, upvoteReport);

module.exports = router;
