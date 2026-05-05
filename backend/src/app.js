const express = require('express');
const cors = require('cors');
const adRoutes = require('./routes/adRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
require('dotenv').config();

const app = express();

// Middlewares globaux (pour autoriser le front et lire le JSON)
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // Toutes les routes d'auth commenceront par /api/auth
app.use('/api/ads', adRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/favorites', favoriteRoutes);

// Notre première route de test !
app.get('/', (req, res) => {
    res.json({ message: "Bravo, l'API de ServiceBoard est en ligne ! 🚀" });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});