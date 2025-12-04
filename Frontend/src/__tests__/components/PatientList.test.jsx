import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import PatientList from '../../components/caregiver/PatientList';
import * as patientManagementApi from '../../api/patientManagement';

// Mock the API
vi.mock('../../api/patientManagement', () => ({
  getCaregiverPatients: vi.fn()
}));

const mockPatients = [
  {
    _id: 'profile1',
    patient: { _id: 'p1', name: 'Juan Pérez', email: 'juan@test.com' },
    patientType: 'elderly',
    age: 75,
    isActive: true,
    careTemplate: { name: 'Plantilla Adulto Mayor' },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'profile2',
    patient: { _id: 'p2', name: 'María López', email: 'maria@test.com' },
    patientType: 'child',
    age: 8,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

describe('PatientList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientManagementApi.getCaregiverPatients.mockResolvedValue({ patients: mockPatients });
  });

  it('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <PatientList />
      </MemoryRouter>
    );
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders patient list after loading', async () => {
    render(
      <MemoryRouter>
        <PatientList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María López')).toBeInTheDocument();
    });
  });

  it('displays patient type labels', async () => {
    render(
      <MemoryRouter>
        <PatientList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Adulto mayor')).toBeInTheDocument();
      expect(screen.getByText('Niño')).toBeInTheDocument();
    });
  });

  it('displays care template name when available', async () => {
    render(
      <MemoryRouter>
        <PatientList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Plantilla:/)).toBeInTheDocument();
    });
  });

  it('shows filter buttons for active/inactive', async () => {
    render(
      <MemoryRouter>
        <PatientList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Activos')).toBeInTheDocument();
      expect(screen.getByText('Inactivos')).toBeInTheDocument();
      expect(screen.getByText('Todos')).toBeInTheDocument();
    });
  });

  it('shows empty state when no patients', async () => {
    patientManagementApi.getCaregiverPatients.mockResolvedValue({ patients: [] });

    render(
      <MemoryRouter>
        <PatientList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No tienes pacientes asignados')).toBeInTheDocument();
    });
  });

  it('links to patient dashboard', async () => {
    render(
      <MemoryRouter>
        <PatientList />
      </MemoryRouter>
    );

    await waitFor(() => {
      const patientCards = screen.getAllByRole('link');
      expect(patientCards[0]).toHaveAttribute('href', '/paciente/profile1');
    });
  });
});
