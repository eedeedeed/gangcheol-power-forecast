// routes/predictRoutes.js
const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');

router.post('/predict', predictController.predict); // body: { buildingId }

module.exports = router;
