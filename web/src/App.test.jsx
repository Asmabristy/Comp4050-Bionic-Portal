import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

import { useAuth } from './auth.jsx';
import { RANK, isSupervisor} from './roles';

// Auth hook mock to control user state
vi.mock('./auth.jsx', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Login screen
describe('Logged out state', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

  it('renders the login page when the user is not authenticated', () => {
    // Simulate logged-out state
    useAuth.mockReturnValue({
      user: null,
      checking: false,
    });

    render(<App />);

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a loading message while checking the session', () => {
    // Simulate session check in progress
    useAuth.mockReturnValue({
      user: null,
      checking: true,
    });

    render(<App />);

    expect(screen.getByText(/checking your session/i)).toBeInTheDocument();
  });
});

// User logged in
describe('Role-based visibility/accessibility ', () => {
  const roleTestCases = Object.keys(RANK).map((role) => ({
    role,
    name: `${role.charAt(0).toUpperCase() + role.slice(1)}`,
    canAccessAdmin: isSupervisor({ role }),
  }));

  describe('checks sidebar visibility', () => {
    test.each(roleTestCases)(
      'for role "$role": menu visibility and route access should align with rank',
      ({ role, name, canAccessAdmin }) => {
        useAuth.mockReturnValue({
          user: { id: '1', role, name },
          checking: false,
        });

        window.history.pushState({}, 'Dashboard', '/dashboard');
        render(<App />);

        expect(screen.getByRole('main')).toBeInTheDocument();

        if (canAccessAdmin) {
          expect(screen.getByText(/administration/i)).toBeInTheDocument();
        } else {
          expect(screen.queryByText(/administration/i)).not.toBeInTheDocument();
        }
      }
    );
  });

  describe('checks route protection', () => {
    test.each(roleTestCases)(
      'for role "$role": route access should align with rank',
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
});