const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middlewares/authMiddleware');

router.post('/:adId', auth, favoriteController.toggleFavorite);
router.get('/', auth, favoriteController.getFavorites);

module.exports = router;