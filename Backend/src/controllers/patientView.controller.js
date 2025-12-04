const PatientProfile = require('../models/PatientProfile');
const DailyCare = require('../models/DailyCare');
const Medication = require('../models/Medication');
const Recommendation = require('../models/Recommendation');
const Incident = require('../models/Incident');
const Appointment = require('../models/Appointment');
const HealthIndicator = require('../models/HealthIndicator');
const Document = require('../models/Document');
const CarePlan = require('../models/CarePlan');
const asyncHandler = require('../utils/asyncHandler');

// Panel completo del paciente (vista espejo)
exports.getMyCareDashboard = asyncHandler(async (req, res) => {
  // Buscar perfil del paciente
  const profile = await PatientProfile.findOne({
    patient: req.user.id,
    isActive: true
  })
    .populate('caregiver', 'name email rating bio')
    .populate('careTemplate', 'name description');
  
  if (!profile) {
    return res.status(404).json({ message: 'No tienes un cuidador asignado actualmente' });
  }
  
  // Obtener todos los datos en paralelo
  const [
    dailyCare,
    medications,
    recommendations,
    incidents,
    appointments,
    healthIndicators,
    documents,
    carePlans
  ] = await Promise.all([
    DailyCare.find({ patient: req.user.id }).sort({ date: -1 }).limit(20),
    Medication.find({ patient: req.user.id, isActive: true }).sort({ startDate: -1 }),
    Recommendation.find({ patient: req.user.id, isActive: true }).sort({ priority: -1 }),
    Incident.find({ patient: req.user.id }).sort({ occurredAt: -1 }).limit(10),
    Appointment.find({ patient: req.user.id, status: 'scheduled' }).sort({ startTime: 1 }),
    HealthIndicator.find({ patient: req.user.id }).sort({ measuredAt: -1 }).limit(50),
    Document.find({ patient: req.user.id, visibleToPatient: true }).sort({ createdAt: -1 }),
    CarePlan.find({ patient: req.user.id, isActive: true }).sort({ startDate: -1 })
  ]);
  
  res.json({
    profile,
    dailyCare,
    medications,
    recommendations,
    incidents,
    appointments,
    healthIndicators,
    documents,
    carePlans
  });
});

// Obtener cuidados diarios del paciente
exports.getMyDailyCare = asyncHandler(async (req, res) => {
  const { date, completed } = req.query;
  const filter = { patient: req.user.id };
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  }
  if (completed !== undefined) filter.completed = completed === 'true';
  
  const dailyCare = await DailyCare.find(filter)
    .populate('caregiver', 'name')
    .sort({ date: -1, scheduledTime: 1 });
  
  res.json({ dailyCare });
});

// Obtener medicamentos del paciente
exports.getMyMedications = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const filter = { patient: req.user.id };
  
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const medications = await Medication.find(filter)
    .populate('caregiver', 'name')
    .sort({ startDate: -1 });
  
  res.json({ medications });
});

// Obtener recomendaciones del paciente
exports.getMyRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await Recommendation.find({
    patient: req.user.id,
    isActive: true
  })
    .populate('caregiver', 'name')
    .sort({ priority: -1, createdAt: -1 });
  
  res.json({ recommendations });
});

// Obtener incidentes del paciente
exports.getMyIncidents = asyncHandler(async (req, res) => {
  const { resolved } = req.query;
  const filter = { patient: req.user.id };
  
  if (resolved !== undefined) filter.resolved = resolved === 'true';
  
  const incidents = await Incident.find(filter)
    .populate('caregiver', 'name')
    .sort({ occurredAt: -1 });
  
  res.json({ incidents });
});

// Obtener citas del paciente
exports.getMyAppointments = asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query;
  const filter = { patient: req.user.id };
  
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.startTime = {};
    if (startDate) filter.startTime.$gte = new Date(startDate);
    if (endDate) filter.startTime.$lte = new Date(endDate);
  }
  
  const appointments = await Appointment.find(filter)
    .populate('caregiver', 'name')
    .sort({ startTime: 1 });
  
  res.json({ appointments });
});

// Obtener indicadores de salud del paciente
exports.getMyHealthIndicators = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;
  const filter = { patient: req.user.id };
  
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.measuredAt = {};
    if (startDate) filter.measuredAt.$gte = new Date(startDate);
    if (endDate) filter.measuredAt.$lte = new Date(endDate);
  }
  
  const healthIndicators = await HealthIndicator.find(filter)
    .populate('caregiver', 'name')
    .sort({ measuredAt: -1 });
  
  res.json({ healthIndicators });
});

// Obtener documentos del paciente
exports.getMyDocuments = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { patient: req.user.id, visibleToPatient: true };
  
  if (category) filter.category = category;
  
  const documents = await Document.find(filter)
    .populate('caregiver', 'name')
    .sort({ createdAt: -1 });
  
  res.json({ documents });
});

// Obtener planes de cuidado del paciente
exports.getMyCarePlans = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const filter = { patient: req.user.id };
  
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const carePlans = await CarePlan.find(filter)
    .populate('caregiver', 'name')
    .sort({ startDate: -1 });
  
  res.json({ carePlans });
});
