/**
 * Servidor Local para comunicación con Arduino
 * Este servidor corre en la máquina del usuario y se comunica con el Arduino por serial
 * Los datos se envían al backend en la nube y al frontend local vía WebSocket
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);

// Configuración
const LOCAL_PORT = 3001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://44.211.88.225';

// Socket.IO para comunicación en tiempo real con el frontend
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  }
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Estado del servicio serial
let serialPort = null;
let parser = null;
let isConnected = false;
let currentSession = null;
let authToken = null;
let lastReading = null;

// ============ API REST ============

/**
 * GET /ports - Lista puertos seriales disponibles
 */
app.get('/ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    const portList = ports.map(port => ({
      path: port.path,
      manufacturer: port.manufacturer || 'Desconocido',
      vendorId: port.vendorId,
      productId: port.productId,
      friendlyName: port.friendlyName || port.path
    }));
    res.json({ success: true, ports: portList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /connect - Conecta al Arduino
 */
app.post('/connect', async (req, res) => {
  try {
    const { portPath, baudRate = 9600 } = req.body;

    if (!portPath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requiere portPath (ej: COM3)' 
      });
    }

    if (isConnected) {
      await disconnect();
    }

    serialPort = new SerialPort({
      path: portPath,
      baudRate: parseInt(baudRate)
    });

    parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    // Manejar datos del Arduino
    parser.on('data', handleSerialData);

    // Manejar errores
    serialPort.on('error', (err) => {
      console.error('❌ Error serial:', err.message);
      isConnected = false;
      io.emit('serial-error', { error: err.message });
    });

    // Manejar cierre
    serialPort.on('close', () => {
      console.log('🔌 Puerto serial cerrado');
      isConnected = false;
      io.emit('serial-disconnected');
    });

    // Esperar a que abra
    await new Promise((resolve, reject) => {
      serialPort.on('open', () => {
        isConnected = true;
        console.log(`✅ Conectado a ${portPath} @ ${baudRate} baudios`);
        resolve();
      });
      serialPort.on('error', reject);
    });

    res.json({ 
      success: true, 
      port: portPath, 
      baudRate,
      message: `Conectado a ${portPath}` 
    });

  } catch (error) {
    console.error('Error conectando:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /disconnect - Desconecta del Arduino
 */
app.post('/disconnect', async (req, res) => {
  try {
    await disconnect();
    res.json({ success: true, message: 'Desconectado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /status - Estado de la conexión
 */
app.get('/status', (req, res) => {
  res.json({
    success: true,
    isConnected,
    port: serialPort?.path || null,
    hasSession: !!currentSession,
    sessionId: currentSession?.id || null,
    lastReading
  });
});

/**
 * POST /session/start - Inicia sesión de medición
 */
app.post('/session/start', (req, res) => {
  const { userId, token } = req.body;
  
  if (!userId) {
    return res.status(400).json({ success: false, error: 'Se requiere userId' });
  }

  authToken = token;
  currentSession = {
    id: `session_${Date.now()}`,
    userId,
    startedAt: new Date(),
    readings: []
  };

  console.log(`📋 Sesión iniciada: ${currentSession.id} para usuario ${userId}`);
  io.emit('session-started', currentSession);

  res.json({ success: true, session: currentSession });
});

/**
 * POST /session/stop - Finaliza sesión
 */
app.post('/session/stop', async (req, res) => {
  if (!currentSession) {
    return res.status(400).json({ success: false, error: 'No hay sesión activa' });
  }

  const session = { ...currentSession, endedAt: new Date() };
  
  // Intentar enviar datos al backend en la nube
  if (authToken && session.readings.length > 0) {
    try {
      await sendReadingsToBackend(session);
      console.log(`☁️ ${session.readings.length} lecturas enviadas al backend`);
    } catch (error) {
      console.error('Error enviando al backend:', error.message);
    }
  }

  currentSession = null;
  io.emit('session-stopped', session);

  res.json({ success: true, session });
});

/**
 * POST /auth - Guarda el token de autenticación
 */
app.post('/auth', (req, res) => {
  const { token } = req.body;
  authToken = token;
  res.json({ success: true });
});

/**
 * GET /readings - Obtiene lecturas de la sesión actual
 */
app.get('/readings', (req, res) => {
  if (!currentSession) {
    return res.json({ success: true, readings: [] });
  }
  res.json({ success: true, readings: currentSession.readings });
});

// ============ Funciones auxiliares ============

/**
 * Procesa datos del Arduino
 * Formato esperado: "ADC: XXX  |  Fuerza (N): YYY"
 */
function handleSerialData(data) {
  try {
    const line = data.trim();
    console.log('📡 Arduino:', line);

    // Parsear: "ADC: 512.00  |  Fuerza (N): 0.45"
    const adcMatch = line.match(/ADC:\s*([\d.]+)/);
    const forceMatch = line.match(/Fuerza \(N\):\s*([\d.]+)/);

    if (adcMatch && forceMatch) {
      const reading = {
        adcValue: parseFloat(adcMatch[1]),
        forceNewtons: parseFloat(forceMatch[1]),
        timestamp: new Date().toISOString()
      };

      lastReading = reading;

      // Emitir al frontend en tiempo real
      io.emit('force-reading', reading);

      // Guardar en sesión si está activa
      if (currentSession) {
        currentSession.readings.push(reading);
        
        // Cada 10 lecturas, intentar sincronizar con backend
        if (currentSession.readings.length % 10 === 0) {
          syncWithBackend();
        }
      }

      console.log(`💪 Fuerza: ${reading.forceNewtons.toFixed(2)} N (ADC: ${reading.adcValue.toFixed(0)})`);
    }
  } catch (error) {
    console.error('Error parseando datos:', error);
  }
}

/**
 * Desconecta del puerto serial
 */
function disconnect() {
  return new Promise((resolve) => {
    if (serialPort && serialPort.isOpen) {
      serialPort.close((err) => {
        if (err) console.error('Error cerrando puerto:', err);
        serialPort = null;
        parser = null;
        isConnected = false;
        resolve();
      });
    } else {
      isConnected = false;
      resolve();
    }
  });
}

/**
 * Envía lecturas al backend en la nube
 */
async function sendReadingsToBackend(session) {
  if (!authToken) return;

  const response = await fetch(`${BACKEND_URL}/api/force/readings/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      sessionId: session.id,
      userId: session.userId,
      readings: session.readings
    })
  });

  if (!response.ok) {
    throw new Error(`Backend respondió ${response.status}`);
  }

  return response.json();
}

/**
 * Sincroniza lecturas pendientes con el backend
 */
async function syncWithBackend() {
  if (!currentSession || !authToken) return;

  try {
    // Enviar última lectura al backend
    const lastReading = currentSession.readings[currentSession.readings.length - 1];
    
    await fetch(`${BACKEND_URL}/api/force/readings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        ...lastReading,
        sessionId: currentSession.id,
        userId: currentSession.userId
      })
    });
  } catch (error) {
    // Silenciar errores de sincronización, se reintentará
  }
}

// ============ Socket.IO ============

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  // Enviar estado actual
  socket.emit('status', {
    isConnected,
    port: serialPort?.path || null,
    hasSession: !!currentSession,
    lastReading
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// ============ Iniciar servidor ============

server.listen(LOCAL_PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🏥 WiiCare - Servidor Local Arduino                    ║
║                                                          ║
║   API Local:    http://localhost:${LOCAL_PORT}               ║
║   WebSocket:    ws://localhost:${LOCAL_PORT}                 ║
║   Backend:      ${BACKEND_URL.padEnd(30)}     ║
║                                                          ║
║   Endpoints:                                             ║
║   • GET  /ports          - Lista puertos seriales        ║
║   • POST /connect        - Conectar Arduino              ║
║   • POST /disconnect     - Desconectar                   ║
║   • GET  /status         - Estado de conexión            ║
║   • POST /session/start  - Iniciar sesión                ║
║   • POST /session/stop   - Finalizar sesión              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n👋 Cerrando servidor...');
  await disconnect();
  process.exit(0);
});
