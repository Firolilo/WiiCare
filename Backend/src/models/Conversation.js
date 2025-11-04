const { Schema, model, Types } = require('mongoose');

const ConversationSchema = new Schema(
  {
    participants: [{ type: Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });

module.exports = model('Conversation', ConversationSchema);
