// routes/predictRoutes.js
const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');

router.get('/:buildingId', predictController.predict);

module.exports = router;
