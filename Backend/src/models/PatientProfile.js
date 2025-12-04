const { Schema, model, Types } = require('mongoose');

const EmergencyContactSchema = new Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String }
}, { _id: false });

const PatientProfileSchema = new Schema(
  {
    patient: { type: Types.ObjectId, ref: 'User', required: true },
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    serviceRequest: { type: Types.ObjectId, ref: 'ServiceRequest', required: true },
    
    // Información básica
    patientType: { 
      type: String, 
      enum: ['elderly', 'child', 'disability', 'post-surgery', 'temporary'],
      required: true
    },
    age: { type: Number },
    gender: { type: String },
    
    // Historial médico
    allergies: [{ type: String }],
    diagnoses: [{ type: String }],
    chronicConditions: [{ type: String }],
    
    // Contactos de emergencia
    emergencyContacts: [EmergencyContactSchema],
    
    // Preferencias
    preferences: {
      dietaryRestrictions: [{ type: String }],
      mobilityLevel: { type: String, enum: ['independent', 'assisted', 'wheelchair', 'bedridden'] },
      communicationNotes: { type: String },
      behavioralNotes: { type: String }
    },
    
    // Plantilla aplicada
    careTemplate: { type: Types.ObjectId, ref: 'CareTemplate' },
    
    // Estado activo
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

PatientProfileSchema.index({ caregiver: 1, isActive: 1 });
PatientProfileSchema.index({ patient: 1 });

module.exports = model('PatientProfile', PatientProfileSchema);
