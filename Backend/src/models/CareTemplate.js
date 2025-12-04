const { Schema, model } = require('mongoose');

const TaskTemplateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'custom'], default: 'daily' },
  category: { type: String, enum: ['hygiene', 'medication', 'nutrition', 'exercise', 'therapy', 'monitoring', 'other'] }
}, { _id: false });

const CareTemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    patientType: { 
      type: String, 
      enum: ['elderly', 'child', 'disability', 'post-surgery', 'temporary'],
      required: true
    },
    description: { type: String },
    
    // Tareas predefinidas
    tasks: [TaskTemplateSchema],
    
    // Recomendaciones generales
    recommendations: [{ type: String }],
    
    // Indicadores de salud a monitorear
    healthIndicators: [{
      name: { type: String },
      unit: { type: String },
      normalRange: { type: String }
    }],
    
    // Plantilla del sistema o personalizada
    isSystemTemplate: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

CareTemplateSchema.index({ patientType: 1, isSystemTemplate: 1 });

module.exports = model('CareTemplate', CareTemplateSchema);
