const express = require('express');

const { getProfile, updateProfile, listCaregivers } = require('../controllers/user.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/caregivers', listCaregivers);
router.get('/:id', getProfile);
router.put('/me', auth(true), updateProfile);

module.exports = router;
