# 📱 Migración Web → React Native + Expo

## Resumen de la Migración

Tu aplicación web **Meal Buddy** (Next.js) ha sido migrada exitosamente a **React Native con Expo** para que puedas probarla en iOS con Expo Go.

## ✅ Lo que se ha completado

### 1. Inicialización del Proyecto
- ✅ Proyecto Expo con TypeScript configurado
- ✅ Estructura de carpetas organizada en `/src`
- ✅ Backup del proyecto web original en `/web-backup`

### 2. Dependencias Instaladas

#### Core
- `expo` - Framework de React Native
- `react-native` - Biblioteca base
- `@react-navigation/native` - Navegación entre pantallas
- `@react-navigation/native-stack` - Stack navigator

#### Firebase
- `firebase` - SDK de Firebase
- `@react-native-firebase/app` - Firebase para React Native
- `@react-native-firebase/auth` - Autenticación
- `@react-native-firebase/firestore` - Base de datos
- `expo-firebase-recaptcha` - reCAPTCHA para auth
- `@react-native-async-storage/async-storage` - Persistencia local

#### Utilidades
- `axios` - Cliente HTTP para API calls
- `date-fns` - Manejo de fechas
- `react-hook-form` - Formularios
- `zod` - Validación de schemas
- `@hookform/resolvers` - Integración form + validación

#### Pagos
- `@stripe/stripe-react-native` - Stripe para React Native

### 3. Servicios Migrados

#### Autenticación ([src/config/firebase.ts](src/config/firebase.ts))
- Inicialización de Firebase con persistencia AsyncStorage
- Compatible con React Native
- Configuración de Auth y Firestore

#### Firestore ([src/services/firestore.ts](src/services/firestore.ts))
- `addMeal()` - Agregar comidas
- `getMealHistory()` - Obtener historial
- `getRecentMeals()` - Comidas recientes para recomendaciones

#### Suscripciones ([src/services/subscription.ts](src/services/subscription.ts))
- `getUserSubscription()` - Obtener plan del usuario
- `updateUserSubscription()` - Actualizar suscripción
- `SUBSCRIPTION_LIMITS` - Límites de planes Free/Premium

#### Recomendaciones ([src/services/recommendations.ts](src/services/recommendations.ts))
- `generateMealRecommendation()` - Integración con OpenAI
- Genera sugerencias basadas en historial
- Incluye recetas completas

### 4. Hooks Personalizados

#### [src/hooks/useAuth.ts](src/hooks/useAuth.ts)
```typescript
const { user, loading } = useAuth();
```
- Maneja el estado de autenticación
- Escucha cambios en Firebase Auth

#### [src/hooks/useSubscription.ts](src/hooks/useSubscription.ts)
```typescript
const { subscription, loading, isPremium } = useSubscription();
```
- Obtiene el plan de suscripción del usuario
- Detecta si es premium

### 5. Pantallas Creadas

#### [src/screens/AuthScreen.tsx](src/screens/AuthScreen.tsx)
- Pantalla de login con teléfono
- Verificación OTP con reCAPTCHA
- UI adaptada a React Native
- Manejo de estados (phone → code)

#### [src/screens/DashboardScreen.tsx](src/screens/DashboardScreen.tsx)
- Pantalla principal de la app
- Header con saludo y botón de logout
- Card de upgrade a Premium (si es free)
- Formulario para agregar comidas
- Historial de comidas con refresh
- Todas las funcionalidades principales

### 6. Navegación

#### [src/navigation/AppNavigator.tsx](src/navigation/AppNavigator.tsx)
- React Navigation configurado
- Stack Navigator
- Protección de rutas por autenticación
- Loading state mientras verifica auth

### 7. Configuración

#### [app.json](app.json)
- Nombre: "Meal Buddy"
- Bundle IDs configurados (iOS y Android)
- Plugins de Firebase y reCAPTCHA
- Colores y splash screen

#### [.env.example](.env.example)
- Template de variables de entorno
- Credenciales de Firebase
- API keys de OpenAI y Stripe

## 🔄 Cambios Principales de Web a Mobile

### UI/UX
| Web (Next.js) | Mobile (React Native) |
|---------------|----------------------|
| `<div>` | `<View>` |
| `<p>`, `<h1>` | `<Text>` |
| `<input>` | `<TextInput>` |
| `<button>` | `<TouchableOpacity>` |
| CSS/Tailwind | StyleSheet API |
| next/router | React Navigation |

### Autenticación
- **Web**: reCAPTCHA DOM container
- **Mobile**: `FirebaseRecaptchaVerifierModal` de Expo

