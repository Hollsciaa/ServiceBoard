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

exports.getAllAds = async (req, res) => {
    try {
        // On demande à Prisma de trouver toutes les annonces
        const ads = await prisma.ad.findMany({
            orderBy: {
                createdAt: 'desc' // On trie pour avoir les plus récentes en premier
            },
            // L'astuce magique : on inclut des infos de l'auteur (grâce à ta relation Prisma)
            include: {
                author: {
                    select: {
                        pseudo: true,
                        city: true
                    }
                }
            }
        });

        res.status(200).json(ads);

    } catch (error) {
        console.error("Erreur lors de la récupération des annonces :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

exports.getAdById = async (req, res) => {
    try {
        // On récupère l'ID qui sera dans l'URL (ex: /api/ads/1234-5678)
        const adId = req.params.id;

        const ad = await prisma.ad.findUnique({
            where: { id: adId },
            // On ramène encore les infos de l'auteur, c'est utile pour la page détails
            include: {
                author: {
                    select: { pseudo: true, city: true, bio: true } // Bonus : on rajoute la bio !
                }
            }
        });

        // Si Prisma ne trouve rien, c'est que l'ID n'existe pas ou plus
        if (!ad) {
            return res.status(404).json({ error: "Annonce introuvable." });
        }

        res.status(200).json(ad);

    } catch (error) {
        console.error("Erreur lors de la récupération de l'annonce :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

exports.updateAd = async (req, res) => {
    try {
        const adId = req.params.id;
        const userId = req.auth.userId; // Récupéré par ton middleware auth

        // 1. Chercher l'annonce pour vérifier l'auteur
        const ad = await prisma.ad.findUnique({ where: { id: adId } });

        if (!ad) return res.status(404).json({ error: "Annonce non trouvée" });

        // 2. Sécurité : Est-ce bien l'auteur ?
        if (ad.authorId !== userId) {
            return res.status(403).json({ error: "Action interdite : vous n'êtes pas l'auteur." });
        }

        // 3. Mise à jour
        const updatedAd = await prisma.ad.update({
            where: { id: adId },
            data: { ...req.body } // On pourrait filtrer les champs ici pour plus de sécurité
        });

        res.status(200).json(updatedAd);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
};

exports.deleteAd = async (req, res) => {
    try {
        const adId = req.params.id;
        const userId = req.auth.userId;

        const ad = await prisma.ad.findUnique({ where: { id: adId } });

        if (!ad) return res.status(404).json({ error: "Annonce non trouvée" });

        if (ad.authorId !== userId) {
            return res.status(403).json({ error: "Action interdite." });
        }

        await prisma.ad.delete({ where: { id: adId } });
        res.status(200).json({ message: "Annonce supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};