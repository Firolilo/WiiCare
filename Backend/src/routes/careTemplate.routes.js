const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const careTemplateController = require('../controllers/careTemplate.controller');

router.post('/', auth(), careTemplateController.createTemplate);
router.get('/', auth(), careTemplateController.getTemplates);
router.get('/:id', auth(), careTemplateController.getTemplate);
router.patch('/:id', auth(), careTemplateController.updateTemplate);
router.delete('/:id', auth(), careTemplateController.deleteTemplate);

module.exports = router;
