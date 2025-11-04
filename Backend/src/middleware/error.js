function notFound(req, res, _next) {
  res.status(404).json({ message: `No encontrado: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
