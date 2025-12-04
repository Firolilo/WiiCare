import apiClient from './client';

// ========== SERVICE REQUESTS ==========

export const createServiceRequest = async (data) => {
  const response = await apiClient.post('/service-requests', data);
  return response.data;
};

export const getCaregiverRequests = async (status) => {
  const response = await apiClient.get('/service-requests/caregiver', {
    params: { status }
  });
  return response.data;
};

export const getPatientRequests = async () => {
  const response = await apiClient.get('/service-requests/patient');
  return response.data;
};

export const acceptServiceRequest = async (id) => {
  const response = await apiClient.patch(`/service-requests/${id}/accept`);
  return response.data;
};

export const rejectServiceRequest = async (id, notes) => {
  const response = await apiClient.patch(`/service-requests/${id}/reject`, { notes });
  return response.data;
};

// ========== PATIENT MANAGEMENT ==========

// Patient Profiles
export const getCaregiverPatients = async (isActive) => {
  const response = await apiClient.get('/patient-management/profiles', {
    params: { isActive }
  });
  return response.data;
};

export const getPatientProfile = async (id) => {
  const response = await apiClient.get(`/patient-management/profiles/${id}`);
  return response.data;
};

export const updatePatientProfile = async (id, data) => {
  const response = await apiClient.patch(`/patient-management/profiles/${id}`, data);
  return response.data;
};

// Daily Care
export const createDailyCare = async (data) => {
  const response = await apiClient.post('/patient-management/daily-care', data);
  return response.data;
};

export const getDailyCare = async (params) => {
  const response = await apiClient.get('/patient-management/daily-care', { params });
  return response.data;
};

export const updateDailyCare = async (id, data) => {
  const response = await apiClient.patch(`/patient-management/daily-care/${id}`, data);
  return response.data;
};

export const completeDailyCare = async (id, notes) => {
  const response = await apiClient.patch(`/patient-management/daily-care/${id}/complete`, { notes });
  return response.data;
};

export const deleteDailyCare = async (id) => {
  const response = await apiClient.delete(`/patient-management/daily-care/${id}`);
  return response.data;
};

// Medications
export const createMedication = async (data) => {
  const response = await apiClient.post('/patient-management/medications', data);
  return response.data;
};

export const getMedications = async (params) => {
  const response = await apiClient.get('/patient-management/medications', { params });
  return response.data;
};

export const updateMedication = async (id, data) => {
  const response = await apiClient.patch(`/patient-management/medications/${id}`, data);
  return response.data;
};

export const deleteMedication = async (id) => {
  const response = await apiClient.delete(`/patient-management/medications/${id}`);
  return response.data;
};

// Recommendations
export const createRecommendation = async (data) => {
  const response = await apiClient.post('/patient-management/recommendations', data);
  return response.data;
};

export const getRecommendations = async (params) => {
  const response = await apiClient.get('/patient-management/recommendations', { params });
  return response.data;
};

export const updateRecommendation = async (id, data) => {
  const response = await apiClient.patch(`/patient-management/recommendations/${id}`, data);
  return response.data;
};

export const deleteRecommendation = async (id) => {
  const response = await apiClient.delete(`/patient-management/recommendations/${id}`);
  return response.data;
};

// Incidents
export const createIncident = async (data) => {
  const response = await apiClient.post('/patient-management/incidents', data);
  return response.data;
};

export const getIncidents = async (params) => {
  const response = await apiClient.get('/patient-management/incidents', { params });
  return response.data;
};

export const updateIncident = async (id, data) => {
  const response = await apiClient.patch(`/patient-management/incidents/${id}`, data);
  return response.data;
};

export const resolveIncident = async (id, resolutionNotes) => {
  const response = await apiClient.patch(`/patient-management/incidents/${id}/resolve`, { resolutionNotes });
  return response.data;
};

// Appointments
export const createAppointment = async (data) => {
  const response = await apiClient.post('/patient-management/appointments', data);
  return response.data;
};

export const getAppointments = async (params) => {
  const response = await apiClient.get('/patient-management/appointments', { params });
  return response.data;
};

export const updateAppointment = async (id, data) => {
  const response = await apiClient.patch(`/patient-management/appointments/${id}`, data);
  return response.data;
};

export const deleteAppointment = async (id) => {
  const response = await apiClient.delete(`/patient-management/appointments/${id}`);
  return response.data;
};

// Health Indicators
export const createHealthIndicator = async (data) => {
  const response = await apiClient.post('/patient-management/health-indicators', data);
  return response.data;
};

export const getHealthIndicators = async (params) => {
  const response = await apiClient.get('/patient-management/health-indicators', { params });
  return response.data;
};

export const updateHealthIndicator = async (id, data) => {
  const response = await apiClient.patch(`/patient-management/health-indicators/${id}`, data);
  return response.data;
};

// Care Plans
export const createCarePlan = async (data) => {
  const response = await apiClient.post('/patient-management/care-plans', data);
  return response.data;
};

export const getCarePlans = async (params) => {
  const response = await apiClient.get('/patient-management/care-plans', { params });
  return response.data;
};

export const updateCarePlan = async (id, data) => {
  const response = await apiClient.patch(`/patient-management/care-plans/${id}`, data);
  return response.data;
};

export const achieveGoal = async (planId, goalId) => {
  const response = await apiClient.patch(`/patient-management/care-plans/${planId}/goals/${goalId}/achieve`);
  return response.data;
};

// ========== CARE TEMPLATES ==========

export const createCareTemplate = async (data) => {
  const response = await apiClient.post('/care-templates', data);
  return response.data;
};

export const getCareTemplates = async (patientType) => {
  const response = await apiClient.get('/care-templates', {
    params: { patientType }
  });
  return response.data;
};

export const getCareTemplate = async (id) => {
  const response = await apiClient.get(`/care-templates/${id}`);
  return response.data;
};

export const updateCareTemplate = async (id, data) => {
  const response = await apiClient.patch(`/care-templates/${id}`, data);
  return response.data;
};

export const deleteCareTemplate = async (id) => {
  const response = await apiClient.delete(`/care-templates/${id}`);
  return response.data;
};

// ========== PATIENT VIEW ==========

export const getMyCareDashboard = async () => {
  const response = await apiClient.get('/my-care/dashboard');
  return response.data;
};

export const getMyDailyCare = async (params) => {
  const response = await apiClient.get('/my-care/daily-care', { params });
  return response.data;
};

export const getMyMedications = async (params) => {
  const response = await apiClient.get('/my-care/medications', { params });
  return response.data;
};

export const getMyRecommendations = async () => {
  const response = await apiClient.get('/my-care/recommendations');
  return response.data;
};

export const getMyIncidents = async (params) => {
  const response = await apiClient.get('/my-care/incidents', { params });
  return response.data;
};

export const getMyAppointments = async (params) => {
  const response = await apiClient.get('/my-care/appointments', { params });
  return response.data;
};

export const getMyHealthIndicators = async (params) => {
  const response = await apiClient.get('/my-care/health-indicators', { params });
  return response.data;
};

export const getMyDocuments = async (params) => {
  const response = await apiClient.get('/my-care/documents', { params });
  return response.data;
};

export const getMyCarePlans = async (params) => {
  const response = await apiClient.get('/my-care/care-plans', { params });
  return response.data;
};
