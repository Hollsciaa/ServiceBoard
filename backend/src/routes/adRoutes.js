const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const auth = require('../middlewares/authMiddleware'); // Notre fameux videur

// Créer une annonce (Authentification requise)
router.post('/', auth, adController.createAd);

// Récupérer toutes les annonces (Accès public)
router.get('/', adController.getAllAds);

// Récupérer UNE annonce spécifique via son ID (Accès public)
router.get('/:id', adController.getAdById);

// Modifier une annonce (Authentification requise + auteur uniquement)
router.put('/:id', auth, adController.updateAd);

// Supprimer une annonce (Authentification requise + auteur uniquement)
router.delete('/:id', auth, adController.deleteAd);
module.exports = router;