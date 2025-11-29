require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { loadEnv } = require('./config/env');
const { createDefaultAdmin } = require('./utils/createDefaultAdmin');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');
const { setupSocketIO } = require('./socket');

const app = express();
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true
  }
});

// Inicializar Socket.IO handlers
setupSocketIO(io);

// Hacer io accesible en toda la app
app.set('io', io);

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// API
app.use('/api', apiRoutes);

// 404 and Error
app.use(notFound);
app.use(errorHandler);

// Start server when not testing
if (process.env.NODE_ENV !== 'test') {
  const env = loadEnv();
  connectDB(env.MONGODB_URI)
    .then(async () => {
      // Crear admin por defecto si no existe
      await createDefaultAdmin();
      
      const port = env.PORT;
      server.listen(port, () => {
        console.log(`API listening on http://localhost:${port}`);
        console.log(`WebSocket server ready`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    });
}

module.exports = app;
