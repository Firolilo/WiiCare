const { Schema, model, Types } = require('mongoose');

const AppointmentSchema = new Schema(
  {
    patientProfile: { type: Types.ObjectId, ref: 'PatientProfile', required: true },
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    patient: { type: Types.ObjectId, ref: 'User', required: true },
    
    title: { type: String, required: true },
    description: { type: String },
    
    type: { 
      type: String, 
      enum: ['medical', 'therapy', 'checkup', 'visit', 'other'],
      default: 'other'
    },
    
    // Fecha y hora
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    
    // Ubicación
    location: { type: String },
    
    // Estado
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    
    // Recordatorio
    reminderEnabled: { type: Boolean, default: true },
    reminderTime: { type: Number, default: 60 }, // minutos antes
    reminderSent: { type: Boolean, default: false },
    
    // Notas post-cita
    completionNotes: { type: String }
  },
  { timestamps: true }
);

AppointmentSchema.index({ patientProfile: 1, startTime: 1 });
AppointmentSchema.index({ patient: 1, startTime: 1 });

module.exports = model('Appointment', AppointmentSchema);
