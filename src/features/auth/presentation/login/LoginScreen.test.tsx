import { ApiError } from '@/core/network/api-error';
import type { AuthRepository } from '@/features/auth/data/auth.repository';
import { fireEvent, renderWithProviders, screen, waitFor } from '@test/test-utils';

import { LoginScreen } from './LoginScreen';

const user = { id: 1, username: 'emilys', email: 'e@x.com', fullName: 'Emily J', avatarUrl: '' };

const fakeAuthRepository = (login: AuthRepository['login']): AuthRepository => ({
  login,
  logout: jest.fn(),
  restoreSession: jest.fn(),
  refreshTokens: jest.fn(),
});

describe('LoginScreen', () => {
  it('shows validation errors and does not call the repository', async () => {
    const login = jest.fn();
    await renderWithProviders(<LoginScreen />, { authRepository: fakeAuthRepository(login) });

    await fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByText('This field is required')).toBeOnTheScreen();
    expect(screen.getByText('Must be at least 6 characters')).toBeOnTheScreen();
    expect(login).not.toHaveBeenCalled();
  });

  it('signs in and updates the session', async () => {
    const login = jest.fn().mockResolvedValue(user);
    const { dependencies } = await renderWithProviders(<LoginScreen />, {
      authRepository: fakeAuthRepository(login),
    });

    await fireEvent.changeText(screen.getByLabelText('Username'), 'emilys');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'emilyspass');
    await fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => expect(dependencies.sessionStore.getState().status).toBe('authenticated'));
    expect(login).toHaveBeenCalledWith({ username: 'emilys', password: 'emilyspass' });
  });

  it('shows a friendly message for invalid credentials', async () => {
    const login = jest.fn().mockRejectedValue(new ApiError('badRequest', 'bad', 400));
    await renderWithProviders(<LoginScreen />, { authRepository: fakeAuthRepository(login) });

    await fireEvent.changeText(screen.getByLabelText('Username'), 'emilys');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'wrong-pass');
    await fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByText('Invalid username or password.')).toBeOnTheScreen();
  });
});
