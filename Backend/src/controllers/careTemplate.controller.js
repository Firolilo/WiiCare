const CareTemplate = require('../models/CareTemplate');
const asyncHandler = require('../utils/asyncHandler');

// Crear plantilla de cuidado
exports.createTemplate = asyncHandler(async (req, res) => {
  const { name, patientType, description, tasks, recommendations, healthIndicators } = req.body;
  
  const template = await CareTemplate.create({
    name,
    patientType,
    description,
    tasks,
    recommendations,
    healthIndicators,
    isSystemTemplate: req.user.role === 'admin',
    createdBy: req.user.id
  });
  
  res.status(201).json({ template });
});

// Listar plantillas
exports.getTemplates = asyncHandler(async (req, res) => {
  const { patientType } = req.query;
  const filter = {};
  
  // Mostrar plantillas del sistema o del usuario actual
  filter.$or = [
    { isSystemTemplate: true },
    { createdBy: req.user.id }
  ];
  
  if (patientType) filter.patientType = patientType;
  
  const templates = await CareTemplate.find(filter).sort({ isSystemTemplate: -1, createdAt: -1 });
  
  res.json({ templates });
});

// Obtener plantilla específica
exports.getTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const template = await CareTemplate.findById(id);
  
  if (!template) {
    return res.status(404).json({ message: 'Plantilla no encontrada' });
  }
  
  // Verificar permisos
  if (!template.isSystemTemplate && template.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: 'No tienes permiso para ver esta plantilla' });
  }
  
  res.json({ template });
});

// Actualizar plantilla
exports.updateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const template = await CareTemplate.findOne({
    _id: id,
    createdBy: req.user.id,
    isSystemTemplate: false
  });
  
  if (!template) {
    return res.status(404).json({ message: 'Plantilla no encontrada o no tienes permisos' });
  }
  
  Object.assign(template, updates);
  await template.save();
  
  res.json({ template });
});

// Eliminar plantilla
exports.deleteTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const template = await CareTemplate.findOneAndDelete({
    _id: id,
    createdBy: req.user.id,
    isSystemTemplate: false
  });
  
  if (!template) {
    return res.status(404).json({ message: 'Plantilla no encontrada o no tienes permisos' });
  }
  
  res.json({ ok: true });
});
