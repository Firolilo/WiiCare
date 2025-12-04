const { Schema, model, Types } = require('mongoose');

const IncidentSchema = new Schema(
  {
    patientProfile: { type: Types.ObjectId, ref: 'PatientProfile', required: true },
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    patient: { type: Types.ObjectId, ref: 'User', required: true },
    
    type: { 
      type: String, 
      enum: ['fall', 'emergency', 'symptom', 'behavior', 'medication-reaction', 'other'],
      required: true
    },
    
    severity: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    
    occurredAt: { type: Date, required: true, default: Date.now },
    
    // Acciones tomadas
    actionsTaken: { type: String },
    
    // Seguimiento
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String },
    
    // Notificación enviada
    notificationSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

IncidentSchema.index({ patientProfile: 1, occurredAt: -1 });
IncidentSchema.index({ patient: 1, severity: 1 });

module.exports = model('Incident', IncidentSchema);
