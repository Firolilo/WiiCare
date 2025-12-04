const { Schema, model, Types } = require('mongoose');

const ServiceRequestSchema = new Schema(
  {
    patient: { type: Types.ObjectId, ref: 'User', required: true },
    caregiver: { type: Types.ObjectId, ref: 'User', required: true },
    service: { type: Types.ObjectId, ref: 'Service', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'cancelled'], 
      default: 'pending' 
    },
    message: { type: String, default: '' },
    patientType: { 
      type: String, 
      enum: ['elderly', 'child', 'disability', 'post-surgery', 'temporary'],
      required: true
    },
    startDate: { type: Date },
    endDate: { type: Date },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

ServiceRequestSchema.index({ caregiver: 1, status: 1 });
ServiceRequestSchema.index({ patient: 1, status: 1 });

module.exports = model('ServiceRequest', ServiceRequestSchema);
