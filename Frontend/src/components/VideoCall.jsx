import { useState } from 'react';
import PropTypes from 'prop-types';
import { JitsiMeeting } from '@jitsi/react-sdk';

export default function VideoCall({ 
  conversationId, 
  userName, 
  otherUserName,
  onClose 
}) {
  const [apiReady, setApiReady] = useState(false);
  const roomName = `wiicare-${conversationId}`;

  const handleApiReady = (externalApi) => {
    console.log('🎥 Jitsi API lista');
    setApiReady(true);

    // Listener para cuando el usuario cuelga
    externalApi.addEventListener('readyToClose', () => {
      console.log('📞 Llamada terminada');
      onClose?.();
    });

    // Listener para cuando el participante se une
    externalApi.addEventListener('participantJoined', (participant) => {
      console.log('👤 Participante se unió:', participant);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header con info y botón cerrar */}
      <div className="bg-[#2B4C7E] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="bi bi-camera-video-fill"></i>
            Videollamada con {otherUserName}
          </h2>
          <p className="text-sm text-blue-200">Sala: {roomName}</p>
        </div>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <i className="bi bi-x-lg"></i>
          Salir
        </button>
      </div>

      {/* Contenedor de Jitsi */}
      <div className="flex-1 relative">
        {!apiReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
              <p className="text-lg">Conectando a la videollamada...</p>
              <p className="text-sm text-gray-400 mt-2">Preparando cámara y micrófono</p>
            </div>
          </div>
        )}

        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            startScreenSharing: false,
            enableEmailInStats: false,
            prejoinPageEnabled: false, // Saltar página de pre-unión
            disableInviteFunctions: true, // Ocultar invitar
            enableWelcomePage: false,
            enableClosePage: false,
            hideConferenceSubject: true,
            subject: `Videollamada WiiCare`,
            defaultLanguage: 'es',
          }}
          interfaceConfigOverwrite={{
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'settings',
              'videoquality',
              'filmstrip',
              'tileview',
              'shortcuts',
              'help',
            ],
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            DISABLE_PRESENCE_STATUS: true,
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          }}
          userInfo={{
            displayName: userName,
          }}
          onApiReady={handleApiReady}
          getIFrameRef={(iframeRef) => {
            if (iframeRef) {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }
          }}
        />
      </div>
    </div>
  );
}

VideoCall.propTypes = {
  conversationId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  otherUserName: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};
