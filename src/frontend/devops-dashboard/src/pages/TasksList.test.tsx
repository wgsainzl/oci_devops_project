import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage'; // Ajusta la ruta si HomePage no está en la misma carpeta
import { useAPI } from '../useAPI';
import { mockPendingActions } from '../mocks/fixtures';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// 1. Mock de la API del Dashboard
vi.mock('../useAPI', () => ({
  useAPI: {
    dashboard: {
      getPendingActions: vi.fn(),
      getStats: vi.fn().mockResolvedValue({ data: {} }),
      getRecentActivity: vi.fn().mockResolvedValue({ data: [] }),
      getWorkload: vi.fn().mockResolvedValue({ data: [] }),
      getTaskStatusSummary: vi.fn().mockResolvedValue({ data: [] }),
      getSprintVelocity: vi.fn().mockResolvedValue({ data: [] }),
    }
  }
}));

// 2. NUEVO: Mock del AuthContext (Tema: Mock Modules - Semana 8)
// Así evitamos que intente cargar authAPI y la lógica real de inicio de sesión
vi.mock('../hooks/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', role: 'DEVELOPER' }, // Simulamos que ya hay un usuario logueado
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe("REQ: Task List Display", () => {
  test("Debe mostrar la información mínima del ticket (Nombre, Developer, etc.)", async () => {
    // Le pasamos tu mockPendingActions que importamos de tus fixtures
    (useAPI.dashboard.getPendingActions as any).mockResolvedValue({ data: mockPendingActions });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // 1. Verificamos "Task Name" (El nombre de la tarea está en el documento)
    expect(await screen.findByText(/API Gateway Implementation/i)).toBeInTheDocument();
    
    // 2. Verificamos "Developer Name" (El responsable asignado a la tarea)
    expect(screen.getByText(/Mau & 1 other\(s\)/i)).toBeInTheDocument();
  });
});