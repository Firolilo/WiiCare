import api from './client';

/**
 * Crear o actualizar una reseña para un cuidador
 * @param {Object} data - { caregiverId, rating, comment? }
 * @returns {Promise<Object>} - La reseña creada/actualizada
 */
export const createReview = async (data) => {
  const response = await api.post('/reviews', data);
  return response.data;
};

/**
 * Obtener reseñas de un cuidador
 * @param {string} caregiverId - ID del cuidador
 * @param {Object} params - { page?, limit? }
 * @returns {Promise<Object>} - { reviews, averageRating, totalReviews, pagination }
 */
export const getCaregiverReviews = async (caregiverId, params = {}) => {
  const response = await api.get(`/reviews/caregiver/${caregiverId}`, { params });
  return response.data;
};

/**
 * Obtener mi reseña para un cuidador específico
 * @param {string} caregiverId - ID del cuidador
 * @returns {Promise<Object|null>} - La reseña o null si no existe
 */
export const getMyReview = async (caregiverId) => {
  const response = await api.get(`/reviews/my-review/${caregiverId}`);
  return response.data;
};

/**
 * Eliminar mi reseña
 * @param {string} reviewId - ID de la reseña
 * @returns {Promise<Object>}
 */
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * Obtener estadísticas del dashboard del cuidador
 * @returns {Promise<Object>} - { activeServices, newRequests, averageRating, totalReviews, recentReviews, monthlyEarnings }
 */
export const getCaregiverDashboardStats = async () => {
  const response = await api.get('/reviews/caregiver-dashboard');
  return response.data;
};
