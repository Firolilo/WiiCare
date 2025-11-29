import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVideoCall } from '../context/VideoCallContext';
import IncomingCallModal from './IncomingCallModal';
import VideoCall from './VideoCall';
import {
  onIncomingVideoCall,
  onCallAccepted,
  onCallRejected,
  onCallCancelled,
  onCallFailed,
  acceptVideoCall,
  rejectVideoCall,
  offIncomingVideoCall,
  offCallAccepted,
  offCallRejected,
  offCallCancelled,
  offCallFailed
} from '../socket';

export default function GlobalVideoCallManager() {
  const { user } = useAuth();
  const { resetCallState } = useVideoCall();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null); // { conversationId, otherUserName }

  useEffect(() => {
    if (!user) return;

    console.log('🎬 Iniciando GlobalVideoCallManager');

    // Llamada entrante
    onIncomingVideoCall(({ callerId, callerName, conversationId }) => {
      console.log('📞 [GLOBAL] Llamada entrante de:', callerName);
      setIncomingCall({ callerId, callerName, conversationId });
    });

    // Llamada aceptada por el otro usuario
    onCallAccepted(({ conversationId }) => {
      console.log('✅ [GLOBAL] Llamada aceptada, abriendo videollamada');
      
      // Resetear estado de "llamando"
      resetCallState();
      
      // Encontrar el nombre del otro usuario (podríamos necesitar hacer una llamada a la API)
      setActiveCall({ 
        conversationId, 
        otherUserName: 'Usuario' // Se actualizará cuando abramos el chat
      });
    });

    // Llamada rechazada
    onCallRejected(({ reason }) => {
      console.log('❌ [GLOBAL] Llamada rechazada:', reason);
      resetCallState();
      alert(`Llamada rechazada: ${reason}`);
    });

    // Llamada cancelada
    onCallCancelled(() => {
      console.log('🚫 [GLOBAL] Llamada cancelada por el otro usuario');
      setIncomingCall(null);
    });

    // Llamada fallida
    onCallFailed(({ reason }) => {
      console.log('⚠️ [GLOBAL] Llamada fallida:', reason);
      resetCallState();
      alert(`No se pudo iniciar la llamada: ${reason}`);
    });

    // Cleanup
    return () => {
      console.log('🧹 Limpiando GlobalVideoCallManager');
      offIncomingVideoCall();
      offCallAccepted();
      offCallRejected();
      offCallCancelled();
      offCallFailed();
    };
  }, [user]);

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    
    console.log('✅ Aceptando llamada');
    acceptVideoCall(incomingCall.callerId, incomingCall.conversationId);
    
    // Abrir videollamada
    setActiveCall({
      conversationId: incomingCall.conversationId,
      otherUserName: incomingCall.callerName
    });
    
    setIncomingCall(null);
    
    // Navegar al chat si no estamos ahí
    const chatPath = `/chat/${incomingCall.conversationId}`;
    if (location.pathname !== chatPath) {
      navigate(chatPath);
    }
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    
    console.log('❌ Rechazando llamada');
    rejectVideoCall(incomingCall.callerId, 'Usuario ocupado');
    setIncomingCall(null);
  };

  const handleCloseVideoCall = () => {
    console.log('📴 Cerrando videollamada');
    setActiveCall(null);
  };

  return (
    <>
      {/* Modal de Llamada Entrante - Aparece en TODA la app */}
      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Modal de Videollamada Activa */}
      {activeCall && user && (
        <VideoCall
          conversationId={activeCall.conversationId}
          userName={user.name}
          otherUserName={activeCall.otherUserName}
          onClose={handleCloseVideoCall}
        />
      )}
    </>
  );
}
