const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const serviceRoutes = require('./service.routes');
const chatRoutes = require('./chat.routes');
const serviceRequestRoutes = require('./serviceRequest.routes');
const patientManagementRoutes = require('./patientManagement.routes');
const careTemplateRoutes = require('./careTemplate.routes');
const patientViewRoutes = require('./patientView.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/chat', chatRoutes);
router.use('/service-requests', serviceRequestRoutes);
router.use('/patient-management', patientManagementRoutes);
router.use('/care-templates', careTemplateRoutes);
router.use('/my-care', patientViewRoutes);

module.exports = router;
