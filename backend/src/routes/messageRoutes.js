const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, messageController.sendMessage);
router.get('/', auth, messageController.getConversations);
router.get('/:id', auth, messageController.getConversationDetails);

module.exports = router;