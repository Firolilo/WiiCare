const { Schema, model, Types } = require('mongoose');

const DailyCareSchema = new Schema(
  {
    patientProfile: { type: Types.ObjectId, ref: 'PatientProfile', required: true },
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    patient: { type: Types.ObjectId, ref: 'User', required: true },
    
    date: { type: Date, required: true, default: Date.now },
    
    // Tarea/actividad
    task: { type: String, required: true },
    description: { type: String },
    category: { 
      type: String, 
      enum: ['hygiene', 'medication', 'nutrition', 'exercise', 'therapy', 'monitoring', 'other'],
      default: 'other'
    },
    
    // Estado
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    
    // Notas
    notes: { type: String },
    
    // Programación
    scheduledTime: { type: String }, // HH:mm format
    reminderSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

DailyCareSchema.index({ patientProfile: 1, date: -1 });
DailyCareSchema.index({ caregiver: 1, completed: 1 });
DailyCareSchema.index({ patient: 1, date: -1 });

module.exports = model('DailyCare', DailyCareSchema);
