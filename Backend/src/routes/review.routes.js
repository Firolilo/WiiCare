const express = require('express');
const reviewController = require('../controllers/review.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Crear o actualizar una reseña
 * @body    { caregiverId, rating, comment? }
 * @access  Private (usuarios)
 */
router.post('/', auth(), reviewController.createReview);

/**
 * @route   GET /api/reviews/caregiver-dashboard
 * @desc    Obtener estadísticas del dashboard del cuidador
 * @access  Private (cuidadores)
 */
router.get('/caregiver-dashboard', auth(), reviewController.getCaregiverDashboard);

/**
 * @route   GET /api/reviews/caregiver/:caregiverId
 * @desc    Obtener reseñas de un cuidador
 * @query   { page?, limit? }
 * @access  Public
 */
router.get('/caregiver/:caregiverId', reviewController.getCaregiverReviews);

/**
 * @route   GET /api/reviews/my-review/:caregiverId
 * @desc    Obtener mi reseña para un cuidador
 * @access  Private
 */
router.get('/my-review/:caregiverId', auth(), reviewController.getMyReview);

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Eliminar mi reseña
 * @access  Private
 */
router.delete('/:reviewId', auth(), reviewController.deleteReview);

module.exports = router;
