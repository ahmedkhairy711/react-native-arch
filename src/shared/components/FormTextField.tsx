import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { TextInput, type TextInputProps, View } from 'react-native';

import { makeStyles, useTheme } from '@/core/theme/ThemeProvider';

import { AppText } from './AppText';

type Props<T extends FieldValues> = Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> & {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

/** Text input bound to react-hook-form. Validation messages come already translated from the schema. */
export function FormTextField<T extends FieldValues>({ control, name, label, ...inputProps }: Props<T>) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
        <View style={styles.container}>
          <AppText variant="label">{label}</AppText>
          <TextInput
            ref={ref}
            value={value as string}
            onChangeText={onChange}
            onBlur={onBlur}
            accessibilityLabel={label}
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, error && styles.inputError]}
            {...inputProps}
          />
          {error?.message ? (
            <AppText variant="caption" color="error" accessibilityRole="alert">
              {error.message}
            </AppText>
          ) : null}
        </View>
      )}
    />
  );
}

const useStyles = makeStyles((t) => ({
  container: { gap: t.spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.md,
    backgroundColor: t.colors.surface,
    color: t.colors.text,
    fontSize: t.typography.body.fontSize,
    textAlign: 'auto',
  },
  inputError: { borderColor: t.colors.error },
}));
