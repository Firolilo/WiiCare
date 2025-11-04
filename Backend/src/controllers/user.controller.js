const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.getProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, location } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { name, bio, location } },
    { new: true }
  ).select('-passwordHash');
  res.json({ user });
});

exports.listCaregivers = asyncHandler(async (_req, res) => {
  const caregivers = await User.find({ role: 'caregiver' }).select('name location rating');
  res.json({ caregivers });
});
