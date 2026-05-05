const prisma = require('../lib/prisma');

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.auth.userId;
        const { adId, recipientId, content } = req.body;

        // Règle 1 : Interdit de se contacter soi-même
        if (senderId === recipientId) {
            return res.status(400).json({ error: "Vous ne pouvez pas vous envoyer un message à vous-même." });
        }

        // Vérifier si l'annonce existe
        const ad = await prisma.ad.findUnique({ where: { id: adId } });
        if (!ad) {
            return res.status(404).json({ error: "Annonce introuvable." });
        }

        // Rechercher si une conversation existe déjà entre ces deux utilisateurs pour cette annonce
        let conversation = await prisma.conversation.findFirst({
            where: {
                adId,
                OR: [
                    { participant1Id: senderId, participant2Id: recipientId },
                    { participant1Id: recipientId, participant2Id: senderId }
                ]
            }
        });

        // Si aucune conversation n'existe, on la crée
        if (!conversation) {
            // S'assurer que le participant 1 est l'expéditeur ou l'auteur
            // Par convention, on peut mettre l'auteur de l'annonce en P1 et l'acheteur en P2
            const isAuthor = ad.authorId === senderId;
            const p1 = isAuthor ? senderId : recipientId;
            const p2 = isAuthor ? recipientId : senderId;

            conversation = await prisma.conversation.create({
                data: {
                    adId,
                    participant1Id: p1,
                    participant2Id: p2
                }
            });
        }

        // Créer le message
        const newMessage = await prisma.message.create({
            data: {
                content,
                conversationId: conversation.id,
                senderId
            }
        });

        // Mettre à jour le champ updatedAt de la conversation pour le tri de la boîte de réception
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() }
        });

        res.status(201).json({
            message: "Message envoyé avec succès",
            newMessage
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participant1Id: userId },
                    { participant2Id: userId }
                ]
            },
            include: {
                ad: { select: { title: true } },
                participant1: { select: { pseudo: true } },
                participant2: { select: { pseudo: true } },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Erreur lors de la récupération des conversations :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

exports.getConversationDetails = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const conversationId = req.params.id;

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                ad: { select: { title: true, authorId: true } },
                participant1: { select: { id: true, pseudo: true } },
                participant2: { select: { id: true, pseudo: true } },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: { select: { pseudo: true } }
                    }
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation introuvable." });
        }

        // Règle 2 : La conversation n'est visible que par ses deux participants
        if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
            return res.status(403).json({ error: "Accès refusé." });
        }

        res.status(200).json(conversation);
    } catch (error) {
        console.error("Erreur lors de la récupération de la conversation :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};