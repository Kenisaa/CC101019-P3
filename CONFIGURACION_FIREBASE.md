# 🔥 Guía Completa de Configuración de Firebase

Esta guía detalla paso a paso cómo configurar Firebase para la app Meal Buddy.

## 📋 Índice

1. [Crear proyecto en Firebase](#1-crear-proyecto-en-firebase)
2. [Habilitar Phone Authentication](#2-habilitar-phone-authentication)
3. [Configurar Cloud Firestore](#3-configurar-cloud-firestore)
4. [Registrar app iOS](#4-registrar-app-ios)
5. [Obtener credenciales](#5-obtener-credenciales)
6. [Configurar reglas de seguridad](#6-configurar-reglas-de-seguridad)

---

## 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"** (o "Add project")
3. Ingresa el nombre del proyecto: `meal-buddy` (o el que prefieras)
4. **Google Analytics**: Puedes deshabilitarlo por ahora (es opcional)
5. Haz clic en **"Crear proyecto"**
6. Espera a que se cree (toma unos 30 segundos)
7. Haz clic en **"Continuar"**

---

## 2. Habilitar Phone Authentication

### 2.1 Navegar a Authentication

1. En el panel lateral izquierdo, busca **"Compilación"** (Build)
2. Haz clic en **"Authentication"**
3. Si es la primera vez, haz clic en **"Comenzar"** (Get started)

### 2.2 Habilitar Phone como método de autenticación

1. Haz clic en la pestaña **"Sign-in method"** (Método de acceso)
2. Busca **"Phone"** (Teléfono) en la lista de proveedores
3. Haz clic sobre **"Phone"**
4. Activa el interruptor para **"Habilitar"**
5. Haz clic en **"Guardar"**

### 2.3 Configuración adicional (Opcional)

**Números de prueba** (útil para desarrollo):
- En la misma pantalla, baja hasta "Phone numbers for testing"
- Puedes agregar números de prueba que no envíen SMS real
- Ejemplo: `+52 55 1234 5678` con código `123456`

**Regiones de SMS** (prevención de abuso):
- Puedes limitar qué países pueden usar Phone Auth
- Útil para evitar gastos no autorizados en SMS

### 2.4 Documentación oficial

Firebase te mostrará el link: [https://firebase.google.com/docs/auth/ios/phone-auth](https://firebase.google.com/docs/auth/ios/phone-auth?hl=es-419)

**Para Expo Go, no necesitas seguir la guía completa** porque `expo-firebase-recaptcha` maneja automáticamente el reCAPTCHA.

---

## 3. Configurar Cloud Firestore

### 3.1 Crear base de datos

1. En el panel lateral, haz clic en **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona la ubicación del servidor:
   - Para México/Latam: `us-central1` o `southamerica-east1`
   - Para España: `europe-west1`
4. **Reglas de seguridad**: Selecciona **"Iniciar en modo de prueba"**
   - ⚠️ IMPORTANTE: Esto es solo para desarrollo
   - Las reglas de producción las configuraremos después
5. Haz clic en **"Habilitar"**

### 3.2 Estructura de la base de datos

Firestore se creará vacío. La app creará automáticamente estas colecciones:

```
users/
  {userId}/
    meals/           # Comidas del usuario
      {mealId}       # Documento individual de comida
    subscription/
      current        # Información de suscripción
```

No necesitas crear nada manualmente, la app lo hará al agregar la primera comida.

---

## 4. Registrar App iOS

### 4.1 Agregar app al proyecto

1. En el panel principal de Firebase, busca **"Tus apps"** debajo del nombre del proyecto
2. Haz clic en el ícono de **iOS** (</>) para agregar una app iOS
3. Si no lo ves, ve a **Project Settings** (⚙️) → pestaña **General** → sección "Your apps"

### 4.2 Configurar detalles de la app

Verás un formulario de registro:

**iOS bundle ID** (OBLIGATORIO):
- Ingresa: `com.mealbuddy.app`
- ⚠️ Este debe coincidir con el `bundleIdentifier` en [app.json](app.json)
- Si cambias este valor, actualiza también el `app.json`

**App nickname** (Opcional):
- Ingresa: `Meal Buddy`
- Es solo para identificar la app en Firebase Console

**App Store ID** (Opcional):
- Déjalo vacío por ahora
- Solo se necesita cuando publiques en App Store

### 4.3 Descargar GoogleService-Info.plist

Firebase te ofrecerá descargar `GoogleService-Info.plist`.

**Para Expo Go**: NO necesitas este archivo. Las credenciales irán en el `.env`.

**Para builds nativos** (cuando hagas `eas build`): Sí necesitarás este archivo más adelante.

Haz clic en **"Siguiente"** y luego **"Continuar a la consola"**.

---

## 5. Obtener Credenciales

### 5.1 Navegar a configuración

1. Haz clic en el ícono de **engranaje** (⚙️) arriba a la izquierda
2. Selecciona **"Configuración del proyecto"** (Project Settings)
3. Baja hasta la sección **"Tus apps"** (Your apps)
4. Deberías ver tu app iOS listada

### 5.2 Ver credenciales

Haz clic en tu app iOS para expandir la configuración. Verás:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "meal-buddy-12345.firebaseapp.com",
  projectId: "meal-buddy-12345",
  storageBucket: "meal-buddy-12345.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:ios:abcdef1234567890abcdef"
};
```

### 5.3 Copiar a .env

Crea un archivo `.env` en la raíz del proyecto y copia cada valor:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=meal-buddy-12345.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=meal-buddy-12345
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=meal-buddy-12345.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:ios:abcdef1234567890abcdef
```

**Importante**:
- ✅ Usa los valores de TU proyecto (no los del ejemplo)
- ✅ NO uses comillas alrededor de los valores
- ✅ Asegúrate de que cada variable empiece con `EXPO_PUBLIC_`
- ⚠️ NO compartas este archivo (está en `.gitignore`)

---

## 6. Configurar Reglas de Seguridad

### 6.1 Por qué son importantes

Las reglas de Firestore controlan quién puede leer/escribir datos. En modo de prueba, CUALQUIERA puede leer/escribir durante 30 días.

### 6.2 Reglas recomendadas para producción

1. Ve a **Firestore Database** en Firebase Console
2. Haz clic en la pestaña **"Reglas"** (Rules)
3. Reemplaza las reglas por estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden acceder a sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Comidas del usuario
      match /meals/{mealId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // Suscripciones (solo lectura para el usuario)
      match /subscription/{document=**} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Solo el backend/webhooks pueden escribir
      }
    }
  }
}
```

4. Haz clic en **"Publicar"**

### 6.3 Explicación de las reglas

- **`request.auth != null`**: El usuario debe estar autenticado
- **`request.auth.uid == userId`**: El usuario solo puede acceder a SUS datos
- **Meals**: Lectura/escritura completa para el propio usuario
- **Subscription**: Solo lectura (Stripe webhook actualiza esto por backend)

### 6.4 Probar las reglas

Firebase tiene un simulador de reglas:
1. En la pestaña "Reglas", haz clic en **"Simulador de reglas"**
2. Prueba operaciones como:
   - `get` en `/users/testUserId/meals/meal1`
   - Con y sin autenticación

---

## 7. Verificación Final

### ✅ Checklist de configuración

Verifica que hayas completado:

- [ ] ✅ Proyecto de Firebase creado
- [ ] ✅ Phone Authentication habilitado
- [ ] ✅ Cloud Firestore creado
- [ ] ✅ App iOS registrada con bundle ID correcto
- [ ] ✅ Credenciales copiadas al archivo `.env`
- [ ] ✅ Reglas de seguridad configuradas (o en modo de prueba)

### 🧪 Probar la configuración

1. Inicia la app: `npm start`
2. Abre en Expo Go
3. Intenta autenticarte con tu número de teléfono
4. Deberías recibir un SMS con el código

### 📊 Monitorear uso

En Firebase Console puedes ver:

**Authentication** → pestaña **Users**:
- Usuarios autenticados
- Último acceso
- Proveedor (Phone)

**Firestore Database** → pestaña **Data**:
- Colecciones y documentos creados
- Datos guardados en tiempo real

**Usage** (Uso):
- Número de SMS enviados
- Lecturas/escrituras en Firestore
- Espacio de almacenamiento usado

---

## 🎯 Cuotas y Límites Gratuitos

### Firebase Authentication (Phone)
- **Plan Spark (gratuito)**: Sin SMS incluidos, pagas por uso
- **Plan Blaze (pay-as-you-go)**: ~$0.01-0.06 USD por SMS (según país)
- En desarrollo, Firebase puede no cobrar los primeros SMS

### Cloud Firestore
- **50,000** lecturas/día gratis
- **20,000** escrituras/día gratis
- **1 GB** de almacenamiento gratis

Para una app en desarrollo, el plan gratuito es más que suficiente.

---

## 🔧 Solución de Problemas

### Error: "Firebase project not found"
- Verifica que el `projectId` en `.env` sea correcto
- Reinicia el servidor Expo: `npm start --clear`

### No recibo SMS
- Verifica que Phone Auth esté habilitado
- Revisa en Firebase Console → Authentication → Users si hay intentos fallidos
- Verifica el formato del número: `+[código país] [número]`

### Error: "reCAPTCHA verification failed"
- Asegúrate de tener conexión a internet estable
- Verifica que `expo-firebase-recaptcha` esté instalado
- Revisa que el `bundleIdentifier` en `app.json` coincida con Firebase

### Error de permisos en Firestore
- Verifica las reglas de seguridad
- Asegúrate de estar autenticado antes de acceder a Firestore
- Usa el simulador de reglas para probar

---

## 📚 Recursos Adicionales

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Phone Auth para iOS](https://firebase.google.com/docs/auth/ios/phone-auth?hl=es-419)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Expo Firebase Recaptcha](https://docs.expo.dev/versions/latest/sdk/firebase-recaptcha/)
- [Precios de Firebase](https://firebase.google.com/pricing)

---

## 🆘 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs en la terminal de Expo
2. Consulta la consola de Firebase para ver errores
3. Verifica que TODAS las credenciales en `.env` sean correctas
4. Lee el [README.md](README.md) completo

**Errores comunes guardados en**: [README.md - Problemas Comunes](README.md#problemas-comunes)

---

Configurado correctamente, ¡ya puedes usar Phone Auth en tu app! 🎉
