# 📹 Configuración de Videollamadas con Agora

Esta guía te ayudará a configurar las videollamadas en WiiCare usando Agora.io

## 🚀 Configuración Inicial

### 1. Crear Cuenta en Agora

1. Ve a [https://www.agora.io/](https://www.agora.io/)
2. Regístrate o inicia sesión
3. Ve a la consola: [https://console.agora.io/](https://console.agora.io/)

### 2. Crear un Proyecto

1. En la consola de Agora, haz clic en **"Crear proyecto"**
2. Nombre del proyecto: `WiiCare`
3. Modo de autenticación: 
   - **Desarrollo**: Sin certificado (para testing)
   - **Producción**: Con token (recomendado)
4. Copia tu **App ID**

### 3. Configurar App ID en Flutter

Abre `lib/services/video_call_service.dart` y reemplaza:

```dart
static const String appId = 'YOUR_AGORA_APP_ID';
```

Por tu App ID real:

```dart
static const String appId = 'a1b2c3d4e5f6g7h8i9j0';
```

**O usa variables de entorno:**

```bash
flutter run --dart-define=AGORA_APP_ID=tu_app_id_aqui
```

---

## 🔧 Configuración de Tokens (Producción)

Para producción, necesitas implementar generación de tokens en el backend.

### Backend - Generar Tokens

Instala el SDK de Agora para Node.js:

```bash
npm install agora-access-token
```

Crea `Backend/src/utils/agoraToken.js`:

```javascript
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

exports.generateAgoraToken = (channelName, uid, role = RtcRole.PUBLISHER) => {
  const expirationTimeInSeconds = 3600; // 1 hora
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  return RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
};
```

Crea endpoint en `Backend/src/routes/video.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { generateAgoraToken } = require('../utils/agoraToken');
const { authenticate } = require('../middleware/auth');

router.post('/generate-token', authenticate, (req, res) => {
  const { channelName, uid } = req.body;
  
  if (!channelName || !uid) {
    return res.status(400).json({ message: 'channelName y uid requeridos' });
  }

  const token = generateAgoraToken(channelName, uid);
  
  res.json({ 
    token, 
    appId: process.env.AGORA_APP_ID,
    channelName,
    uid 
  });
});

module.exports = router;
```

Agrega a `.env`:

```
AGORA_APP_ID=tu_app_id
AGORA_APP_CERTIFICATE=tu_certificado
```

### Flutter - Obtener Token del Backend

Modifica `lib/services/video_call_service.dart`:

```dart
Future<String> _getTokenFromBackend(String channelName, int uid) async {
  final response = await ApiService().post('/video/generate-token', {
    'channelName': channelName,
    'uid': uid,
  });
  
  return response['token'] as String;
}
```

---

## 📱 Uso en la App

### Iniciar Videollamada

```dart
// Desde cualquier parte de la app:
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => VideoCallScreen(
      channelName: 'canal_unico_123',
      token: '', // Vacío para desarrollo, token del backend en producción
      userId: 12345,
      userName: 'María García',
    ),
  ),
);
```

### Desde el Chat

Ya está implementado en `chat_screen.dart`:
1. Toca una conversación
2. Aparece el menú inferior
3. Selecciona "Iniciar videollamada"

---

## 🎯 Características Implementadas

✅ **Video bidireccional** - Ver y ser visto
✅ **Audio** - Comunicación de voz
✅ **Controles**:
  - 🎤 Mute/Unmute micrófono
  - 📹 Encender/Apagar cámara
  - 🔄 Cambiar entre cámara frontal y trasera
  - ☎️ Terminar llamada
✅ **UI intuitiva** - Controles flotantes sobre el video
✅ **Indicador de estado** - "Esperando a..."
✅ **Picture-in-Picture** - Video local en esquina

---

## 🔒 Permisos

Los permisos necesarios ya están agregados en `AndroidManifest.xml`:

- ✅ INTERNET
- ✅ CAMERA
- ✅ RECORD_AUDIO
- ✅ MODIFY_AUDIO_SETTINGS
- ✅ ACCESS_NETWORK_STATE
- ✅ BLUETOOTH
- ✅ ACCESS_WIFI_STATE

**La app solicitará permisos automáticamente** al iniciar la primera videollamada.

---

## 🧪 Testing

### Testing Local (2 dispositivos)

1. **Dispositivo 1**: Ejecuta la app
2. **Dispositivo 2**: Ejecuta la app (o usa emulador)
3. Ambos deben:
   - Iniciar sesión
   - Ir a Chats
   - Seleccionar la misma conversación
   - Iniciar videollamada

**Importante**: Ambos deben usar el **mismo channelName** para conectarse.

### Testing con Web

Agora también tiene SDK web. Puedes crear una página simple para testing:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://download.agora.io/sdk/release/AgoraRTC_N.js"></script>
</head>
<body>
  <div id="local-video"></div>
  <div id="remote-video"></div>
  <script>
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    // ... configurar cliente
  </script>
</body>
</html>
```

---

## 📊 Límites Gratuitos de Agora

- **10,000 minutos/mes** gratis
- Después: $0.99 - $3.99 por 1,000 minutos
- Suficiente para desarrollo y testing

---

## 🐛 Troubleshooting

### Error: "Camera permission denied"

```dart
// Verificar permisos manualmente:
import 'package:permission_handler/permission_handler.dart';

final status = await Permission.camera.request();
if (status.isDenied) {
  // Mostrar diálogo explicativo
}
```

### Error: "Invalid App ID"

- Verifica que el App ID esté correcto
- No debe tener espacios ni comillas
- Debe ser exactamente el de la consola de Agora

### Video no se muestra

- Verifica que ambos usuarios estén en el **mismo canal**
- Revisa los logs: `flutter run -v`
- Asegúrate de que la cámara no esté en uso por otra app

### Audio con eco

```dart
// Habilitar cancelación de eco:
await engine.enableAudioVolumeIndication(200, 3, true);
await engine.setParameters('{"che.audio.enable.agc": true}');
```

---

## 🚀 Próximas Mejoras

- [ ] Grabar videollamadas
- [ ] Compartir pantalla
- [ ] Chat durante videollamada
- [ ] Efectos de belleza/filtros
- [ ] Llamadas grupales (más de 2 personas)
- [ ] Notificaciones de llamada entrante
- [ ] Historial de llamadas

---

## 📚 Recursos

- [Agora Flutter SDK Docs](https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=flutter)
- [API Reference](https://api-ref.agora.io/en/flutter/6.x/index.html)
- [Ejemplos de Código](https://github.com/AgoraIO-Extensions/Agora-Flutter-SDK)
- [Console de Agora](https://console.agora.io/)

---

## 💡 Tips

1. **Usa nombres de canal únicos** basados en IDs de conversación
2. **Implementa tokens en producción** para seguridad
3. **Maneja desconexiones de red** con listeners de eventos
4. **Optimiza calidad** según ancho de banda disponible
5. **Prueba en diferentes dispositivos** (gama baja/alta)

¿Necesitas ayuda? Revisa la documentación oficial de Agora o contacta soporte.
