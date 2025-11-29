const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['caregiver', 'user', 'admin'], required: true },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Índice único en email ya aplicado por unique:true en la definición de campo

module.exports = model('User', UserSchema);
