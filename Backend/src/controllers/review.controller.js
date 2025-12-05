const Review = require('../models/Review');
const User = require('../models/User');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const PatientProfile = require('../models/PatientProfile');
const Conversation = require('../models/Conversation');
const asyncHandler = require('express-async-handler');

/**
 * Crear una reseña para un cuidador
 * POST /api/reviews
 */
exports.createReview = asyncHandler(async (req, res) => {
  const { caregiverId, rating, comment } = req.body;
  const authorId = req.user.id;

  if (!caregiverId || !rating) {
    return res.status(400).json({ message: 'Se requiere caregiverId y rating' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'El rating debe estar entre 1 y 5' });
  }

  // Verificar que el cuidador existe y es un cuidador
  const caregiver = await User.findById(caregiverId);
  if (!caregiver || caregiver.role !== 'caregiver') {
    return res.status(404).json({ message: 'Cuidador no encontrado' });
  }

  // Verificar que el usuario no se califique a sí mismo
  if (caregiverId === authorId) {
    return res.status(400).json({ message: 'No puedes calificarte a ti mismo' });
  }

  // Verificar si ya existe una reseña de este usuario para este cuidador
  const existingReview = await Review.findOne({ caregiver: caregiverId, author: authorId });
  if (existingReview) {
    // Actualizar la reseña existente
    existingReview.rating = rating;
    existingReview.comment = comment || '';
    await existingReview.save();
    
    return res.json({ 
      message: 'Reseña actualizada',
      review: existingReview 
    });
  }

  // Crear nueva reseña
  const review = await Review.create({
    caregiver: caregiverId,
    author: authorId,
    rating,
    comment: comment || ''
  });

  res.status(201).json({ 
    message: 'Reseña creada',
    review 
  });
});

/**
 * Obtener reseñas de un cuidador
 * GET /api/reviews/caregiver/:caregiverId
 */
exports.getCaregiverReviews = asyncHandler(async (req, res) => {
  const { caregiverId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({ caregiver: caregiverId })
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ caregiver: caregiverId });

  // Calcular promedio
  const stats = await Review.aggregate([
    { $match: { caregiver: require('mongoose').Types.ObjectId.createFromHexString(caregiverId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratings: {
          $push: '$rating'
        }
      }
    }
  ]);

  const ratingStats = stats[0] || { averageRating: 0, totalReviews: 0 };

  // Contar por estrellas
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (stats[0]?.ratings) {
    stats[0].ratings.forEach(r => {
      ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
    });
  }

  res.json({
    reviews,
    stats: {
      averageRating: ratingStats.averageRating ? parseFloat(ratingStats.averageRating.toFixed(1)) : 0,
      totalReviews: ratingStats.totalReviews,
      ratingDistribution
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * Obtener mi reseña para un cuidador específico
 * GET /api/reviews/my-review/:caregiverId
 */
exports.getMyReview = asyncHandler(async (req, res) => {
  const { caregiverId } = req.params;
  const authorId = req.user.id;

  const review = await Review.findOne({ caregiver: caregiverId, author: authorId });

  res.json({ review: review || null });
});

/**
 * Eliminar mi reseña
 * DELETE /api/reviews/:reviewId
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const authorId = req.user.id;

  const review = await Review.findOneAndDelete({ _id: reviewId, author: authorId });

  if (!review) {
    return res.status(404).json({ message: 'Reseña no encontrada o no tienes permiso' });
  }

  res.json({ message: 'Reseña eliminada' });
});

/**
 * Obtener estadísticas del dashboard del cuidador
 * GET /api/reviews/caregiver-dashboard
 */
exports.getCaregiverDashboard = asyncHandler(async (req, res) => {
  const caregiverId = req.user.id;

  // Servicios activos
  const activeServices = await Service.countDocuments({ 
    caregiver: caregiverId,
    isActive: true 
  });

  // Servicios del cuidador
  const services = await Service.find({ caregiver: caregiverId, isActive: true })
    .select('title price category')
    .limit(5);

  // Solicitudes pendientes (nuevas consultas)
  const pendingRequests = await ServiceRequest.countDocuments({
    caregiver: caregiverId,
    status: 'pending'
  });

  // Solicitudes recientes
  const recentRequests = await ServiceRequest.find({
    caregiver: caregiverId,
    status: 'pending'
  })
    .populate('patient', 'name')
    .populate('service', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

  // Pacientes activos
  const activePatients = await PatientProfile.countDocuments({
    caregiver: caregiverId,
    isActive: true
  });

  // Conversaciones con mensajes no leídos
  const conversations = await Conversation.find({
    participants: caregiverId
  }).populate('lastMessage');

  const unreadConversations = conversations.filter(c => {
    if (!c.lastMessage) return false;
    return c.lastMessage.sender.toString() !== caregiverId && !c.lastMessage.read;
  }).length;

  // Estadísticas de reseñas
  const reviewStats = await Review.aggregate([
    { $match: { caregiver: require('mongoose').Types.ObjectId.createFromHexString(caregiverId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const rating = reviewStats[0] || { averageRating: 0, totalReviews: 0 };

  // Reseñas recientes
  const recentReviews = await Review.find({ caregiver: caregiverId })
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .limit(3);

  res.json({
    success: true,
    data: {
      activeServices,
      newRequests: pendingRequests,
      activePatients,
      unreadMessages: unreadConversations,
      averageRating: rating.averageRating ? parseFloat(rating.averageRating.toFixed(1)) : 0,
      totalReviews: rating.totalReviews
    },
    services,
    recentRequests,
    recentReviews
  });
});
