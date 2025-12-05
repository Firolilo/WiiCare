# WiiCare - Instrucciones del Proyecto

## Descripción General
WiiCare es una plataforma de cuidado de salud que conecta usuarios con cuidadores. El sistema incluye:
- **Backend**: Node.js + Express + MongoDB + Socket.IO
- **Frontend**: React + Vite + TailwindCSS
- **Móvil**: Flutter

## Módulo: Sensor de Fuerza FSR (Arduino)

### Funcionalidad
Integración de sensor de fuerza FSR-406 conectado vía Arduino para medir y monitorear la fuerza de agarre de los usuarios. Los cuidadores pueden ver estos datos en tiempo real.

### Arquitectura
```
Arduino + FSR → Serial USB → Backend Node.js → Socket.IO → Frontend/Móvil
```

### Endpoints API (`/api/force/`)
- `GET /ports` - Lista puertos seriales
- `POST /connect` - Conectar al Arduino
- `POST /disconnect` - Desconectar
- `GET /status` - Estado de conexión
- `POST /session/start` - Iniciar sesión de medición
- `POST /session/stop` - Finalizar sesión
- `GET /readings` - Obtener lecturas
- `GET /stats` - Obtener estadísticas

### Eventos Socket.IO
- `force-reading` - Lectura en tiempo real
- `force-reading-saved` - Lectura guardada

### Archivos Clave
- `Backend/src/services/serialService.js` - Servicio de comunicación serial
- `Backend/src/models/ForceReading.js` - Modelo de datos
- `Backend/src/routes/force.routes.js` - Rutas API
- `Backend/README_SENSOR_FUERZA.md` - Documentación completa

## Comandos Útiles

### Backend
```bash
cd Backend
npm install
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Móvil
```bash
cd Movil
flutter pub get
flutter run
```

## Variables de Entorno (Backend)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/wiicare
JWT_SECRET=tu_secreto_jwt
CLIENT_URL=http://localhost:5173
```

Before starting a new task in the above plan, update progress in the plan.
-->
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.
