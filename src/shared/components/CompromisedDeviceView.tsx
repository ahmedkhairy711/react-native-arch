import { useTranslation } from 'react-i18next';

import { ErrorView } from './StateViews';

/** Shown instead of the app on rooted/jailbroken/hooked devices (production flavor only). */
export function CompromisedDeviceView() {
  const { t } = useTranslation();
  return <ErrorView message={t('errors.compromisedDevice')} />;
}
