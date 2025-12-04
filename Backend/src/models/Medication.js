const { Schema, model, Types } = require('mongoose');

const DoseScheduleSchema = new Schema({
  time: { type: String, required: true }, // HH:mm format
  dose: { type: String, required: true },
  taken: { type: Boolean, default: false },
  takenAt: { type: Date }
}, { _id: false });

const MedicationSchema = new Schema(
  {
    patientProfile: { type: Types.ObjectId, ref: 'PatientProfile', required: true },
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    patient: { type: Types.ObjectId, ref: 'User', required: true },
    
    // Información del medicamento
    name: { type: String, required: true },
    type: { type: String }, // pastilla, jarabe, inyección, etc.
    dose: { type: String, required: true },
    
    // Frecuencia
    frequency: { 
      type: String, 
      enum: ['once', 'daily', 'twice-daily', 'three-times-daily', 'weekly', 'custom'],
      required: true
    },
    customSchedule: [DoseScheduleSchema], // Para frecuencia custom
    
    // Fechas
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    
    // Instrucciones
    instructions: { type: String },
    sideEffects: { type: String },
    
    // Estado
    isActive: { type: Boolean, default: true },
    
    // Recordatorios
    reminderEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

MedicationSchema.index({ patientProfile: 1, isActive: 1 });
MedicationSchema.index({ patient: 1, isActive: 1 });

module.exports = model('Medication', MedicationSchema);
