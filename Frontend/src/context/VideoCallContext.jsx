import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { 
  startVideoCall as socketStartVideoCall,
  cancelVideoCall as socketCancelVideoCall
} from '../socket';

const VideoCallContext = createContext(null);

export function VideoCallProvider({ children }) {
  const [calling, setCalling] = useState(false);
  const [targetUserId, setTargetUserId] = useState(null);

  const startVideoCall = (userId, conversationId, callerName) => {
    console.log('📞 [Context] Iniciando llamada a:', userId);
    setCalling(true);
    setTargetUserId(userId);
    
    socketStartVideoCall(userId, conversationId, callerName);
    
    // Auto-cancelar si no responden en 30 segundos
    setTimeout(() => {
      if (calling) {
        console.log('⏱️ Tiempo de espera agotado');
        cancelVideoCall();
        alert('El usuario no respondió la llamada');
      }
    }, 30000);
  };

  const cancelVideoCall = () => {
    if (targetUserId) {
      console.log('🚫 [Context] Cancelando llamada');
      socketCancelVideoCall(targetUserId);
    }
    setCalling(false);
    setTargetUserId(null);
  };

  const resetCallState = () => {
    setCalling(false);
    setTargetUserId(null);
  };

  return (
    <VideoCallContext.Provider 
      value={{ 
        calling, 
        startVideoCall, 
        cancelVideoCall,
        resetCallState
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
}

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within VideoCallProvider');
  }
  return context;
};

VideoCallProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
