import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Notification03Icon,
  Time01Icon,
  Sun02Icon,
  Restaurant01Icon,
  Moon02Icon,
} from '@hugeicons/core-free-icons';
import {
  getNotificationSettings,
  saveNotificationSettings,
  registerForPushNotifications,
  sendTestNotification,
  scheduleAllMealReminders,
  type NotificationSettings as NotifSettings,
} from '../services/notifications';
import { useTheme } from '../hooks/useTheme';

export default function NotificationSettings() {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<NotifSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getNotificationSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleToggleEnabled = async (value: boolean) => {
    if (!settings) return;

    // Si están activando las notificaciones, pedir permisos primero
    if (value) {
      const token = await registerForPushNotifications();
      if (!token) {
        Alert.alert(
          'Permisos necesarios',
          'Para recibir notificaciones, debes otorgar los permisos en la configuración de tu dispositivo.'
        );
        return;
      }
    }

    const newSettings = { ...settings, enabled: value };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);

    if (value) {
      Alert.alert('¡Listo!', 'Notificaciones activadas correctamente');
    }
  };

  const handleToggleMeal = async (
    meal: 'breakfast' | 'lunch' | 'dinner',
    value: boolean
  ) => {
    if (!settings) return;

    const key = `enable${meal.charAt(0).toUpperCase() + meal.slice(1)}` as keyof NotifSettings;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
  };

  const handleTimePress = (meal: string) => {
    Alert.alert(
      'Configurar hora',
      `La configuración de hora personalizada estará disponible próximamente. Por ahora se usan las horas predeterminadas:\n\nDesayuno: 8:00 AM\nAlmuerzo: 1:00 PM\nCena: 7:00 PM`,
      [{ text: 'OK' }]
    );
  };

  const handleTestNotification = async () => {
    try {
      const token = await registerForPushNotifications();
      if (!token) {
        Alert.alert(
          'Permisos necesarios',
          'Debes otorgar permisos de notificaciones primero.'
        );
        return;
      }

      await sendTestNotification();
      Alert.alert(
        '✅ Notificación enviada',
        'Deberías ver la notificación en unos segundos'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la notificación de prueba');
    }
  };

  if (!settings) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HugeiconsIcon icon={Notification03Icon} size={24} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>Notificaciones</Text>
      </View>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Recibe recordatorios para registrar tus comidas
      </Text>

      {/* Toggle principal */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Activar notificaciones</Text>
          <Text style={styles.settingDescription}>
            Recibir recordatorios diarios
          </Text>
        </View>
        <Switch
          value={settings.enabled}
          onValueChange={handleToggleEnabled}
          trackColor={{ false: '#D1D1D1', true: '#FFBFBF' }}
          thumbColor={settings.enabled ? '#FF8383' : '#F4F3F4'}
        />
      </View>

      {settings.enabled && (
        <>
          {/* Desayuno */}
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <HugeiconsIcon icon={Sun02Icon} size={20} color="#FFB84D" />
              <Text style={styles.mealLabel}>Desayuno</Text>
            </View>
            <View style={styles.mealRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => handleTimePress('breakfast')}
              >
                <HugeiconsIcon icon={Time01Icon} size={16} color="#666" />
                <Text style={styles.timeText}>{settings.breakfastTime}</Text>
              </TouchableOpacity>
              <Switch
                value={settings.enableBreakfast}
                onValueChange={(value) => handleToggleMeal('breakfast', value)}
                trackColor={{ false: '#D1D1D1', true: '#FFBFBF' }}
                thumbColor={settings.enableBreakfast ? '#FF8383' : '#F4F3F4'}
              />
            </View>
          </View>

          {/* Almuerzo */}
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <HugeiconsIcon icon={Restaurant01Icon} size={20} color="#FF6B6B" />
              <Text style={styles.mealLabel}>Almuerzo</Text>
            </View>
            <View style={styles.mealRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => handleTimePress('lunch')}
              >
                <HugeiconsIcon icon={Time01Icon} size={16} color="#666" />
                <Text style={styles.timeText}>{settings.lunchTime}</Text>
              </TouchableOpacity>
              <Switch
                value={settings.enableLunch}
                onValueChange={(value) => handleToggleMeal('lunch', value)}
                trackColor={{ false: '#D1D1D1', true: '#FFBFBF' }}
                thumbColor={settings.enableLunch ? '#FF8383' : '#F4F3F4'}
              />
            </View>
          </View>

          {/* Cena */}
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <HugeiconsIcon icon={Moon02Icon} size={20} color="#6B8AFF" />
              <Text style={styles.mealLabel}>Cena</Text>
            </View>
            <View style={styles.mealRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => handleTimePress('dinner')}
              >
                <HugeiconsIcon icon={Time01Icon} size={16} color="#666" />
                <Text style={styles.timeText}>{settings.dinnerTime}</Text>
              </TouchableOpacity>
              <Switch
                value={settings.enableDinner}
                onValueChange={(value) => handleToggleMeal('dinner', value)}
                trackColor={{ false: '#D1D1D1', true: '#FFBFBF' }}
                thumbColor={settings.enableDinner ? '#FF8383' : '#F4F3F4'}
              />
            </View>
          </View>

          {/* Botón de prueba */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
          >
            <Text style={styles.testButtonText}>
              Enviar notificación de prueba
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  mealCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mealLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  testButton: {
    backgroundColor: '#FF8383',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
