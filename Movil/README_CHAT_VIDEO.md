# WiiCare Mobile - Guía de Integración Chat y Videollamadas

## ✅ Cambios Implementados

### 1. **Dependencias Actualizadas** (`pubspec.yaml`)
- ✅ **Socket.IO Client** (`socket_io_client: ^2.0.3+1`) - WebSocket en tiempo real
- ✅ **Jitsi Meet Flutter SDK** (`jitsi_meet_flutter_sdk: ^10.2.0`) - Videollamadas gratuitas
- ❌ **Removido Agora RTC Engine** - Reemplazado por Jitsi Meet

### 2. **Nuevos Servicios**

#### `lib/services/chat_service.dart`
Servicio singleton para gestionar WebSocket con Socket.IO:
- ✅ Conexión autenticada con JWT
- ✅ Eventos de conversación (`join-conversation`, `new-message`, `conversation-updated`)
- ✅ Eventos de presencia online/offline
- ✅ Eventos de videollamadas (`start-video-call`, `accept-video-call`, etc.)

### 3. **Modelos Actualizados**

#### `lib/models/user.dart`
```dart
- Agregado: @JsonKey(name: '_id') para mapear _id del backend
- Agregado: phone, createdAt
- Agregado: método initials para avatar
```

#### `lib/models/message.dart`
```dart
- Cambiado: sender es ahora objeto User completo (no solo ID)
- Cambiado: conversation → conversationId
- Agregado: @JsonKey(name: '_id')
- Agregado: método isRead
```

#### `lib/models/conversation.dart`
```dart
- Agregado: otherParticipant (objeto User)
- Agregado: unreadCount
- Agregado: @JsonKey(name: '_id')
```

### 4. **Nuevo Provider**

#### `lib/providers/chat_provider.dart`
Estado global para chat y videollamadas:
- ✅ Lista de conversaciones con datos reales del backend
- ✅ Mensajes por conversación (Map<conversationId, List<Message>>)
- ✅ Set de usuarios en línea
- ✅ Estado de llamadas entrantes
- ✅ Manejo de eventos WebSocket en tiempo real

### 5. **Pantallas Actualizadas**

#### `lib/screens/chat_screen.dart` (COMPLETAMENTE REESCRITO)
- ✅ Carga conversaciones reales desde backend
- ✅ Muestra indicador de usuarios en línea (punto verde)
- ✅ Badge de mensajes no leídos
- ✅ Formato de tiempo relativo (1m, 5h, 2d)
- ✅ Pull-to-refresh
- ✅ Navegación a ConversationScreen

#### `lib/screens/conversation_screen.dart` (NUEVO)
- ✅ Chat en tiempo real con mensajes del backend
- ✅ Burbujas de mensaje estilo WhatsApp
- ✅ Scroll automático al final
- ✅ Indicadores de lectura (✓ / ✓✓)
- ✅ Separadores de fecha
- ✅ Botón de videollamada en header
- ✅ Input de mensaje con envío

#### `lib/screens/video_call_screen.dart` (REESCRITO)
- ❌ Removido: Agora RTC Engine
- ✅ Agregado: Jitsi Meet SDK
- ✅ Nombre de sala: `wiicare-{conversationId}`
- ✅ Configuración sin prejoin
- ✅ Listeners de eventos (conferencia joined, terminated, etc.)
- ✅ Manejo automático de UI por Jitsi

### 6. **Nuevo Widget Global**

#### `lib/widgets/incoming_call_overlay.dart`
- ✅ Popup de pantalla completa para llamadas entrantes
- ✅ Aparece en CUALQUIER pantalla de la app
- ✅ Animación de pulso en avatar
- ✅ Botones de Aceptar (verde) y Rechazar (rojo)
- ✅ Navegación automática a VideoCallScreen al aceptar

### 7. **Main.dart Actualizado**
```dart
- Agregado: ChatProvider en MultiProvider
- Agregado: IncomingCallOverlay en builder global
- Efecto: Popup de llamadas aparece sobre toda la app
```

## 🔧 Configuración del Backend

### URL del Backend
Archivo: `lib/utils/constants.dart`
```dart
static const String apiBaseUrl = 'http://TU_IP:4000/api';
```

**Importante:**
- **Android Emulator**: Usar `http://10.0.2.2:4000/api`
- **iOS Simulator**: Usar `http://44.211.88.225/api`
- **Dispositivo Físico**: Usar `http://TU_IP_LOCAL:4000/api` (ejemplo: `http://192.168.1.100:4000/api`)

