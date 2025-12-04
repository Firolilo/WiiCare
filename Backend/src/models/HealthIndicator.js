const { Schema, model, Types } = require('mongoose');

const HealthIndicatorSchema = new Schema(
  {
    patientProfile: { type: Types.ObjectId, ref: 'PatientProfile', required: true },
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    patient: { type: Types.ObjectId, ref: 'User', required: true },
    
    // Tipo de indicador
    type: { 
      type: String, 
      enum: ['blood-pressure', 'heart-rate', 'temperature', 'glucose', 'weight', 'oxygen', 'mood', 'sleep', 'pain', 'custom'],
      required: true
    },
    
    customName: { type: String }, // Para type: 'custom'
    
    // Valor medido
    value: { type: String, required: true },
    unit: { type: String },
    
    // Fecha de medición
    measuredAt: { type: Date, required: true, default: Date.now },
    
    // Notas
    notes: { type: String },
    
    // Alertas
    isAbnormal: { type: Boolean, default: false },
    alertSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

HealthIndicatorSchema.index({ patientProfile: 1, measuredAt: -1 });
HealthIndicatorSchema.index({ patient: 1, type: 1, measuredAt: -1 });

module.exports = model('HealthIndicator', HealthIndicatorSchema);
