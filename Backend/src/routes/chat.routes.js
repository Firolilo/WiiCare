const express = require('express');

const { auth } = require('../middleware/auth');
const { listConversations, listMessages, sendMessage } = require('../controllers/chat.controller');

const router = express.Router();

router.get('/', auth(true), listConversations);
router.get('/:conversationId/messages', auth(true), listMessages);
router.post('/message', auth(true), sendMessage);

module.exports = router;
