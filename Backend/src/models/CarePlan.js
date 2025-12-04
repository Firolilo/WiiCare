const { Schema, model, Types } = require('mongoose');

const GoalSchema = new Schema({
  description: { type: String, required: true },
  targetDate: { type: Date },
  achieved: { type: Boolean, default: false },
  achievedDate: { type: Date }
}, { _id: true });

const CarePlanSchema = new Schema(
  {
    patientProfile: { type: Types.ObjectId, ref: 'PatientProfile', required: true },
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    patient: { type: Types.ObjectId, ref: 'User', required: true },
    
    title: { type: String, required: true },
    period: { 
      type: String, 
      enum: ['weekly', 'monthly', 'quarterly', 'custom'],
      required: true
    },
    
    // Fechas
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    // Objetivos
    goals: [GoalSchema],
    
    // Descripción general
    description: { type: String },
    
    // Estado
    isActive: { type: Boolean, default: true },
    
    // Evaluación
    evaluation: { type: String },
    evaluatedAt: { type: Date }
  },
  { timestamps: true }
);

CarePlanSchema.index({ patientProfile: 1, isActive: 1 });
CarePlanSchema.index({ patient: 1, startDate: -1 });

module.exports = model('CarePlan', CarePlanSchema);
