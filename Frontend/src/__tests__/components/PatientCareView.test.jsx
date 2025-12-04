import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PatientCareView from '../../components/patient/PatientCareView';
import * as patientManagementApi from '../../api/patientManagement';

// Mock the API
vi.mock('../../api/patientManagement', () => ({
  getMyCareDashboard: vi.fn()
}));

const mockDashboard = {
  profile: {
    _id: 'profile1',
    caregiver: { _id: 'c1', name: 'Dra. García' },
    patientType: 'elderly',
    careTemplate: { _id: 't1', name: 'Plantilla Adulto Mayor' }
  },
  dailyCare: [
    { _id: 'dc1', task: 'Baño matutino', completed: true, date: new Date().toISOString() },
    { _id: 'dc2', task: 'Medicación AM', completed: false, date: new Date().toISOString() }
  ],
  medications: [
    { _id: 'm1', name: 'Metformina', dose: '500mg', frequency: 'twice-daily' }
  ],
  recommendations: [
    { _id: 'r1', title: 'Ejercicio diario', content: 'Caminar 30 minutos' }
  ],
  appointments: [
    { _id: 'a1', title: 'Control médico', startTime: new Date(Date.now() + 86400000).toISOString() }
  ],
  incidents: [],
  healthIndicators: [
    { _id: 'h1', type: 'blood-pressure', value: '120/80', unit: 'mmHg', measuredAt: new Date().toISOString() }
  ],
  carePlans: [
    {
      _id: 'cp1',
      title: 'Plan mensual',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      goals: [
        { _id: 'g1', description: 'Mejorar movilidad', achieved: true, achievedDate: new Date().toISOString() },
        { _id: 'g2', description: 'Control de peso', achieved: false }
      ]
    }
  ]
};

describe('PatientCareView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientManagementApi.getMyCareDashboard.mockResolvedValue(mockDashboard);
  });

  it('renders loading state initially', () => {
    render(<PatientCareView />);
    expect(screen.getByText(/Cargando/)).toBeInTheDocument();
  });

  it('displays content after loading', async () => {
    render(<PatientCareView />);

    await waitFor(() => {
      expect(screen.getByText('Mi Panel de Cuidado')).toBeInTheDocument();
    });
  });

  it('displays caregiver name', async () => {
    render(<PatientCareView />);

    await waitFor(() => {
      expect(screen.getByText(/Dra. García/)).toBeInTheDocument();
    });
  });

  it('displays patient type badge', async () => {
    render(<PatientCareView />);

    await waitFor(() => {
      expect(screen.getByText('Adulto mayor')).toBeInTheDocument();
    });
  });

  it('shows message when no caregiver assigned', async () => {
    patientManagementApi.getMyCareDashboard.mockResolvedValue({ profile: null });

    render(<PatientCareView />);

    await waitFor(() => {
      expect(screen.getByText('No tienes un cuidador asignado actualmente')).toBeInTheDocument();
    });
  });
});
