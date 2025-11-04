const { Schema, model, Types } = require('mongoose');

const ServiceSchema = new Schema(
  {
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    rate: { type: Number, required: true, min: 0 },
    tags: [{ type: String }],
    location: { type: String, default: '' },
    availability: { type: String, default: '' }
  },
  { timestamps: true }
);

ServiceSchema.index({ title: 'text', description: 'text', tags: 1, location: 1 });

module.exports = model('Service', ServiceSchema);
