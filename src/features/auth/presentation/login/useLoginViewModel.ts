import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useDependencies } from '@/core/di/DependenciesProvider';
import { ApiError } from '@/core/network/api-error';
import { useErrorMessage } from '@/shared/hooks/useErrorMessage';

import { useSessionStore } from '../../store/session.store';

const PASSWORD_MIN = 6;

const createLoginSchema = (t: TFunction) =>
  z.object({
    username: z.string().trim().min(1, t('validation.required')),
    password: z.string().min(PASSWORD_MIN, t('validation.minLength', { count: PASSWORD_MIN })),
  });

export type LoginForm = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * ViewModel: owns the screen's state & logic, exposes only what the View renders.
 * The View (LoginScreen) stays dumb - no API calls, no business rules.
 */
export function useLoginViewModel() {
  const { t } = useTranslation();
  const toMessage = useErrorMessage();
  const { authRepository } = useDependencies();
  const signedIn = useSessionStore((s) => s.signedIn);

  const form = useForm<LoginForm>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: { username: '', password: '' },
  });

  const login = useMutation({
    mutationFn: (values: LoginForm) => authRepository.login(values),
    onSuccess: signedIn, // Stack.Protected in the root layout navigates to the app
  });

  const errorMessage = login.error
    ? ApiError.from(login.error).kind === 'badRequest'
      ? t('auth.invalidCredentials')
      : toMessage(login.error)
    : null;

  return {
    control: form.control,
    submit: form.handleSubmit((values) => login.mutate(values)),
    isSubmitting: login.isPending,
    errorMessage,
  };
}
