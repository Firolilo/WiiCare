require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { connectDB } = require('./config/db');
const { loadEnv } = require('./config/env');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

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
    .then(() => {
      const port = env.PORT;
      app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    });
}

module.exports = app;
