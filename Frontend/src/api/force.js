import api from './client';

/**
 * Guarda una lectura del sensor de fuerza
 */
export const saveForceReading = async (adcValue, forceNewtons, notes = '') => {
  const response = await api.post('/force/readings', { adcValue, forceNewtons, notes });
  return response.data;
};

/**
 * Guarda múltiples lecturas en lote
 */
export const saveForceReadingsBatch = async (readings) => {
  const response = await api.post('/force/readings/batch', { readings });
  return response.data;
};

/**
 * Obtiene las lecturas del usuario autenticado
 */
export const getMyForceReadings = async (params = {}) => {
  const response = await api.get('/force/readings', { params });
  return response.data;
};

/**
 * Obtiene las lecturas de un paciente específico (para cuidadores)
 */
export const getPatientForceReadings = async (userId, params = {}) => {
  const response = await api.get(`/force/readings/${userId}`, { params });
  return response.data;
};

/**
 * Obtiene estadísticas del usuario autenticado
 */
export const getMyForceStats = async (params = {}) => {
  const response = await api.get('/force/stats', { params });
  return response.data;
};

/**
 * Obtiene estadísticas de un paciente específico (para cuidadores)
 */
export const getPatientForceStats = async (userId, params = {}) => {
  const response = await api.get(`/force/stats/${userId}`, { params });
  return response.data;
};

/**
 * Obtiene el análisis de tendencia y estado del paciente (para cuidadores)
 */
export const getPatientForceAnalysis = async (userId) => {
  const response = await api.get(`/force/analysis/${userId}`);
  return response.data;
};

/**
 * Obtiene las sesiones de medición del usuario
 */
export const getMySessions = async () => {
  const response = await api.get('/force/sessions');
  return response.data;
};

/**
 * Obtiene las sesiones de un paciente (para cuidadores)
 */
export const getPatientSessions = async (userId) => {
  const response = await api.get(`/force/sessions/${userId}`);
  return response.data;
};
