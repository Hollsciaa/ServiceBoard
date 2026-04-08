const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createAd = async (req, res) => {
    try {
        // 1. On récupère toutes les infos envoyées dans la requête
        const {
            type, title, description, category, city,
            availability, priceType, priceValue, modality
        } = req.body;

        // 2. On crée l'annonce dans la base de données
        const newAd = await prisma.ad.create({
            data: {
                type,
                title,
                description,
                category,
                city,
                availability,
                priceType,
                priceValue,
                modality,
                // C'est ici la magie de notre videur : il nous donne directement l'ID !
                authorId: req.auth.userId
            }
        });

        res.status(201).json({
            message: "Annonce publiée avec succès !",
            ad: newAd
        });

    } catch (error) {
        console.error("Erreur lors de la création de l'annonce :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};