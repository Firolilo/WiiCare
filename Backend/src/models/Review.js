const { Schema, model, Types } = require('mongoose');

const ReviewSchema = new Schema(
  {
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    author: { type: Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' }
  },
  { timestamps: true }
);

ReviewSchema.index({ caregiver: 1, createdAt: -1 });

module.exports = model('Review', ReviewSchema);
