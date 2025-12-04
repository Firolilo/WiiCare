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

// ========== PATIENT PROFILE ==========

// Listar pacientes del cuidador
exports.getCaregiverPatients = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const filter = { caregiver: req.user.id };
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const patients = await PatientProfile.find(filter)
    .populate('patient', 'name email')
    .populate('careTemplate', 'name patientType')
    .sort({ createdAt: -1 });
  
  res.json({ patients });
});

// Obtener perfil completo de un paciente
exports.getPatientProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const profile = await PatientProfile.findOne({
    _id: id,
    caregiver: req.user.id
  })
    .populate('patient', 'name email')
    .populate('careTemplate');
  
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }
  
  res.json({ profile });
});

// Actualizar perfil de paciente
exports.updatePatientProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const profile = await PatientProfile.findOneAndUpdate(
    { _id: id, caregiver: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('patient', 'name email').populate('careTemplate');
  
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }
  
  res.json({ profile });
});

// ========== DAILY CARE ==========

// Crear tarea de cuidado diario
exports.createDailyCare = asyncHandler(async (req, res) => {
  const { patientProfile, task, description, category, date, scheduledTime } = req.body;
  
  // Verificar que el cuidador tiene acceso a este paciente
  const profile = await PatientProfile.findOne({
    _id: patientProfile,
    caregiver: req.user.id
  });
  
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }
  
  const dailyCare = await DailyCare.create({
    patientProfile,
    caregiver: req.user.id,
    patient: profile.patient,
    task,
    description,
    category,
    date,
    scheduledTime
  });
  
  res.status(201).json({ dailyCare });
});

// Listar tareas de cuidado
exports.getDailyCare = asyncHandler(async (req, res) => {
  const { patientProfile, date, completed } = req.query;
  const filter = { caregiver: req.user.id };
  
  if (patientProfile) filter.patientProfile = patientProfile;
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  }
  if (completed !== undefined) filter.completed = completed === 'true';
  
  const dailyCare = await DailyCare.find(filter)
    .populate('patientProfile', 'patientType')
    .populate('patient', 'name')
    .sort({ date: -1, scheduledTime: 1 });
  
  res.json({ dailyCare });
});

// Marcar tarea como completada
exports.completeDailyCare = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  
  const dailyCare = await DailyCare.findOneAndUpdate(
    { _id: id, caregiver: req.user.id },
    { 
      completed: true, 
      completedAt: new Date(),
      notes: notes || undefined
    },
    { new: true }
  );
  
  if (!dailyCare) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  
  // TODO: Notificar al paciente
  
  res.json({ dailyCare });
});

// Actualizar tarea
exports.updateDailyCare = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const dailyCare = await DailyCare.findOneAndUpdate(
    { _id: id, caregiver: req.user.id },
    { $set: updates },
    { new: true }
  );
  
  if (!dailyCare) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  
  res.json({ dailyCare });
});

// Eliminar tarea
exports.deleteDailyCare = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const dailyCare = await DailyCare.findOneAndDelete({
    _id: id,
    caregiver: req.user.id
  });
  
  if (!dailyCare) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  
  res.json({ ok: true });
});

// ========== MEDICATIONS ==========

// Crear medicamento
exports.createMedication = asyncHandler(async (req, res) => {
  const { patientProfile, name, type, dose, frequency, customSchedule, startDate, endDate, instructions, sideEffects, reminderEnabled } = req.body;
  
  const profile = await PatientProfile.findOne({
    _id: patientProfile,
    caregiver: req.user.id
  });
  
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }
  
  const medication = await Medication.create({
    patientProfile,
    caregiver: req.user.id,
    patient: profile.patient,
    name,
    type,
    dose,
    frequency,
    customSchedule,
    startDate,
    endDate,
    instructions,
    sideEffects,
    reminderEnabled
  });
  
  res.status(201).json({ medication });
});

// Listar medicamentos
exports.getMedications = asyncHandler(async (req, res) => {
  const { patientProfile, isActive } = req.query;
  const filter = { caregiver: req.user.id };
  
  if (patientProfile) filter.patientProfile = patientProfile;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const medications = await Medication.find(filter)
    .populate('patient', 'name')
    .sort({ startDate: -1 });
  
  res.json({ medications });
});

// Actualizar medicamento
exports.updateMedication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const medication = await Medication.findOneAndUpdate(
    { _id: id, caregiver: req.user.id },
    { $set: updates },
    { new: true }
  );
  
  if (!medication) {
    return res.status(404).json({ message: 'Medicamento no encontrado' });
  }
  
  res.json({ medication });
});

