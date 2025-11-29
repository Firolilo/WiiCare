const express = require('express');

const { auth } = require('../middleware/auth');
const { 
  listConversations, 
  listMessages, 
  sendMessage,
  getOrCreateConversation 
} = require('../controllers/chat.controller');

const router = express.Router();

router.get('/', auth(true), listConversations);
router.get('/with/:userId', auth(true), getOrCreateConversation);
router.get('/:conversationId/messages', auth(true), listMessages);
router.post('/message', auth(true), sendMessage);

module.exports = router;
