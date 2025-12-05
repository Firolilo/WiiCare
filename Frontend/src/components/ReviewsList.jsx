import { useState, useEffect } from 'react';
import { getCaregiverReviews } from '../api/reviews';

/**
 * Componente para mostrar las reseñas de un cuidador
 * @param {Object} props
 * @param {string} props.caregiverId - ID del cuidador
 * @param {number} props.limit - Número de reseñas a mostrar por página
 */
export default function ReviewsList({ caregiverId, limit = 5 }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (caregiverId) {
      loadReviews(1);
    }
  }, [caregiverId]);

  const loadReviews = async (page) => {
    setLoading(true);
    setError('');
    try {
      const response = await getCaregiverReviews(caregiverId, { page, limit });
      setReviews(response.reviews || []);
      setStats(response.stats || null);
      setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Error al cargar reseñas:', err);
      setError('Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <i
            key={i}
            className={`bi ${i <= rating ? 'bi-star-fill text-yellow-400' : 'bi-star text-gray-300'}`}
          ></i>
        ))}
      </div>
    );
  };

  const renderRatingBar = (stars, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-3 text-gray-600">{stars}</span>
        <i className="bi bi-star-fill text-yellow-400 text-xs"></i>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-400 rounded-full h-2 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="w-8 text-right text-gray-500">{count}</span>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A6EA5]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center text-red-500 py-4">
          <i className="bi bi-exclamation-triangle text-2xl mb-2"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header con estadísticas */}
      {stats && (
        <div className="bg-gradient-to-r from-[#f5f0e8] to-[#faf8f5] p-6 border-b border-[#e6e0d2]">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Calificación promedio */}
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-[#2B4C7E]">
                {stats.averageRating?.toFixed(1) || 'N/A'}
              </div>
              <div className="flex justify-center md:justify-start mt-1">
                {renderStars(Math.round(stats.averageRating || 0))}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {stats.totalReviews} {stats.totalReviews === 1 ? 'reseña' : 'reseñas'}
              </div>
            </div>

            {/* Distribución de estrellas */}
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars}>
                  {renderRatingBar(stars, stats.ratingDistribution?.[stars] || 0, stats.totalReviews)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="p-6">
        <h3 className="font-bold text-[#2B4C7E] mb-4 flex items-center gap-2">
          <i className="bi bi-chat-quote text-[#3A6EA5]"></i>
          Opiniones de pacientes
        </h3>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="bi bi-chat-left-text text-4xl mb-2 block opacity-50"></i>
            <p>Aún no hay reseñas para este cuidador</p>
            <p className="text-sm mt-1">Sé el primero en dejar una opinión</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-[#e6e0d2] last:border-0 pb-4 last:pb-0">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B8BBE] to-[#2B4C7E] flex items-center justify-center text-white font-bold text-sm">
                    {review.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  
                  <div className="flex-1">
                    {/* Nombre y fecha */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">
                        {review.author?.name || 'Paciente'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {/* Estrellas */}
                    <div className="mb-2">
                      {renderStars(review.rating)}
                    </div>
                    
                    {/* Comentario */}
                    {review.comment && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-[#e6e0d2]">
            <button
              onClick={() => loadReviews(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className={`px-3 py-1 rounded-lg ${
                pagination.page === 1 || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#f5f0e8] text-[#3A6EA5] hover:bg-[#e6e0d2]'
              }`}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            <span className="text-sm text-[#2B4C7E]">
              Página {pagination.page} de {pagination.pages}
            </span>
            
            <button
              onClick={() => loadReviews(pagination.page + 1)}
              disabled={pagination.page === pagination.pages || loading}
              className={`px-3 py-1 rounded-lg ${
                pagination.page === pagination.pages || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#f5f0e8] text-[#3A6EA5] hover:bg-[#e6e0d2]'
              }`}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
