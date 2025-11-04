import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

function Dummy() { return <div>Private</div>; }

test('redirects unauthenticated users to login', () => {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[{ pathname: '/dashboard' }] }>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dummy /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
  expect(screen.getByText('Login')).toBeInTheDocument();
});
