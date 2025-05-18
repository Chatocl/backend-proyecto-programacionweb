const express = require('express');
const router = express.Router();
const { getRecommendationsByEmotion } = require('../controllers/recommendation.controller');

router.post('/emotion', getRecommendationsByEmotion);

module.exports = router;
