const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // 1. On regarde si l'utilisateur a présenté un pass (le header Authorization)
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Accès refusé. Veuillez vous connecter." });
        }

        // 2. On extrait le fameux token (il est après le mot "Bearer ")
        const token = authHeader.split(' ')[1];

        // 3. Le videur vérifie la signature du token avec notre mot de passe secret
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Si c'est bon, on attache l'ID de l'utilisateur à la requête
        // (très utile pour savoir qui crée l'annonce !)
        req.auth = {
            userId: decodedToken.userId
        };

        // 5. On ouvre la porte et on laisse passer à la suite (le contrôleur)
        next();

    } catch (error) {
        // Si le token est faux ou expiré
        res.status(401).json({ error: "Token invalide ou expiré !" });
    }
};