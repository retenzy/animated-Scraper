const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.post('/csv', reviewController.generateCsv);
router.post('/csv/batch', reviewController.generateBatchCsv);
router.post('/validate', reviewController.validateReviews);

module.exports = router;
