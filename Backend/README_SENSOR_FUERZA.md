# Sensor de Fuerza FSR - Integración Arduino con WiiCare

## Descripción

Esta documentación describe la integración del sensor de fuerza FSR-406 con el sistema WiiCare a través de comunicación serial. Permite a los usuarios medir y registrar su fuerza de agarre, compartiendo esta información con sus cuidadores para un seguimiento continuo.

## Arquitectura

```
┌─────────────┐     Serial     ┌─────────────┐     Socket.IO     ┌─────────────┐
│   Arduino   │ ─────────────► │   Backend   │ ◄───────────────► │  Frontend   │
│   + FSR     │    (COM/USB)   │   Node.js   │     (WebSocket)   │    React    │
└─────────────┘                └─────────────┘                   └─────────────┘
                                     │
                                     ▼
                               ┌─────────────┐
                               │   MongoDB   │
                               │  (Lecturas) │
                               └─────────────┘
```

## Configuración del Hardware

### Componentes
- Arduino (cualquier modelo con puerto USB)
- Sensor FSR-406 (o compatible)
- Resistencia de 10kΩ (divisor de voltaje)

### Circuito
```
      VCC (5V)
         │
         │
      ┌──┴──┐
      │ FSR │
      └──┬──┘
         │
         ├───────► A0 (Arduino)
         │
      ┌──┴──┐
      │ 10k │
      └──┬──┘
         │
        GND
```

### Código Arduino

El código Arduino (`Proyecto.ino`) ya está configurado para:
1. Leer el valor ADC del sensor FSR
2. Aplicar un promedio de 20 muestras para filtrar ruido
3. Calcular la fuerza en Newtons usando la fórmula: `F(N) = A × ADC^B`
4. Enviar datos por serial a 9600 baudios

```cpp
// Constantes de calibración
float A = 1.6052172e-07;   // Ganancia
float B = 2.8956533;       // Exponente
```

## API REST

### Endpoints de Puerto Serial

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/force/ports` | Lista puertos seriales disponibles |
| POST | `/api/force/connect` | Conecta al Arduino |
| POST | `/api/force/disconnect` | Desconecta del Arduino |
| GET | `/api/force/status` | Estado de la conexión |

### Endpoints de Sesión

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/force/session/start` | Inicia sesión de medición |
| POST | `/api/force/session/stop` | Finaliza sesión de medición |
| GET | `/api/force/sessions` | Lista sesiones del usuario |
| GET | `/api/force/sessions/:userId` | Lista sesiones de otro usuario |

### Endpoints de Lecturas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/force/readings` | Obtiene lecturas del usuario |
| GET | `/api/force/readings/:userId` | Obtiene lecturas de otro usuario |
| POST | `/api/force/readings` | Guarda lectura manual |
| PATCH | `/api/force/readings/:id/notes` | Agrega notas a lectura |

### Endpoints de Estadísticas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/force/stats` | Estadísticas del usuario |
| GET | `/api/force/stats/:userId` | Estadísticas de otro usuario |

## Eventos Socket.IO

### Eventos emitidos por el servidor

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `force-reading` | `{ adcValue, forceNewtons, timestamp }` | Nueva lectura en tiempo real |
| `force-reading-saved` | `{ id, adcValue, forceNewtons, timestamp }` | Lectura guardada en BD |
| `serial-error` | `{ error }` | Error en comunicación serial |
| `serial-disconnected` | - | Puerto serial desconectado |

## Uso desde el Frontend

### 1. Conectar al Arduino

```javascript
// Listar puertos disponibles
const response = await fetch('/api/force/ports', {
  headers: { Authorization: `Bearer ${token}` }
});
const { ports } = await response.json();

// Conectar al puerto
await fetch('/api/force/connect', {
  method: 'POST',
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ portPath: 'COM3', baudRate: 9600 })
});
```

### 2. Iniciar sesión de medición

```javascript
await fetch('/api/force/session/start', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});
```

### 3. Escuchar datos en tiempo real

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token }
});

socket.on('force-reading', (data) => {
  console.log(`Fuerza: ${data.forceNewtons} N`);
  // Actualizar UI con la lectura
});
```

### 4. Obtener historial

```javascript
// Lecturas del usuario actual
const readings = await fetch('/api/force/readings?limit=50', {
  headers: { Authorization: `Bearer ${token}` }
});

// Estadísticas
const stats = await fetch('/api/force/stats', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Flujo para Cuidadores

Los cuidadores pueden acceder a los datos de fuerza de sus pacientes usando los endpoints con `:userId`:

```javascript
// Ver lecturas de un paciente
const readings = await fetch(`/api/force/readings/${patientUserId}`, {
  headers: { Authorization: `Bearer ${caregiverToken}` }
});

// Ver estadísticas del paciente
const stats = await fetch(`/api/force/stats/${patientUserId}`, {
  headers: { Authorization: `Bearer ${caregiverToken}` }
});

// Ver sesiones del paciente
const sessions = await fetch(`/api/force/sessions/${patientUserId}`, {
  headers: { Authorization: `Bearer ${caregiverToken}` }
});
```

## Modelo de Datos

### ForceReading

```javascript
{
  userId: ObjectId,           // Usuario dueño de la lectura
  adcValue: Number,           // Valor ADC (0-1023)
  forceNewtons: Number,       // Fuerza en Newtons
  readingTimestamp: Date,     // Momento de la lectura
  notes: String,              // Notas opcionales
  sessionId: String,          // ID de sesión (agrupa lecturas)
  createdAt: Date,
  updatedAt: Date
}
```

## Solución de Problemas

### El puerto no aparece en la lista
1. Verificar que el Arduino está conectado
2. Instalar drivers del Arduino si es necesario
3. En Windows, verificar en Administrador de Dispositivos

### No se reciben datos
1. Verificar velocidad de baudios (9600 por defecto)
2. Abrir Monitor Serial de Arduino IDE para verificar que envía datos
3. Cerrar Monitor Serial antes de conectar desde WiiCare

### Lecturas erráticas
1. Verificar conexiones del sensor FSR
2. Ajustar constantes de calibración A y B
3. Aumentar `numSamples` en el código Arduino

## Calibración del Sensor

Para calibrar el sensor FSR, use objetos de peso conocido:

1. Aplicar diferentes pesos conocidos
2. Registrar valor ADC y peso
3. Usar regresión de potencia para obtener A y B
4. Actualizar constantes en `Proyecto.ino`

Fórmula: `Fuerza(N) = A × ADC^B`
