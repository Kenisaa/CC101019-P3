# 📚 Índice de Documentación - Meal Buddy App

Bienvenido a la documentación de Meal Buddy. Esta guía te ayudará a navegar por todos los documentos disponibles.

## 🚀 Empezar Rápido

### Para usuarios nuevos:
1. 📱 [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - **Empieza aquí**
   - Pasos rápidos para ejecutar la app en iOS
   - Configuración básica de Firebase
   - Primera ejecución en Expo Go

### Para configuración detallada:
2. 🔥 [CONFIGURACION_FIREBASE.md](CONFIGURACION_FIREBASE.md)
   - Guía paso a paso de Firebase Console
   - Configuración de Phone Authentication
   - Reglas de seguridad de Firestore
   - Solución de problemas específicos de Firebase

## 📖 Documentación General

### Documentación completa:
3. 📘 [README.md](README.md)
   - Descripción completa del proyecto
   - Todas las características
   - Requisitos y dependencias
   - Scripts disponibles
   - Deployment y builds
   - Troubleshooting completo

### Información técnica:
4. 🔄 [MIGRACION.md](MIGRACION.md)
   - Detalles de la migración web → mobile
   - Qué cambió de Next.js a React Native
   - Estructura de archivos
   - Servicios y hooks implementados
   - Funcionalidades completadas vs pendientes

## 📂 Estructura del Proyecto

```
meal-buddy-app/
├── 📱 INICIO_RAPIDO.md          # ⭐ Empieza aquí
├── 🔥 CONFIGURACION_FIREBASE.md  # Guía de Firebase
├── 📘 README.md                  # Documentación completa
├── 🔄 MIGRACION.md               # Detalles técnicos
├── 📚 DOCUMENTACION.md           # Este archivo
│
├── src/                          # Código fuente
│   ├── config/                   # Configuración
│   ├── screens/                  # Pantallas
│   ├── components/               # Componentes (futuro)
│   ├── hooks/                    # Hooks personalizados
│   ├── services/                 # Servicios y lógica
│   └── navigation/               # Navegación
│
├── web-backup/                   # Proyecto web original
├── .env.example                  # Template de variables
└── App.tsx                       # Punto de entrada
```

## 🎯 Guías por Objetivo

### "Quiero ejecutar la app YA"
→ [INICIO_RAPIDO.md](INICIO_RAPIDO.md) (5-10 minutos)

### "Tengo problemas con Firebase"
→ [CONFIGURACION_FIREBASE.md](CONFIGURACION_FIREBASE.md) (guía detallada)

### "Quiero entender cómo funciona todo"
→ [README.md](README.md) + [MIGRACION.md](MIGRACION.md)

### "Necesito personalizar la app"
→ [README.md](README.md) → Sección "Estructura del Proyecto"

### "Quiero deployar a producción"
→ [README.md](README.md) → Sección "Deployment"

## 🔧 Archivos de Configuración

### Variables de entorno:
- `.env.example` - Template con todas las variables necesarias
- `.env` - Tu archivo personal (crear basado en .example)

### Configuración de la app:
- `app.json` - Configuración de Expo (nombre, bundle ID, plugins)
- `package.json` - Dependencias y scripts npm

### TypeScript:
- `tsconfig.json` - Configuración de TypeScript

## 📝 Archivos Importantes

### Código principal:
- [App.tsx](App.tsx) - Punto de entrada, monta el navegador
- [src/navigation/AppNavigator.tsx](src/navigation/AppNavigator.tsx) - Sistema de navegación
- [src/config/firebase.ts](src/config/firebase.ts) - Configuración Firebase
- [src/screens/AuthScreen.tsx](src/screens/AuthScreen.tsx) - Pantalla de login
- [src/screens/DashboardScreen.tsx](src/screens/DashboardScreen.tsx) - Dashboard principal

### Servicios:
- [src/services/firestore.ts](src/services/firestore.ts) - Operaciones de base de datos
- [src/services/subscription.ts](src/services/subscription.ts) - Gestión de suscripciones
- [src/services/recommendations.ts](src/services/recommendations.ts) - IA y recomendaciones

### Hooks:
- [src/hooks/useAuth.ts](src/hooks/useAuth.ts) - Hook de autenticación
- [src/hooks/useSubscription.ts](src/hooks/useSubscription.ts) - Hook de suscripción

## 🆘 Solución de Problemas

### Por tipo de problema:

**Problemas de instalación/setup:**
- [INICIO_RAPIDO.md](INICIO_RAPIDO.md#solución-de-problemas)

**Problemas con Firebase:**
- [CONFIGURACION_FIREBASE.md](CONFIGURACION_FIREBASE.md#solución-de-problemas)

**Problemas generales:**
- [README.md](README.md#problemas-comunes)

**Errores de build/deployment:**
- [README.md](README.md#deployment)

## 📊 Flujo de Lectura Recomendado

### Para desarrolladores:
1. [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - Ejecuta la app
2. [MIGRACION.md](MIGRACION.md) - Entiende la arquitectura
3. [README.md](README.md) - Documentación completa
4. Explora el código en [src/](src/)

### Para usuarios finales:
1. [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - Configura y ejecuta
2. Si hay problemas → [CONFIGURACION_FIREBASE.md](CONFIGURACION_FIREBASE.md)
3. Para más info → [README.md](README.md)

## 🔗 Enlaces Externos Útiles

### Documentación oficial:
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)

### Tutoriales relacionados:
- [Firebase Phone Auth iOS](https://firebase.google.com/docs/auth/ios/phone-auth?hl=es-419)
- [Expo Firebase Setup](https://docs.expo.dev/guides/using-firebase/)
- [EAS Build](https://docs.expo.dev/build/setup/)

## 📞 Soporte

### Orden de acción ante problemas:

1. **Busca en la documentación**
   - Usa Cmd+F / Ctrl+F para buscar palabras clave
   - Revisa la sección de troubleshooting

2. **Revisa los logs**
   - Terminal de Expo (errores del servidor)
   - Console de la app en Expo Go (errores de runtime)
   - Firebase Console (errores de auth/database)

3. **Consulta documentación oficial**
   - Error de Expo → [Expo Docs](https://docs.expo.dev/)
   - Error de Firebase → [Firebase Docs](https://firebase.google.com/docs)
   - Error de React Native → [RN Docs](https://reactnavigation.org/)

4. **Limpia y reinicia**
   ```bash
   npm start --clear
   ```

## ✅ Checklist de Verificación

Antes de pedir ayuda, verifica que:

- [ ] Leíste [INICIO_RAPIDO.md](INICIO_RAPIDO.md)
- [ ] Configuraste Firebase correctamente ([CONFIGURACION_FIREBASE.md](CONFIGURACION_FIREBASE.md))
- [ ] Creaste el archivo `.env` con todas las variables
- [ ] Instalaste las dependencias (`npm install`)
- [ ] Reiniciaste el servidor después de cambios en `.env`
- [ ] Revisaste los logs en la terminal
- [ ] Probaste limpiar la caché (`npm start --clear`)

## 🎓 Aprender Más

### Conceptos clave para entender el proyecto:

**React Native:**
- Componentes nativos vs web
- StyleSheet API
- Navegación mobile

**Firebase:**
- Authentication con Phone
- Cloud Firestore (NoSQL)
- Security Rules

**Expo:**
- Expo Go vs builds nativos
- Environment variables
- Plugins y módulos

**Arquitectura:**
- Custom hooks
- Service layer pattern
- State management

## 📦 Proyecto Original (Web)

El proyecto web original está respaldado en [web-backup/](web-backup/).

Si necesitas consultar cómo funcionaba algo en la versión web:
- Código original en `web-backup/`
- Comparación detallada en [MIGRACION.md](MIGRACION.md)

## 🚀 Próximos Pasos

Una vez que tengas la app funcionando:

1. **Personaliza la UI**: Modifica [src/screens/DashboardScreen.tsx](src/screens/DashboardScreen.tsx)
2. **Agrega OpenAI**: Configura recomendaciones con IA
3. **Implementa Stripe**: Habilita pagos premium
4. **Build nativo**: Prepara la app para App Store

Ver [README.md](README.md) para guías de cada paso.

---

## 📄 Resumen de Documentos

| Documento | Propósito | Tiempo de lectura |
|-----------|-----------|-------------------|
| [INICIO_RAPIDO.md](INICIO_RAPIDO.md) | Guía de inicio rápido | 5-10 min |
| [CONFIGURACION_FIREBASE.md](CONFIGURACION_FIREBASE.md) | Configuración Firebase detallada | 15-20 min |
| [README.md](README.md) | Documentación completa | 20-30 min |
| [MIGRACION.md](MIGRACION.md) | Detalles técnicos de migración | 10-15 min |
| [DOCUMENTACION.md](DOCUMENTACION.md) | Este índice | 5 min |

---

**¿Por dónde empezar?** → [INICIO_RAPIDO.md](INICIO_RAPIDO.md) 🚀