// Eliminar medicamento
exports.deleteMedication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const medication = await Medication.findOneAndDelete({
    _id: id,
    caregiver: req.user.id
  });
  
  if (!medication) {
    return res.status(404).json({ message: 'Medicamento no encontrado' });
  }
  
  res.json({ ok: true });
});

// ========== RECOMMENDATIONS ==========

// Crear recomendación
exports.createRecommendation = asyncHandler(async (req, res) => {
  const { patientProfile, title, content, category, priority } = req.body;
  
  const profile = await PatientProfile.findOne({
    _id: patientProfile,
    caregiver: req.user.id
  });
  
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }
  
  const recommendation = await Recommendation.create({
    patientProfile,
    caregiver: req.user.id,
    patient: profile.patient,
    title,
    content,
    category,
    priority
  });
  
  res.status(201).json({ recommendation });
});

// Listar recomendaciones
exports.getRecommendations = asyncHandler(async (req, res) => {
  const { patientProfile, isActive } = req.query;
  const filter = { caregiver: req.user.id };
  
  if (patientProfile) filter.patientProfile = patientProfile;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const recommendations = await Recommendation.find(filter)
    .populate('patient', 'name')
    .sort({ priority: -1, createdAt: -1 });
  
  res.json({ recommendations });
});

// Actualizar recomendación
exports.updateRecommendation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const recommendation = await Recommendation.findOneAndUpdate(
    { _id: id, caregiver: req.user.id },
    { $set: updates },
    { new: true }
  );
  
  if (!recommendation) {
    return res.status(404).json({ message: 'Recomendación no encontrada' });
  }
  
  res.json({ recommendation });
});

// Eliminar recomendación
exports.deleteRecommendation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const recommendation = await Recommendation.findOneAndDelete({
    _id: id,
    caregiver: req.user.id
  });
  
  if (!recommendation) {
    return res.status(404).json({ message: 'Recomendación no encontrada' });
  }
  
  res.json({ ok: true });
});

// ========== INCIDENTS ==========

// Crear incidente
exports.createIncident = asyncHandler(async (req, res) => {
  const { patientProfile, type, severity, title, description, occurredAt, actionsTaken } = req.body;
  
  const profile = await PatientProfile.findOne({
    _id: patientProfile,
    caregiver: req.user.id
  });
  
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }
  
  const incident = await Incident.create({
    patientProfile,
    caregiver: req.user.id,
    patient: profile.patient,
    type,
    severity,
    title,
    description,
    occurredAt,
    actionsTaken
  });
  
  // TODO: Enviar notificación crítica si severity === 'critical'
  
  res.status(201).json({ incident });
});

// Listar incidentes
exports.getIncidents = asyncHandler(async (req, res) => {
  const { patientProfile, severity, resolved } = req.query;
  const filter = { caregiver: req.user.id };
  
  if (patientProfile) filter.patientProfile = patientProfile;
  if (severity) filter.severity = severity;
  if (resolved !== undefined) filter.resolved = resolved === 'true';
  
  const incidents = await Incident.find(filter)
    .populate('patient', 'name')
    .sort({ occurredAt: -1 });
  
  res.json({ incidents });
});

// Marcar incidente como resuelto
exports.resolveIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resolutionNotes } = req.body;
  
  const incident = await Incident.findOneAndUpdate(
    { _id: id, caregiver: req.user.id },
    { 
      resolved: true, 
      resolvedAt: new Date(),
      resolutionNotes
    },
    { new: true }
  );
  
  if (!incident) {
    return res.status(404).json({ message: 'Incidente no encontrado' });
  }
  
  res.json({ incident });
});

// Actualizar incidente
exports.updateIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const incident = await Incident.findOneAndUpdate(
    { _id: id, caregiver: req.user.id },
    { $set: updates },
    { new: true }
  );
  
  if (!incident) {
    return res.status(404).json({ message: 'Incidente no encontrado' });
  }
  
  res.json({ incident });
});

// ========== APPOINTMENTS ==========

// Crear cita
exports.createAppointment = asyncHandler(async (req, res) => {
  const { patientProfile, title, description, type, startTime, endTime, location, reminderEnabled, reminderTime } = req.body;
  
  const profile = await PatientProfile.findOne({
    _id: patientProfile,
    caregiver: req.user.id
  });
  
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }
  
  const appointment = await Appointment.create({
    patientProfile,
    caregiver: req.user.id,
    patient: profile.patient,
    title,
    description,
    type,
    startTime,
    endTime,
    location,
    reminderEnabled,
    reminderTime
  });
  
  res.status(201).json({ appointment });
});

