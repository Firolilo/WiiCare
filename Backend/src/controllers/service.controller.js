const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');

exports.createService = asyncHandler(async (req, res) => {
  const { title, description, rate, tags, location, availability } = req.body;
  const service = await Service.create({
    caregiver: req.user.id,
    title,
    description,
    rate,
    tags,
    location,
    availability,
  });
  res.status(201).json({ service });
});

exports.listServices = asyncHandler(async (req, res) => {
  const { query, tag, location, caregiver } = req.query;
  const filter = {};
  if (query) filter.$text = { $search: query };
  if (tag) filter.tags = tag;
  if (location) filter.location = location;
  if (caregiver) filter.caregiver = caregiver;
  const services = await Service.find(filter).populate('caregiver', 'name email rating location');
  res.json({ services });
});

exports.getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate('caregiver', 'name email rating location');
  if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
  res.json({ service });
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findOneAndUpdate(
    { _id: req.params.id, caregiver: req.user.id },
    { $set: req.body },
    { new: true }
  );
  if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
  res.json({ service });
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findOneAndDelete({ _id: req.params.id, caregiver: req.user.id });
  if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
  res.json({ ok: true });
});
