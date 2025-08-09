const express = require('express');
const router = express.Router();
const { predictByBuildingId } = require('../controllers/predictController');

router.post('/by-building', predictByBuildingId);
module.exports = router;
