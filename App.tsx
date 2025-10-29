import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/hooks/useAuth';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { registerForPushNotifications, scheduleAllMealReminders } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Registrar para notificaciones
      await registerForPushNotifications();

      // Programar recordatorios de comidas con la configuración guardada
      await scheduleAllMealReminders();

      console.log('✅ Notificaciones inicializadas');
    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
    }
  };

  return (
    <>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
      <StatusBar style="auto" />
    </>
  );
}
