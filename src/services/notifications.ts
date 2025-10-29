import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_SETTINGS_KEY = '@meal_buddy_notifications_settings';

export interface NotificationSettings {
  enabled: boolean;
  breakfastTime: string; // "HH:MM" format
  lunchTime: string;
  dinnerTime: string;
  enableBreakfast: boolean;
  enableLunch: boolean;
  enableDinner: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  breakfastTime: '08:00',
  lunchTime: '13:00',
  dinnerTime: '19:00',
  enableBreakfast: true,
  enableLunch: true,
  enableDinner: true,
};

// Configurar el comportamiento de las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Solicitar permisos de notificaciones
export async function registerForPushNotifications(): Promise<string | null> {
  let token = null;

  if (!Device.isDevice) {
    console.log('Las notificaciones push solo funcionan en dispositivos físicos');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('No se otorgaron permisos para notificaciones');
      return null;
    }

    // Configurar canal de notificaciones para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('meal-reminders', {
        name: 'Recordatorios de Comidas',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF8383',
        sound: 'default',
      });
    }

    return 'registered';
  } catch (error) {
    console.error('Error al registrar notificaciones:', error);
    return null;
  }
}

// Obtener configuración de notificaciones
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settingsJson = await AsyncStorage.getItem(NOTIFICATIONS_SETTINGS_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error al obtener configuración de notificaciones:', error);
    return DEFAULT_SETTINGS;
  }
}

// Guardar configuración de notificaciones
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_SETTINGS_KEY, JSON.stringify(settings));
    // Reconfigurar notificaciones con la nueva configuración
    await scheduleAllMealReminders(settings);
  } catch (error) {
    console.error('Error al guardar configuración de notificaciones:', error);
    throw error;
  }
}

// Parsear hora en formato HH:MM
function parseTime(timeString: string): { hour: number; minute: number } {
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute };
}

// Programar recordatorio para una comida específica
async function scheduleMealReminder(
  mealType: 'breakfast' | 'lunch' | 'dinner',
  time: string,
  enabled: boolean
): Promise<string | null> {
  if (!enabled) {
    return null;
  }

  const { hour, minute } = parseTime(time);
  const identifier = `meal-reminder-${mealType}`;

  const messages = {
    breakfast: {
      title: '🌅 Hora del Desayuno',
      body: '¡Buenos días! Es hora de disfrutar tu desayuno. ¿Qué vas a comer hoy?',
    },
    lunch: {
      title: '☀️ Hora del Almuerzo',
      body: '¡Medio día! Es momento de almorzar. ¿Ya tienes tu comida lista?',
    },
    dinner: {
      title: '🌙 Hora de la Cena',
      body: '¡Buenas noches! Es hora de cenar. No olvides registrar tu comida.',
    },
  };

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: messages[mealType].title,
        body: messages[mealType].body,
        sound: 'default',
        data: { mealType },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    console.log(`Recordatorio programado para ${mealType} a las ${time} (ID: ${notificationId})`);
    return notificationId;
  } catch (error) {
    console.error(`Error al programar recordatorio de ${mealType}:`, error);
    return null;
  }
}

// Programar todos los recordatorios de comidas
export async function scheduleAllMealReminders(
  settings?: NotificationSettings
): Promise<void> {
  try {
    const config = settings || (await getNotificationSettings());

    if (!config.enabled) {
      await cancelAllMealReminders();
      return;
    }

    // Cancelar notificaciones anteriores
    await cancelAllMealReminders();

    // Programar nuevas notificaciones
    await scheduleMealReminder('breakfast', config.breakfastTime, config.enableBreakfast);
    await scheduleMealReminder('lunch', config.lunchTime, config.enableLunch);
    await scheduleMealReminder('dinner', config.dinnerTime, config.enableDinner);

    console.log('Recordatorios de comidas programados exitosamente');
  } catch (error) {
    console.error('Error al programar recordatorios:', error);
    throw error;
  }
}

// Cancelar todos los recordatorios de comidas
export async function cancelAllMealReminders(): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.identifier.startsWith('meal-reminder-')) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    console.log('Recordatorios de comidas cancelados');
  } catch (error) {
    console.error('Error al cancelar recordatorios:', error);
    throw error;
  }
}

// Enviar notificación inmediata (útil para testing)
export async function sendTestNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Notificación de Prueba',
        body: '¡Las notificaciones están funcionando correctamente!',
        sound: 'default',
      },
      trigger: null, // Enviar inmediatamente
    });
  } catch (error) {
    console.error('Error al enviar notificación de prueba:', error);
    throw error;
  }
}

// Obtener lista de notificaciones programadas
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error al obtener notificaciones programadas:', error);
    return [];
  }
}

// Listener para cuando se recibe una notificación mientras la app está abierta
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

// Listener para cuando el usuario interactúa con una notificación
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
