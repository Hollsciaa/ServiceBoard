const express = require('express');
const cors = require('cors');
const adRoutes = require('./routes/adRoutes');
require('dotenv').config();

const app = express();

// Middlewares globaux (pour autoriser le front et lire le JSON)
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // Toutes les routes d'auth commenceront par /api/auth
app.use('/api/ads', adRoutes);

// Notre première route de test !
app.get('/', (req, res) => {
    res.json({ message: "Bravo, l'API de ServiceBoard est en ligne ! 🚀" });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});