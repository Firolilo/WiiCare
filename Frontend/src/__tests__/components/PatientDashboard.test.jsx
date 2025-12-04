import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import PatientDashboard from '../../components/caregiver/PatientDashboard';
import * as patientManagementApi from '../../api/patientManagement';

// Mock the API
vi.mock('../../api/patientManagement', () => ({
  getPatientProfile: vi.fn(),
  updatePatientProfile: vi.fn(),
  getDailyCare: vi.fn(),
  getMedications: vi.fn(),
  getRecommendations: vi.fn(),
  getIncidents: vi.fn(),
  getAppointments: vi.fn(),
  getHealthIndicators: vi.fn(),
  getCarePlans: vi.fn()
}));

// Mock section components
vi.mock('../../components/caregiver/sections/DailyCareSection', () => ({
  default: () => <div data-testid="daily-care-section">Daily Care Section</div>
}));
vi.mock('../../components/caregiver/sections/MedicationsSection', () => ({
  default: () => <div data-testid="medications-section">Medications Section</div>
}));
vi.mock('../../components/caregiver/sections/RecommendationsSection', () => ({
  default: () => <div data-testid="recommendations-section">Recommendations Section</div>
}));
vi.mock('../../components/caregiver/sections/IncidentsSection', () => ({
  default: () => <div data-testid="incidents-section">Incidents Section</div>
}));
vi.mock('../../components/caregiver/sections/AppointmentsSection', () => ({
  default: () => <div data-testid="appointments-section">Appointments Section</div>
}));
vi.mock('../../components/caregiver/sections/HealthIndicatorsSection', () => ({
  default: () => <div data-testid="health-section">Health Section</div>
}));
vi.mock('../../components/caregiver/sections/CarePlansSection', () => ({
  default: () => <div data-testid="care-plans-section">Care Plans Section</div>
}));

const mockProfile = {
  _id: 'profile1',
  patient: { _id: 'p1', name: 'Juan Pérez', email: 'juan@test.com' },
  patientType: 'elderly',
  age: 75,
  gender: 'masculino',
  allergies: ['penicilina', 'mariscos'],
  diagnoses: ['diabetes', 'hipertensión'],
  isActive: true,
  careTemplate: { _id: 't1', name: 'Plantilla Adulto Mayor' },
  createdAt: new Date().toISOString()
};

describe('PatientDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientManagementApi.getPatientProfile.mockResolvedValue({ profile: mockProfile });
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/paciente/profile1']}>
        <Routes>
          <Route path="/paciente/:patientProfileId" element={<PatientDashboard />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    renderWithRouter();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders patient name after loading', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
  });

  it('displays patient type badge', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Adulto mayor')).toBeInTheDocument();
    });
  });

  it('displays care template name', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Plantilla Adulto Mayor/)).toBeInTheDocument();
    });
  });

  it('displays allergies warning', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/penicilina, mariscos/)).toBeInTheDocument();
    });
  });

  it('shows all navigation tabs', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Cuidados Diarios')).toBeInTheDocument();
      expect(screen.getByText('Medicamentos')).toBeInTheDocument();
      expect(screen.getByText('Recomendaciones')).toBeInTheDocument();
      expect(screen.getByText('Incidentes')).toBeInTheDocument();
      expect(screen.getByText('Citas')).toBeInTheDocument();
      expect(screen.getByText('Indicadores de Salud')).toBeInTheDocument();
      expect(screen.getByText('Planes de Cuidado')).toBeInTheDocument();
    });
  });

  it('shows daily care section by default', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('daily-care-section')).toBeInTheDocument();
    });
  });

  it('switches to medications tab when clicked', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Medicamentos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Medicamentos'));

    await waitFor(() => {
      expect(screen.getByTestId('medications-section')).toBeInTheDocument();
    });
  });

  it('shows edit profile button', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });
  });

  it('toggles edit mode when edit button is clicked', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Editar Perfil'));

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
    });
  });

  it('shows not found when profile is null', async () => {
    patientManagementApi.getPatientProfile.mockResolvedValue({ profile: null });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Perfil no encontrado')).toBeInTheDocument();
    });
  });
});
