const ServiceRequest = require('../models/ServiceRequest');
const PatientProfile = require('../models/PatientProfile');
const CareTemplate = require('../models/CareTemplate');
const asyncHandler = require('../utils/asyncHandler');

// Crear solicitud de servicio 
const createServiceRequest = asyncHandler(async (req, res) => {
  const { caregiver, service, message, patientType, startDate, endDate } = req.body;
  
  const serviceRequest = await ServiceRequest.create({
    patient: req.user.id,
    caregiver,
    service,
    message,
    patientType,
    startDate,
    endDate
  });
  
  // TODO: Enviar notificación al cuidador por Socket.IO
  
  res.status(201).json({ serviceRequest });
});

// Listar solicitudes (para cuidador)
const getCaregiverRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { caregiver: req.user.id };
  if (status) filter.status = status;
  
  const requests = await ServiceRequest.find(filter)
    .populate('patient', 'name email')
    .populate('service', 'title description rate')
    .sort({ createdAt: -1 });
  
  res.json({ requests });
});

// Listar solicitudes (para paciente)
const getPatientRequests = asyncHandler(async (req, res) => {
  const requests = await ServiceRequest.find({ patient: req.user.id })
    .populate('caregiver', 'name email rating')
    .populate('service', 'title description rate')
    .sort({ createdAt: -1 });
  
  res.json({ requests });
});

// Aceptar solicitud
const acceptRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const serviceRequest = await ServiceRequest.findOne({
    _id: id,
    caregiver: req.user.id,
    status: 'pending'
  });
  
  if (!serviceRequest) {
    return res.status(404).json({ message: 'Solicitud no encontrada' });
  }
  
  serviceRequest.status = 'accepted';
  await serviceRequest.save();
  
  // Crear perfil de paciente
  const patientProfile = await PatientProfile.create({
    patient: serviceRequest.patient,
    caregiver: req.user.id,
    serviceRequest: serviceRequest._id,
    patientType: serviceRequest.patientType
  });
  
  // Aplicar plantilla de cuidado automáticamente
  const template = await CareTemplate.findOne({
    patientType: serviceRequest.patientType,
    isSystemTemplate: true
  });
  
  if (template) {
    patientProfile.careTemplate = template._id;
    await patientProfile.save();
  }
  
  // TODO: Enviar notificación al paciente por Socket.IO
  
  res.json({ serviceRequest, patientProfile });
});

// Rechazar solicitud
const rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  
  const serviceRequest = await ServiceRequest.findOneAndUpdate(
    { _id: id, caregiver: req.user.id, status: 'pending' },
    { status: 'rejected', notes },
    { new: true }
  );
  
  if (!serviceRequest) {
    return res.status(404).json({ message: 'Solicitud no encontrada' });
  }
  
  // TODO: Enviar notificación al paciente por Socket.IO
  
  res.json({ serviceRequest });
});

module.exports = {
  createServiceRequest,
  getCaregiverRequests,
  getPatientRequests,
  acceptRequest,
  rejectRequest
};
