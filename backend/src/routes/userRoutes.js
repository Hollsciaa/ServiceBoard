const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

// Obtenir le profil connecté
router.get('/me', auth, userController.getMe);

// Modifier les informations du profil connecté
router.put('/me', auth, userController.updateMe);

module.exports = router;