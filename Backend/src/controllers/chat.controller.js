const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');

exports.listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user.id })
    .sort({ updatedAt: -1 })
    .lean();
  res.json({ conversations });
});

exports.listMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
  res.json({ messages });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;
  if (!recipientId || !content) return res.status(400).json({ message: 'recipientId y content son requeridos' });
  let convo = await Conversation.findOne({ participants: { $all: [req.user.id, recipientId] } });
  if (!convo) {
    convo = await Conversation.create({ participants: [req.user.id, recipientId] });
  }
  const msg = await Message.create({ conversation: convo._id, sender: req.user.id, content });
  convo.lastMessage = content;
  convo.lastMessageAt = msg.createdAt;
  await convo.save();
  res.status(201).json({ message: msg, conversationId: convo._id });
});
