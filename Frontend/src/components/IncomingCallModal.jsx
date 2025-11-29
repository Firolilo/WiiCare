import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function IncomingCallModal({ 
  callerName, 
  onAccept, 
  onReject 
}) {
  const [ringing, setRinging] = useState(true);

  useEffect(() => {
    // Sonido de llamada (puedes agregar un audio real después)
    const interval = setInterval(() => {
      setRinging(prev => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header con animación */}
        <div className="bg-gradient-to-r from-[#3A6EA5] to-[#2B4C7E] p-6 text-center">
          <div className="relative inline-block">
            <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#3A6EA5] text-4xl font-bold mb-4 transition-transform ${ringing ? 'scale-110' : 'scale-100'}`}>
              {callerName.charAt(0).toUpperCase()}
            </div>
            {/* Anillos de llamada */}
            <div className={`absolute inset-0 rounded-full border-4 border-white opacity-50 ${ringing ? 'animate-ping' : ''}`}></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {callerName}
          </h2>
          <p className="text-blue-100 flex items-center justify-center gap-2">
            <i className="bi bi-camera-video-fill"></i>
            Videollamada entrante...
          </p>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6">
            ¿Deseas contestar la videollamada?
          </p>

          {/* Botones */}
          <div className="flex gap-4 justify-center">
            {/* Rechazar */}
            <button
              onClick={onReject}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <i className="bi bi-telephone-x-fill text-2xl"></i>
              <span>Rechazar</span>
            </button>

            {/* Aceptar */}
            <button
              onClick={onAccept}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 animate-pulse"
            >
              <i className="bi bi-camera-video-fill text-2xl"></i>
              <span>Aceptar</span>
            </button>
          </div>
        </div>

        {/* Footer con tips */}
        <div className="bg-gray-50 px-6 py-3 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <i className="bi bi-info-circle"></i>
            Asegúrate de tener cámara y micrófono disponibles
          </p>
        </div>
      </div>
    </div>
  );
}

IncomingCallModal.propTypes = {
  callerName: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};
