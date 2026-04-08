const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const auth = require('../middlewares/authMiddleware'); // Notre fameux videur

// On met "auth" au milieu : si le videur dit non, ça n'atteindra jamais createAd
router.post('/', auth, adController.createAd);

module.exports = router;