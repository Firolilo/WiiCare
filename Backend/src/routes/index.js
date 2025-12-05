const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const serviceRoutes = require('./service.routes');
const chatRoutes = require('./chat.routes');
const forceRoutes = require('./force.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/chat', chatRoutes);
router.use('/force', forceRoutes);

module.exports = router;
