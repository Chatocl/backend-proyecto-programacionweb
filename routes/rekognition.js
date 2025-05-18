const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { analyzeFromUpload } = require('../controllers/rekognition.controller');

router.post('/detectface', upload.single('image'), analyzeFromUpload);

module.exports = router;
