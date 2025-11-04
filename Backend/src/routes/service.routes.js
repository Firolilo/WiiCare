const express = require('express');

const { auth, requireRole } = require('../middleware/auth');
const {
  createService,
  listServices,
  getService,
  updateService,
  deleteService,
} = require('../controllers/service.controller');

const router = express.Router();

router.get('/', listServices);
router.get('/:id', getService);
router.post('/', auth(true), requireRole('caregiver'), createService);
router.put('/:id', auth(true), requireRole('caregiver'), updateService);
router.delete('/:id', auth(true), requireRole('caregiver'), deleteService);

module.exports = router;
