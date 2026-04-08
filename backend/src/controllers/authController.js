const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        // 1. On récupère les infos envoyées par le front-end
        const {email, password, pseudo, city} = req.body;

        // 2. On vérifie si l'email ou le pseudo existe déjà dans la base
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{email: email}, {pseudo: pseudo}]
            }
        });

        if (existingUser) {
            return res.status(400).json({error: "Cet email ou ce pseudo est déjà pris."});
        }

        // 3. On crypte le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. On crée l'utilisateur dans Supabase
        const newUser = await prisma.user.create({
            data: {
                email,
                pseudo,
                city,
                password: hashedPassword,
            }
        });

        // 5. On répond que tout s'est bien passé (sans renvoyer le mot de passe !)
        res.status(201).json({
            message: "Inscription réussie !",
            user: {
                id: newUser.id,
                email: newUser.email,
                pseudo: newUser.pseudo
            }
        });

    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        res.status(500).json({error: "Erreur interne du serveur."});
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. On cherche l'utilisateur via son email
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        // 2. On compare le mot de passe tapé avec celui crypté dans la base
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        // 3. Si tout est bon, on crée le passeport (Token) valable 24h
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Connexion réussie !",
            token: token,
            pseudo: user.pseudo
        });

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};