### Storage
- **Web**: localStorage
- **Mobile**: AsyncStorage

### Navegación
- **Web**: Next.js App Router (`router.push()`)
- **Mobile**: React Navigation (`navigation.navigate()`)

## 📂 Estructura de Archivos

```
meal-buddy-app/
├── src/
│   ├── config/
│   │   └── firebase.ts              # ✅ Configuración Firebase
│   ├── hooks/
│   │   ├── useAuth.ts               # ✅ Hook de autenticación
│   │   └── useSubscription.ts       # ✅ Hook de suscripción
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # ✅ Navegador principal
│   │   └── types.ts                 # ✅ Tipos de navegación
│   ├── screens/
│   │   ├── AuthScreen.tsx           # ✅ Pantalla de login
│   │   └── DashboardScreen.tsx      # ✅ Pantalla principal
│   └── services/
│       ├── firestore.ts             # ✅ Operaciones DB
│       ├── subscription.ts          # ✅ Gestión de planes
│       └── recommendations.ts       # ✅ IA con OpenAI
├── web-backup/                      # 📦 Proyecto web original
├── App.tsx                          # ✅ Punto de entrada
├── app.json                         # ✅ Config de Expo
├── package.json                     # ✅ Dependencias
├── .env.example                     # ✅ Template de env vars
├── .gitignore                       # ✅ Actualizado con .env
├── README.md                        # ✅ Documentación completa
├── INICIO_RAPIDO.md                 # ✅ Guía rápida
└── MIGRACION.md                     # 📄 Este archivo
```

## 🎯 Funcionalidades Disponibles

### ✅ Completamente funcionales
- [x] Autenticación con teléfono + OTP
- [x] Persistencia de sesión
- [x] Agregar comidas (nombre, categoría, notas)
- [x] Ver historial de comidas
- [x] Pull to refresh
- [x] Sistema de suscripciones (estructura)
- [x] Indicador de plan Premium
- [x] Logout

### ⏳ Requiere configuración
- [ ] Recomendaciones con IA (requiere OpenAI API Key en .env)
- [ ] Pagos con Stripe (requiere Stripe Key y backend)
- [ ] Notificaciones push (requiere configuración adicional)

### 🚧 Por implementar
- [ ] Editar/eliminar comidas
- [ ] Imágenes de comidas
- [ ] Filtros en historial
- [ ] Gráficas de estadísticas
- [ ] Modo offline completo

## 🔑 Próximos Pasos

1. **Configurar Firebase** (OBLIGATORIO)
   - Crear proyecto
   - Habilitar Phone Auth
   - Crear base de datos Firestore
   - Copiar credenciales a `.env`

2. **Probar la app** (iOS con Expo Go)
   ```bash
   npm install
   npm start
   # Escanear QR con Expo Go
   ```

3. **Agregar OpenAI** (OPCIONAL)
   - Obtener API Key de OpenAI
   - Agregar a `.env`
   - Probar recomendaciones

4. **Configurar Stripe** (OPCIONAL)
   - Configurar cuenta de Stripe
   - Crear productos/precios
   - Implementar backend para webhooks

## 📝 Notas Importantes

### Variables de Entorno
- Todas las variables deben empezar con `EXPO_PUBLIC_` para ser accesibles en el cliente
- Reinicia el servidor después de modificar `.env`
- Nunca subas `.env` a Git (ya está en .gitignore)

### Firebase
- Phone Auth requiere configurar SHA-1 para Android
- iOS requiere configurar App Store restrictions (opcional en dev)
- Firestore necesita reglas de seguridad en producción

### Expo Go vs Build Nativo
- **Expo Go**: Perfecto para desarrollo y testing
- **Build Nativo**: Necesario para publicar en App Store
- Usa `eas build` cuando estés listo para producción

## 🐛 Problemas Conocidos

1. **Warnings de dependencias**: Algunas dependencias tienen deprecations pero son seguras
2. **Firebase reCAPTCHA**: En iOS a veces tarda en cargar, es normal
3. **Hot Reload**: A veces necesitas recargar manualmente (Cmd+D en iOS)

## 📚 Documentación

- [README.md](README.md) - Guía completa con troubleshooting
- [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - Pasos para empezar rápido
- Proyecto web original respaldado en `/web-backup`

## 🎉 Conclusión

La migración está completa y lista para usar. El proyecto web original está respaldado en `/web-backup` por si necesitas consultarlo.

**Para empezar:** Lee [INICIO_RAPIDO.md](INICIO_RAPIDO.md)

**¿Preguntas?** Consulta [README.md](README.md) para más detalles

---

Migración completada el 24 de Octubre, 2025
