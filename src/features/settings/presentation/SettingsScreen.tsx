import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { makeStyles } from '@/core/theme/ThemeProvider';
import { AppButton } from '@/shared/components/AppButton';
import { AppText } from '@/shared/components/AppText';

import { useSettingsViewModel } from './useSettingsViewModel';

export function SettingsScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const vm = useSettingsViewModel();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Section title={t('settings.appearance')}>
        <Segmented
          value={vm.themeMode}
          onChange={vm.selectTheme}
          options={[
            { value: 'system', label: t('settings.themeSystem') },
            { value: 'light', label: t('settings.themeLight') },
            { value: 'dark', label: t('settings.themeDark') },
          ]}
        />
      </Section>

      <Section title={t('settings.language')}>
        <Segmented
          value={vm.language}
          onChange={vm.selectLanguage}
          options={[
            { value: 'en', label: 'English' },
            { value: 'ar', label: 'العربية' },
          ]}
        />
      </Section>

      <Section title={t('settings.account')}>
        {vm.user ? (
          <View>
            <AppText variant="label">{vm.user.fullName}</AppText>
            <AppText variant="caption" color="textMuted">
              {vm.user.email}
            </AppText>
          </View>
        ) : null}
        <AppButton title={t('auth.signOut')} variant="outline" onPress={vm.signOut} />
      </Section>

      <AppText variant="caption" color="textMuted" style={styles.version}>
        {t('settings.version', { version: vm.version, env: vm.appEnv })}
      </AppText>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      {children}
    </View>
  );
}

type SegmentedProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <AppText variant="label" color={selected ? 'onPrimary' : 'text'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  content: { padding: t.spacing.lg, gap: t.spacing.xl },
  section: { gap: t.spacing.md },
  segmented: {
    flexDirection: 'row',
    padding: t.spacing.xs,
    gap: t.spacing.xs,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  segment: { flex: 1, alignItems: 'center', paddingVertical: t.spacing.sm, borderRadius: t.radius.sm },
  segmentSelected: { backgroundColor: t.colors.primary },
  version: { textAlign: 'center' },
}));
