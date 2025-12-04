const { Schema, model, Types } = require('mongoose');

const RecommendationSchema = new Schema(
  {
    patientProfile: { type: Types.ObjectId, ref: 'PatientProfile', required: true },
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    patient: { type: Types.ObjectId, ref: 'User', required: true },
    
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['nutrition', 'exercise', 'therapy', 'lifestyle', 'safety', 'general'],
      default: 'general'
    },
    
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

RecommendationSchema.index({ patientProfile: 1, isActive: 1 });
RecommendationSchema.index({ patient: 1 });

module.exports = model('Recommendation', RecommendationSchema);
