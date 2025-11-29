const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Campos requeridos: name, email, password, role' });
  }
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email ya registrado' });
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role });
  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });
  const token = signToken({ id: user._id, role: user.role });
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ user });
});