## 📱 Flujo de Uso

### 1. Iniciar Sesión
- La app carga el token JWT
- ChatProvider se inicializa con el token
- Se establece conexión WebSocket

### 2. Ver Conversaciones
- ChatScreen carga conversaciones desde backend
- Se muestran con indicadores de en línea y mensajes no leídos
- Tap en conversación → navega a ConversationScreen

### 3. Chat en Tiempo Real
- Los mensajes se envían vía API REST
- Se reciben vía WebSocket en tiempo real
- Auto-scroll al final cuando llegan nuevos mensajes

### 4. Iniciar Videollamada
- Tap en botón de videocámara
- Se emite evento `start-video-call` vía WebSocket
- El receptor ve popup de IncomingCallOverlay

### 5. Recibir Videollamada
- Popup aparece sobre cualquier pantalla
- Aceptar → ambos se unen a sala Jitsi con nombre `wiicare-{conversationId}`
- Rechazar → se envía evento `reject-video-call`

## 🐛 Solución de Problemas

### Error: "Cannot connect to backend"
```bash
# Verificar que el backend esté corriendo
cd Backend
npm run dev

# Verificar la IP en constants.dart
# Para emulador Android: 10.0.2.2
# Para dispositivo físico: IP local de tu PC
```

### Error: "Socket connection failed"
```bash
# El backend debe estar en la misma red que el dispositivo
# Verificar firewall de Windows permite conexiones en puerto 4000
```

### Error: "Jitsi Meet not working"
```bash
# Jitsi Meet requiere permisos de cámara y micrófono
# Android: Agregar a AndroidManifest.xml
# iOS: Agregar a Info.plist
```

### Mensajes no aparecen en tiempo real
```bash
# Verificar que ChatProvider.initialize() se llame después de login
# Ver logs de WebSocket en consola: "✅ Conectado al servidor de chat"
```

## 📋 Permisos Requeridos

### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### iOS (`ios/Runner/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a tu cámara para videollamadas</string>
<key>NSMicrophoneUsageDescription</key>
<string>Necesitamos acceso a tu micrófono para videollamadas</string>
```

## 🚀 Testing

### 1. Prueba de Chat
```bash
# Terminal 1
cd Backend
npm run dev

# Terminal 2
cd Movil
flutter run

# Iniciar sesión con 2 usuarios diferentes en 2 dispositivos
# Enviar mensajes → deben aparecer en tiempo real
```

### 2. Prueba de Presencia Online
```bash
# Login con usuario A
# Login con usuario B
# En ChatScreen de A → debe ver punto verde junto a B
# Cerrar sesión de B → punto verde desaparece
```

### 3. Prueba de Videollamadas
```bash
# Usuario A: Tap en botón de videocámara
# Usuario B: Ve popup de llamada entrante
# Usuario B: Tap en "Aceptar"
# Ambos: Se unen a sala Jitsi Meet con video
```

## 📊 Logs Importantes

```dart
// Conexión WebSocket
🔌 Conectando a WebSocket: http://10.0.2.2:4000
✅ Conectado al servidor de chat

// Presencia
📋 Lista de usuarios en línea: [userId1, userId2]
🟢 Usuario conectado: userId3

// Mensajes
💬 Nuevo mensaje recibido: {...}
🔄 Actualización de conversación: {...}

// Videollamadas
📞 Llamada entrante: {callerId: ..., callerName: ...}
✅ Usuario unido a la conferencia
```

## ✨ Funcionalidades Completas

- ✅ Lista de conversaciones en tiempo real
- ✅ Chat 1-a-1 con mensajes en tiempo real
- ✅ Indicadores de presencia online/offline
- ✅ Contador de mensajes no leídos
- ✅ Videollamadas con Jitsi Meet
- ✅ Notificaciones de llamadas entrantes globales
- ✅ Sincronización automática con WebSocket
- ✅ Arquitectura escalable con Provider

## 📝 Próximos Pasos (Opcional)

- [ ] Notificaciones push para llamadas cuando app está cerrada
- [ ] Historial de llamadas
- [ ] Compartir archivos/imágenes en chat
- [ ] Llamadas de voz (solo audio)
- [ ] Grupo de chat (múltiples participantes)
- [ ] Reacciones a mensajes
- [ ] Estados de "escribiendo..."

---

**Desarrollado para WiiCare** - Plataforma de conexión entre cuidadores y usuarios
