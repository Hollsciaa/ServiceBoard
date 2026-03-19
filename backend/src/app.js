const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globaux (pour autoriser le front et lire le JSON)
app.use(cors());
app.use(express.json());

// Notre première route de test !
app.get('/', (req, res) => {
    res.json({ message: "Bravo, l'API de ServiceBoard est en ligne ! 🚀" });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});