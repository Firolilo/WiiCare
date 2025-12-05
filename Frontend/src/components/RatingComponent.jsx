import { useState, useEffect } from 'react';
import { createReview, getMyReview } from '../api/reviews';

/**
 * Componente para calificar a un cuidador
 * @param {Object} props
 * @param {string} props.caregiverId - ID del cuidador a calificar
 * @param {string} props.caregiverName - Nombre del cuidador
 * @param {Function} props.onReviewSubmitted - Callback cuando se envía la reseña
 * @param {boolean} props.showTitle - Mostrar título del componente
 */
export default function RatingComponent({ 
  caregiverId, 
  caregiverName = 'el cuidador',
  onReviewSubmitted,
  showTitle = true 
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingReview, setExistingReview] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  useEffect(() => {
    if (caregiverId) {
      loadExistingReview();
    }
  }, [caregiverId]);

  const loadExistingReview = async () => {
    setLoadingExisting(true);
    try {
      const response = await getMyReview(caregiverId);
      if (response.review) {
        setExistingReview(response.review);
        setRating(response.review.rating);
        setComment(response.review.comment || '');
      }
    } catch (err) {
      console.error('Error al cargar reseña existente:', err);
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor, selecciona una calificación');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await createReview({
        caregiverId,
        rating,
        comment: comment.trim()
      });

      setSuccess(existingReview ? 'Reseña actualizada correctamente' : 'Reseña enviada correctamente');
      setExistingReview(response.review);
      
      if (onReviewSubmitted) {
        onReviewSubmitted(response.review);
      }
    } catch (err) {
      console.error('Error al enviar reseña:', err);
      setError(err.response?.data?.message || 'Error al enviar la reseña');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          className="text-3xl transition-transform hover:scale-110 focus:outline-none"
          disabled={loading}
        >
          <i 
            className={`bi ${
              i <= (hoverRating || rating) 
                ? 'bi-star-fill text-yellow-400' 
                : 'bi-star text-gray-300'
            }`}
          ></i>
        </button>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    const texts = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
    return texts[hoverRating || rating] || '';
  };

  if (loadingExisting) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      {showTitle && (
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="bi bi-star-fill text-yellow-400"></i>
          {existingReview ? 'Tu calificación' : `Califica a ${caregiverName}`}
        </h3>
      )}

      <form onSubmit={handleSubmit}>
        {/* Estrellas */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex gap-1 mb-2">
            {renderStars()}
          </div>
          <span className={`text-sm font-medium ${
            (hoverRating || rating) >= 4 ? 'text-green-600' : 
            (hoverRating || rating) >= 3 ? 'text-yellow-600' : 
            (hoverRating || rating) >= 1 ? 'text-red-600' : 'text-gray-400'
          }`}>
            {getRatingText() || 'Selecciona una calificación'}
          </span>
        </div>

        {/* Comentario */}
        <div className="mb-4">
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
            Comentario (opcional)
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia con este cuidador..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={loading}
          />
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <i className="bi bi-exclamation-circle"></i>
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <i className="bi bi-check-circle"></i>
            {success}
          </div>
        )}

        {/* Botón enviar */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            rating === 0 || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            <>
              <i className="bi bi-send"></i>
              {existingReview ? 'Actualizar Reseña' : 'Enviar Reseña'}
            </>
          )}
        </button>

        {existingReview && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Última actualización: {new Date(existingReview.updatedAt).toLocaleDateString('es-ES')}
          </p>
        )}
      </form>
    </div>
  );
}
