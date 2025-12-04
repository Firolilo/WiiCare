import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ServiceRequests from '../../components/caregiver/ServiceRequests';
import * as patientManagementApi from '../../api/patientManagement';

// Mock the API
vi.mock('../../api/patientManagement', () => ({
  getCaregiverRequests: vi.fn(),
  acceptServiceRequest: vi.fn(),
  rejectServiceRequest: vi.fn()
}));

const mockRequests = [
  {
    _id: '1',
    patient: { _id: 'p1', name: 'Juan Pérez', email: 'juan@test.com' },
    service: { _id: 's1', title: 'Cuidado de adulto mayor' },
    patientType: 'elderly',
    status: 'pending',
    message: 'Necesito ayuda con mi padre',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    patient: { _id: 'p2', name: 'María López', email: 'maria@test.com' },
    service: { _id: 's2', title: 'Cuidado infantil' },
    patientType: 'child',
    status: 'pending',
    message: 'Busco cuidador para mi hijo',
    createdAt: new Date().toISOString()
  }
];

describe('ServiceRequests Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientManagementApi.getCaregiverRequests.mockResolvedValue({ requests: mockRequests });
  });

  it('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <ServiceRequests />
      </MemoryRouter>
    );
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders requests after loading', async () => {
    render(
      <MemoryRouter>
        <ServiceRequests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María López')).toBeInTheDocument();
    });
  });

  it('displays patient type badges', async () => {
    render(
      <MemoryRouter>
        <ServiceRequests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Adulto mayor')).toBeInTheDocument();
      expect(screen.getByText('Niño')).toBeInTheDocument();
    });
  });

  it('calls acceptServiceRequest when accept button is clicked', async () => {
    patientManagementApi.acceptServiceRequest.mockResolvedValue({ serviceRequest: { status: 'accepted' } });
    window.confirm = vi.fn(() => true);

    render(
      <MemoryRouter>
        <ServiceRequests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByRole('button', { name: /Aceptar/i });
    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(patientManagementApi.acceptServiceRequest).toHaveBeenCalled();
    });
  });

  it('shows filter buttons', async () => {
    render(
      <MemoryRouter>
        <ServiceRequests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pendientes')).toBeInTheDocument();
      expect(screen.getByText('Aceptadas')).toBeInTheDocument();
      expect(screen.getByText('Rechazadas')).toBeInTheDocument();
    });
  });

  it('filters requests by status', async () => {
    render(
      <MemoryRouter>
        <ServiceRequests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pendientes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Aceptadas/i }));

    await waitFor(() => {
      expect(patientManagementApi.getCaregiverRequests).toHaveBeenCalled();
    });
  });

  it('shows empty state when no requests', async () => {
    patientManagementApi.getCaregiverRequests.mockResolvedValue({ requests: [] });

    render(
      <MemoryRouter>
        <ServiceRequests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No hay solicitudes/)).toBeInTheDocument();
    });
  });
});
