import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import App from './App';
import { useAuth } from './auth.jsx';
import { RANK, isSupervisor} from './roles';

// Mocked authentication hook to control user state
vi.mock('./auth.jsx', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('logged out', () => {
  const protectedRoutes = [
  '/dashboard',
  '/orders',
  '/orders/new',
  '/orders/123-abc',
  '/cartons',
  '/administration',
  ];

  beforeEach(() => {
    // Clear the 
    vi.clearAllMocks();
    window.history.pushState({}, 'Login', '/login');
  });

    it('renders login page for unauth user', () => {
      useAuth.mockReturnValue({
        user: null,
        checking: false,
      });

      render(<App />);

      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders loading message during session check', () => {
      useAuth.mockReturnValue({
        user: null,
        checking: true, // Simulate session check in progress
      });

      render(<App />);

      expect(screen.getByText(/checking your session/i)).toBeInTheDocument();
    });

    describe('no route access for unauth user', () => {
      test.each(protectedRoutes)(
        'route "%s"',
        (route) => {
        useAuth.mockReturnValue({
        user: null,
        checking: false,
        });
        
      window.history.pushState({}, 'Protected route', route);
      render(<App />);

      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
        }
      )
    });
  });

describe('logged in', () => {
  const roleTestCases = Object.keys(RANK).map(role => ({
    role,
    name: `${role.charAt(0).toUpperCase() + role.slice(1)}`,
    canAccessAdmin: isSupervisor({ role }),
    }));

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, 'Dashboard', '/dashboard');
  });

  describe('role sidebar visibility', () => {
    test.each(roleTestCases)(
      'role $role',
      ({ role, name, canAccessAdmin }) => {
        useAuth.mockReturnValue({
          user: { id: '1', role, name },
          checking: false,
        });

        render(<App />);

        expect(screen.getByRole('main')).toBeInTheDocument();

        if (canAccessAdmin) {
          expect(screen.getByText(/administration/i)).toBeInTheDocument();
        } else {
          expect(screen.queryByText(/administration/i)).not.toBeInTheDocument();
        }
      }
    )
  });

  describe('role route protection', () => {
    test.each(roleTestCases)(
      'role $role',
      ({ role, name, canAccessAdmin }) => {
        useAuth.mockReturnValue({
          user: { id: '1', role, name },
          checking: false,
        });

        window.history.pushState({}, 'Administration', '/administration');
        render(<App />);

        if (canAccessAdmin) {
          expect(screen.getByRole('heading', { name: /administration/i })).toBeInTheDocument();
          expect(window.location.pathname).toBe('/administration');
        } else {
          expect(screen.queryByRole('heading', { name: /administration/i })).not.toBeInTheDocument();
          expect(window.location.pathname).toBe('/dashboard');
        }
      }
    );
  });

  describe('redirects when visiting non-existent route', () => {
    test.each(roleTestCases)(
        'role $role',
        ({ role, name }) => {
          useAuth.mockReturnValue({
            user: { id: '1', role, name },
            checking: false,
          });

        window.history.pushState({}, 'Invalid', '/invalidroutename');
        render(<App />);

        expect(window.location.pathname).toBe('/dashboard');
      }
    )
  });
});