// Listar citas
exports.getAppointments = asyncHandler(async (req, res) => {
  const { patientProfile, status, startDate, endDate } = req.query;
  const filter = { caregiver: req.user.id };
  
  if (patientProfile) filter.patientProfile = patientProfile;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.startTime = {};
    if (startDate) filter.startTime.$gte = new Date(startDate);
    if (endDate) filter.startTime.$lte = new Date(endDate);
  }
  
  const appointments = await Appointment.find(filter)
    .populate('patient', 'name')
    .sort({ startTime: 1 });
  
  res.json({ appointments });
});

// Actualizar cita
exports.updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const appointment = await Appointment.findOneAndUpdate(
    { _id: id, caregiver: req.user.id },
    { $set: updates },
    { new: true }
  );
  
  if (!appointment) {
    return res.status(404).json({ message: 'Cita no encontrada' });
  }
  
  res.json({ appointment });
});

// Eliminar cita
exports.deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const appointment = await Appointment.findOneAndDelete({
    _id: id,
    caregiver: req.user.id
  });
  
  if (!appointment) {
    return res.status(404).json({ message: 'Cita no encontrada' });
  }
  
  res.json({ ok: true });
});

// ========== HEALTH INDICATORS ==========

// Crear indicador de salud
exports.createHealthIndicator = asyncHandler(async (req, res) => {
  const { patientProfile, type, customName, value, unit, measuredAt, notes, isAbnormal } = req.body;
  
  const profile = await PatientProfile.findOne({
    _id: patientProfile,
    caregiver: req.user.id
  });
  
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }
  
  const healthIndicator = await HealthIndicator.create({
    patientProfile,
    caregiver: req.user.id,
    patient: profile.patient,
    type,
    customName,
    value,
    unit,
    measuredAt,
    notes,
    isAbnormal
  });
  
  // TODO: Enviar alerta si isAbnormal === true
  
  res.status(201).json({ healthIndicator });
});

// Listar indicadores de salud
exports.getHealthIndicators = asyncHandler(async (req, res) => {
  const { patientProfile, type, startDate, endDate } = req.query;
  const filter = { caregiver: req.user.id };
  
  if (patientProfile) filter.patientProfile = patientProfile;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.measuredAt = {};
    if (startDate) filter.measuredAt.$gte = new Date(startDate);
    if (endDate) filter.measuredAt.$lte = new Date(endDate);
  }
  
  const healthIndicators = await HealthIndicator.find(filter)
    .populate('patient', 'name')
    .sort({ measuredAt: -1 });
  
  res.json({ healthIndicators });
});

// Actualizar indicador
exports.updateHealthIndicator = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const healthIndicator = await HealthIndicator.findOneAndUpdate(
    { _id: id, caregiver: req.user.id },
    { $set: updates },
    { new: true }
  );
  
  if (!healthIndicator) {
    return res.status(404).json({ message: 'Indicador no encontrado' });
  }
  
  res.json({ healthIndicator });
});

// ========== CARE PLANS ==========

// Crear plan de cuidado
exports.createCarePlan = asyncHandler(async (req, res) => {
  const { patientProfile, title, period, startDate, endDate, goals, description } = req.body;
  
  const profile = await PatientProfile.findOne({
    _id: patientProfile,
    caregiver: req.user.id
  });
  
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }
  
  const carePlan = await CarePlan.create({
    patientProfile,
    caregiver: req.user.id,
    patient: profile.patient,
    title,
    period,
    startDate,
    endDate,
    goals,
    description
  });
  
  res.status(201).json({ carePlan });
});

// Listar planes de cuidado
exports.getCarePlans = asyncHandler(async (req, res) => {
  const { patientProfile, isActive } = req.query;
  const filter = { caregiver: req.user.id };
  
  if (patientProfile) filter.patientProfile = patientProfile;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const carePlans = await CarePlan.find(filter)
    .populate('patient', 'name')
    .sort({ startDate: -1 });
  
  res.json({ carePlans });
});

// Actualizar plan de cuidado
exports.updateCarePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const carePlan = await CarePlan.findOneAndUpdate(
    { _id: id, caregiver: req.user.id },
    { $set: updates },
    { new: true }
  );
  
  if (!carePlan) {
    return res.status(404).json({ message: 'Plan de cuidado no encontrado' });
  }
  
  res.json({ carePlan });
});

// Marcar objetivo como logrado
exports.achieveGoal = asyncHandler(async (req, res) => {
  const { planId, goalId } = req.params;
  
  const carePlan = await CarePlan.findOne({
    _id: planId,
    caregiver: req.user.id
  });
  
  if (!carePlan) {
    return res.status(404).json({ message: 'Plan de cuidado no encontrado' });
  }
  
  const goal = carePlan.goals.id(goalId);
  if (!goal) {
    return res.status(404).json({ message: 'Objetivo no encontrado' });
  }
  
  goal.achieved = true;
  goal.achievedDate = new Date();
  await carePlan.save();
  
  res.json({ carePlan });
});
