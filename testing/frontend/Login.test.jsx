import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Login } from '../../web/src/pages/Login.jsx';
import { useAuth } from '../../web/src/auth.jsx';

vi.mock('../auth.jsx', () => ({
  useAuth: vi.fn(),
}));

describe('Login', () => {
  const signIn = vi.fn();
  const signUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      signIn,
      signUp,
    });
  });

  // Initial rendering
  it('renders the sign-in form by default', () => {
    render(<Login />);

    expect(
      screen.getByRole('heading', {
        name: 'Sign in to Bionic Portal',
      })
    ).toBeInTheDocument();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    expect(
      screen.queryByLabelText('Name')
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Sign in' })
    ).toBeInTheDocument();
  });

  it('displays the Bionic Portal branding', () => {
    render(<Login />);

    expect(screen.getByText('Bionic')).toBeInTheDocument();
    expect(screen.getByText('Portal')).toBeInTheDocument();
    expect(screen.getByText('Project Perfect Fit')).toBeInTheDocument();
  });

  // Sign-in
  it('calls signIn with the entered email and password', async () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in' })
    );

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        'test@example.com',
        'Password123!'
      );
    });

    expect(signUp).not.toHaveBeenCalled();
  });

  // Sign-up
  it('switches to the sign-up form', () => {
    render(<Login />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Create one' })
    );

    expect(
      screen.getByRole('heading', {
        name: 'Create an account',
      })
    ).toBeInTheDocument();

    expect(screen.getByLabelText('Name')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeInTheDocument();
  });

  it('displays the password requirements in sign-up mode', () => {
    render(<Login />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Create one' })
    );

    expect(
      screen.getByText(/At least 8 characters/)
    ).toBeInTheDocument();
  });

  it('calls signUp with the entered name, email and password', async () => {
    render(<Login />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Create one' })
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Smith' },
    });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Create account' })
    );

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        'John Smith',
        'john@example.com',
        'Password123!'
      );
    });

    expect(signIn).not.toHaveBeenCalled();
  });

  // Switching modes
  it('switches back to sign-in mode', () => {
    render(<Login />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Create one' })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in' })
    );

    expect(
      screen.getByRole('heading', {
        name: 'Sign in to Bionic Portal',
      })
    ).toBeInTheDocument();

    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  // Password visibility
  it('toggles password visibility', () => {
    render(<Login />);

    const password = screen.getByLabelText('Password');

    expect(password).toHaveAttribute('type', 'password');

    fireEvent.click(
      screen.getByRole('button', { name: 'Show' })
    );

    expect(password).toHaveAttribute('type', 'text');

    fireEvent.click(
      screen.getByRole('button', { name: 'Hide' })
    );

    expect(password).toHaveAttribute('type', 'password');
  });

  it('resets password visibility when switching modes', () => {
    render(<Login />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Show' })
    );

    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'text'
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Create one' })
    );

    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password'
    );
  });

  // Error handling
  it('displays an error when signIn fails', async () => {
    signIn.mockRejectedValueOnce(
      new Error('Invalid email or password')
    );

    render(<Login />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in' })
    );

    expect(
      await screen.findByText('Invalid email or password')
    ).toBeInTheDocument();
  });

  it('displays an error when signUp fails', async () => {
    signUp.mockRejectedValueOnce(
      new Error('Email already registered')
    );

    render(<Login />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Create one' })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Create account' })
    );

    expect(
      await screen.findByText('Email already registered')
    ).toBeInTheDocument();
  });

  it('clears the error when switching modes', async () => {
    signIn.mockRejectedValueOnce(
      new Error('Invalid credentials')
    );

    render(<Login />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in' })
    );

    expect(
      await screen.findByText('Invalid credentials')
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Create one' })
    );

    expect(
      screen.queryByText('Invalid credentials')
    ).not.toBeInTheDocument();
  });

  // Loading state
  it('disables the submit button while signing in', async () => {
    let resolveSignIn;

    signIn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        })
    );

    render(<Login />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in' })
    );

    expect(
      screen.getByRole('button', { name: 'Working…' })
    ).toBeDisabled();

    resolveSignIn();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Sign in' })
      ).toBeEnabled();
    });
  });

  it('re-enables the submit button after an error', async () => {
    signIn.mockRejectedValueOnce(new Error('Login failed'));

    render(<Login />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in' })
    );

    await screen.findByText('Login failed');

    expect(
      screen.getByRole('button', { name: 'Sign in' })
    ).toBeEnabled();
  });

  // Keyboard interaction
  it('submits the form when Enter is pressed in an input', async () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123!' },
    });

    fireEvent.keyDown(screen.getByLabelText('Password'), {
      key: 'Enter',
      code: 'Enter',
    });

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        'test@example.com',
        'Password123!'
      );
    });
  });

  it('does not submit when a non-Enter key is pressed', () => {
    render(<Login />);

    fireEvent.keyDown(screen.getByLabelText('Email'), {
      key: 'Tab',
      code: 'Tab',
    });

    expect(signIn).not.toHaveBeenCalled();
    expect(signUp).not.toHaveBeenCalled();
  });
});
