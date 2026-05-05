const prisma = require('../lib/prisma');

// Ajouter ou retirer une annonce des favoris (Toggle)
exports.toggleFavorite = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { adId } = req.params;

        // Vérifier si l'annonce existe
        const ad = await prisma.ad.findUnique({ where: { id: adId } });
        if (!ad) {
            return res.status(404).json({ error: "Annonce introuvable." });
        }

        // Vérifier si le favori existe déjà
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_adId: {
                    userId,
                    adId
                }
            }
        });

        if (existingFavorite) {
            // Si le favori existe, on le supprime (retirer des favoris)
            await prisma.favorite.delete({
                where: {
                    id: existingFavorite.id
                }
            });
            return res.status(200).json({ message: "Annonce retirée des favoris avec succès." });
        } else {
            // Sinon, on le crée (ajouter aux favoris)
            const newFavorite = await prisma.favorite.create({
                data: {
                    userId,
                    adId
                }
            });
            return res.status(201).json({ message: "Annonce ajoutée aux favoris avec succès.", newFavorite });
        }
    } catch (error) {
        console.error("Erreur lors de la gestion des favoris :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// Récupérer tous les favoris de l'utilisateur connecté
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                ad: {
                    include: {
                        author: { select: { pseudo: true, city: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(favorites);
    } catch (error) {
        console.error("Erreur lors de la récupération des favoris :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};