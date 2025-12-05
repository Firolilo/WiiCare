import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import RatingComponent from '../components/RatingComponent';
import ReviewsList from '../components/ReviewsList';

export default function Caregivers() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        const res = await api.get('/users/caregivers');
        setCaregivers(res.data.caregivers || []);
      } catch (err) {
        console.error('Error al cargar cuidadores:', err);
        setCaregivers([]); // fallback seguro
      } finally {
        setLoading(false);
      }
    };

    fetchCaregivers();
  }, []);

  const openReviewModal = (caregiver) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedCaregiver(caregiver);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setSelectedCaregiver(null);
    setShowReviewModal(false);
  };

  const handleReviewSubmitted = () => {
    // Refrescar la lista de cuidadores para actualizar ratings
    setTimeout(() => {
      closeReviewModal();
    }, 1500);
  };

  if (loading)
    return (
      <section className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <p className="text-[#2B4C7E] font-medium animate-pulse">Cargando cuidadores...</p>
      </section>
    );

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-white to-[#f5f0e8] flex flex-col items-center justify-start px-6 py-10">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-[#2B4C7E] mb-6 text-center">
          Cuidadores registrados
        </h1>

        {caregivers.length === 0 ? (
          <p className="text-gray-600 text-lg text-center">No hay cuidadores disponibles.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {caregivers.map((c) => (
              <li
                key={c._id}
                className="bg-white rounded-2xl shadow-sm border border-[#e6e0d2] p-5 hover:shadow-md transition"
              >
                <div className="text-center mb-3">
                  <h3 className="font-semibold text-lg text-[#2B4C7E] mb-1">
                    {c.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {c.location || 'Ubicación no especificada'}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mt-1">
                    <i className="bi bi-star-fill text-yellow-400"></i>
                    <span>{c.rating?.toFixed(1) || 'Sin calificación'}</span>
                  </div>
                </div>
                
                {/* Botón para calificar */}
                {user && user.role !== 'caregiver' && user._id !== c._id && (
                  <button
                    onClick={() => openReviewModal(c)}
                    className="w-full mt-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="bi bi-star"></i>
                    Calificar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de reseña */}
      {showReviewModal && selectedCaregiver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Calificar a {selectedCaregiver.name}
              </h2>
              <button
                onClick={closeReviewModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-4">
              <RatingComponent
                caregiverId={selectedCaregiver._id}
                caregiverName={selectedCaregiver.name}
                onReviewSubmitted={handleReviewSubmitted}
                showTitle={false}
              />
              
              <div className="border-t pt-4">
                <ReviewsList 
                  caregiverId={selectedCaregiver._id} 
                  limit={3}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
