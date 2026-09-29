import { useTranslation } from 'react-i18next';

import { ApiError } from '@/core/network/api-error';

/** Maps any error to a translated, user-safe message (never shows raw server/stack text). */
export function useErrorMessage() {
  const { t } = useTranslation();
  return (error: unknown): string => t(`errors.${ApiError.from(error).kind}`);
}
