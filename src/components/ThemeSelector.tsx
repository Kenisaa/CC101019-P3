import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Sun02Icon, Moon02Icon, Settings02Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '../hooks/useTheme';

export default function ThemeSelector() {
  const { themeMode, setThemeMode, isDark, theme } = useTheme();

  const options = [
    { value: 'light', label: 'Claro', icon: Sun02Icon },
    { value: 'dark', label: 'Oscuro', icon: Moon02Icon },
    { value: 'system', label: 'Sistema', icon: Settings02Icon },
  ] as const;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Tema de la aplicación</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Elige tu tema preferido</Text>

      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              { backgroundColor: theme.backgroundCard, borderColor: theme.border },
              themeMode === option.value && {
                borderColor: theme.primary,
                backgroundColor: isDark ? theme.backgroundSecondary : '#FFF5F5'
              },
            ]}
            onPress={() => setThemeMode(option.value)}
          >
            <HugeiconsIcon
              icon={option.icon}
              size={24}
              color={themeMode === option.value ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.optionText,
                { color: theme.textSecondary },
                themeMode === option.value && { color: theme.primary, fontWeight: '600' },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {themeMode === 'system' && (
        <Text style={[styles.infoText, { color: theme.textTertiary }]}>
          El tema se ajustará automáticamente según la configuración de tu dispositivo
          {isDark ? ' (Oscuro activo)' : ' (Claro activo)'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionButtonActive: {
    borderColor: '#FF8383',
    backgroundColor: '#FFF5F5',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  optionTextActive: {
    color: '#FF8383',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
