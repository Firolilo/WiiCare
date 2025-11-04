const { Schema, model, Types } = require('mongoose');

const MessageSchema = new Schema(
  {
    conversation: { type: Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    readAt: { type: Date }
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = model('Message', MessageSchema);
