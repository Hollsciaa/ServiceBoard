const prisma = require('../lib/prisma');

// Récupérer le profil de l'utilisateur connecté avec ses annonces
exports.getMe = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                pseudo: true,
                city: true,
                bio: true,
                createdAt: true,
                ads: { // Récupère également les annonces de l'utilisateur
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// Mettre à jour le profil (pseudo, ville, bio)
exports.updateMe = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { pseudo, city, bio } = req.body;

        // Si le pseudo est modifié, vérifions qu'il n'est pas déjà pris
        if (pseudo) {
            const existingUser = await prisma.user.findUnique({
                where: { pseudo }
            });

            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ error: "Ce pseudo est déjà utilisé." });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                pseudo,
                city,
                bio
            },
            select: {
                id: true,
                email: true,
                pseudo: true,
                city: true,
                bio: true
            }
        });

        res.status(200).json({
            message: "Profil mis à jour avec succès.",
            user: updatedUser
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};