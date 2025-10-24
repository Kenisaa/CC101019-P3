# Meal Buddy App - React Native + Expo

Meal Buddy es una aplicación móvil de recomendaciones de comidas con IA que te ayuda a descubrir qué comer cada día.

## 🚀 Características

- **Autenticación con Teléfono**: Login seguro con OTP vía Firebase
- **Recomendaciones con IA**: Sugerencias personalizadas usando OpenAI GPT-4o-mini
- **Historial de Comidas**: Registra y consulta tus comidas
- **Sistema de Suscripciones**: Plan gratuito y premium con Stripe
- **Multiplataforma**: Funciona en iOS y Android con Expo Go

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Expo Go app instalada en tu dispositivo iOS o Android
- Cuenta de Firebase
- API Key de OpenAI (opcional, para recomendaciones)
- Cuenta de Stripe (opcional, para pagos)

## 🛠️ Instalación

1. **Clonar o navegar al proyecto:**
   ```bash
   cd meal-buddy-app
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**

   Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Edita el archivo `.env` con tus credenciales:

   ```env
   # Firebase Configuration
   EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=tu_app_id

   # OpenAI API (para recomendaciones)
   EXPO_PUBLIC_OPENAI_API_KEY=tu_openai_api_key

   # Stripe (para pagos)
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_key
   ```

## 🔥 Configuración de Firebase

1. **Crear proyecto en Firebase:**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto
   - Activa **Authentication** y habilita el método de **Phone**
   - Activa **Cloud Firestore**

2. **Configurar autenticación por teléfono:**
   - En Firebase Console → Authentication → Sign-in method
   - Habilita "Phone"
   - Para iOS: Configura las App Store Restrictions (opcional para desarrollo)

3. **Configurar Firestore:**
   - Ve a Firestore Database
   - Crea la base de datos en modo de prueba (o producción con reglas)

   **Reglas de seguridad recomendadas:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;

         match /meals/{mealId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }

         match /subscription/{document=**} {
           allow read: if request.auth != null && request.auth.uid == userId;
           allow write: if false; // Solo el backend puede escribir
         }
       }
     }
   }
   ```

4. **Obtener credenciales:**
   - Ve a Project Settings → General
   - En "Your apps", registra una app iOS y/o Android
   - Copia las credenciales a tu archivo `.env`

## 📱 Ejecutar la App

### Con Expo Go (Recomendado para desarrollo)

1. **Iniciar el servidor de desarrollo:**
   ```bash
   npm start
   ```

2. **Escanear el QR:**
   - **iOS**: Abre la app de Cámara y escanea el código QR
   - **Android**: Abre Expo Go y escanea el código QR

### En Simulador/Emulador

```bash
# iOS (requiere Mac con Xcode)
npm run ios

# Android (requiere Android Studio)
npm run android
```

## 📁 Estructura del Proyecto

```
meal-buddy-app/
├── src/
│   ├── config/           # Configuración (Firebase, etc.)
│   │   └── firebase.ts
│   ├── hooks/            # Custom hooks de React
│   │   ├── useAuth.ts
│   │   └── useSubscription.ts
│   ├── navigation/       # Navegación de la app
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── screens/          # Pantallas principales
│   │   ├── AuthScreen.tsx
│   │   └── DashboardScreen.tsx
│   ├── services/         # Servicios y lógica de negocio
│   │   ├── firestore.ts
│   │   ├── subscription.ts
│   │   └── recommendations.ts
│   └── types/            # Tipos de TypeScript
├── web-backup/           # Backup del proyecto web original
├── App.tsx               # Componente principal
├── package.json
├── .env                  # Variables de entorno (crear)
└── .env.example          # Ejemplo de variables de entorno
```

## 🎯 Funcionalidades Principales

### Autenticación
- Login con número de teléfono
- Verificación OTP
- Gestión automática de sesión

### Dashboard
- Agregar comidas con categoría (Desayuno, Comida, Cena, Snack)
- Ver historial de comidas
- Sistema de pull-to-refresh
- Indicador de plan premium

### Recomendaciones (Próximamente)
- Integración con OpenAI para sugerencias personalizadas
- Basadas en historial de comidas
- Recetas completas con ingredientes

### Suscripciones

**Plan Gratuito:**
- 3 recomendaciones por día
- 1 receta por recomendación
- 7 días de historial

**Plan Premium:**
- Recomendaciones ilimitadas
- 3 recetas por recomendación
- 365 días de historial

## 🔧 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Ejecutar en web (experimental)
npm run web

# Limpiar caché
npm start --clear
```

## ⚠️ Problemas Comunes

### Error de Firebase en iOS
Si recibes errores de autenticación en iOS:
- Asegúrate de que el Bundle ID de tu app coincida con el configurado en Firebase
- Verifica que reCAPTCHA esté configurado correctamente

### Error de módulos nativos
Si encuentras errores con módulos nativos:
```bash
# Limpiar caché de Expo
expo start --clear

# O reinstalar dependencias
rm -rf node_modules
npm install
```

### Variables de entorno no cargadas
- Asegúrate de que el archivo `.env` esté en la raíz
- Reinicia el servidor de desarrollo después de modificar `.env`
- Las variables deben comenzar con `EXPO_PUBLIC_` para ser accesibles en el cliente

## 🚀 Deployment

### Build para iOS
```bash
# Crear build de desarrollo
eas build --profile development --platform ios

# Crear build de producción
eas build --profile production --platform ios
```

### Build para Android
```bash
# Crear build de desarrollo
eas build --profile development --platform android

# Crear build de producción
eas build --profile production --platform android
```

**Nota:** Necesitas configurar EAS (Expo Application Services) para hacer builds. Visita [docs.expo.dev/build/setup](https://docs.expo.dev/build/setup/) para más información.

## 📚 Recursos

- [Documentación de Expo](https://docs.expo.dev/)
- [Documentación de React Native](https://reactnative.dev/)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Documentación de React Navigation](https://reactnavigation.org/)
- [OpenAI API](https://platform.openai.com/docs)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y está en desarrollo.

## 👨‍💻 Soporte

Si tienes problemas o preguntas:
1. Revisa la sección de Problemas Comunes
2. Consulta la documentación de Expo y Firebase
3. Crea un issue en el repositorio

---

Desarrollado con ❤️ usando React Native y Expo
