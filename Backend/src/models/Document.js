const { Schema, model, Types } = require('mongoose');

const DocumentSchema = new Schema(
  {
    patientProfile: { type: Types.ObjectId, ref: 'PatientProfile', required: true },
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    patient: { type: Types.ObjectId, ref: 'User', required: true },
    
    // Información del archivo
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String }, // MIME type
    fileSize: { type: Number }, // bytes
    
    // Categoría
    category: { 
      type: String, 
      enum: ['prescription', 'medical-report', 'lab-result', 'image', 'other'],
      default: 'other'
    },
    
    // Descripción
    description: { type: String },
    
    // Fecha del documento
    documentDate: { type: Date },
    
    // Visibilidad
    visibleToPatient: { type: Boolean, default: true }
  },
  { timestamps: true }
);

DocumentSchema.index({ patientProfile: 1, createdAt: -1 });
DocumentSchema.index({ patient: 1, category: 1 });

module.exports = model('Document', DocumentSchema);
