import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const { isDark } = useTheme();
  const palette = getPalette(isDark);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.textMuted}
        style={[
          styles.input,
          {
            color: palette.text,
            borderColor: error ? palette.danger : palette.border,
            backgroundColor: palette.surface,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  error: { fontSize: 12, marginTop: 4 },
});
