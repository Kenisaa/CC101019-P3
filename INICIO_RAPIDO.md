# 🚀 Inicio Rápido - Meal Buddy App

## Pasos para ejecutar la app en iOS con Expo Go

### 1. Instalar Expo Go en tu iPhone
- Descarga **Expo Go** desde el App Store
- Abre la app (la usaremos más adelante)

### 2. Configurar Firebase

**📚 ¿Necesitas ayuda detallada?** Lee la [Guía Completa de Configuración de Firebase](CONFIGURACION_FIREBASE.md)

#### Resumen rápido:

1. **Crear proyecto**: Ve a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto
2. **Habilitar Phone Auth**: Authentication → Sign-in method → Habilita "Phone"
3. **Crear Firestore**: Firestore Database → Crear base de datos (modo de prueba)
4. **Registrar app iOS**:
   - Project Settings → Add app → iOS
   - Bundle ID: `com.mealbuddy.app`
5. **Copiar credenciales**: Las obtendremos en el siguiente paso

**Nota sobre Phone Auth en iOS**:
- ✅ Expo Go usa reCAPTCHA automáticamente (ya incluido)
- 📱 Recibirás SMS reales en tu teléfono
- 📚 [Guía oficial](https://firebase.google.com/docs/auth/ios/phone-auth?hl=es-419) (opcional de leer)

### 3. Obtener credenciales de Firebase

En Firebase Console, ve a **Project Settings** (⚙️ engranaje arriba a la izquierda) → pestaña **General**.

Baja hasta la sección "Your apps" donde registraste tu app iOS. Verás algo como:

```
SDK setup and configuration

const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:ios:abcdef1234567890"
};
```

**Copia cada valor** (sin las comillas) para el siguiente paso.

### 4. Crear archivo .env

En la raíz del proyecto, crea un archivo llamado `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:ios:abcdef1234567890

# Opcional (para recomendaciones con IA)
EXPO_PUBLIC_OPENAI_API_KEY=tu_openai_key
```

**⚠️ Importante**:
- Reemplaza TODOS los valores con los de TU proyecto Firebase
- NO uses comillas
- NO compartas este archivo (ya está en .gitignore)

### 5. Instalar dependencias (si no lo has hecho)

```bash
npm install
```

### 6. Iniciar el servidor de desarrollo

```bash
npm start
```

Verás un código QR en la terminal.

### 7. Abrir en tu iPhone

1. Abre la app **Expo Go** en tu iPhone
2. Escanea el código QR que aparece en la terminal
3. La app comenzará a cargar y ejecutarse en tu teléfono

## ✅ Verificar que funciona

### Flujo de autenticación:

1. **Pantalla de bienvenida**: Deberías ver "Bienvenido a Meal Buddy" con el emoji 🍽️

2. **Ingresar teléfono**:
   - Usa el formato internacional con código de país
   - Ejemplo México: `+52 55 1234 5678`
   - Ejemplo España: `+34 612 345 678`
   - Ejemplo USA: `+1 234 567 8900`

3. **Toca "Enviar código"**:
   - Se abrirá una ventana de reCAPTCHA (esto es normal)
   - Completa el reCAPTCHA si aparece
   - Firebase enviará un SMS a tu teléfono

4. **Verificar código**:
   - Recibirás un SMS con un código de 6 dígitos
   - Ingresa el código en la app
   - Toca "Verificar código"

5. **¡Listo!**: Deberías entrar al Dashboard principal

### ⚠️ Si no recibes el SMS:

- Verifica que el número esté en formato internacional correcto
- Asegúrate de que Phone Auth esté habilitado en Firebase
- Revisa la consola de Firebase → Authentication para ver intentos
- En desarrollo, Firebase puede tener límites de SMS diarios

## 🎯 Funcionalidades disponibles

- ✅ Autenticación con teléfono
- ✅ Agregar comidas con categoría
- ✅ Ver historial de comidas
- ✅ Sistema de refresh (desliza hacia abajo)
- ⏳ Recomendaciones con IA (requiere OpenAI API Key)
- ⏳ Pagos con Stripe (en desarrollo)

## 🔧 Comandos útiles

```bash
# Iniciar servidor
npm start

# Limpiar caché si hay problemas
npm start --clear

# Ver logs en tiempo real
npm start
```

## ⚠️ Solución de problemas

### El código QR no funciona
- Asegúrate de que tu iPhone y computadora estén en la misma red WiFi
- Intenta presionar "t" en la terminal para cambiar a conexión por túnel

### Error de Firebase
- Verifica que todas las variables en `.env` estén correctas
- Asegúrate de haber habilitado Phone Authentication en Firebase
- Reinicia el servidor después de modificar `.env`

### La app no carga
```bash
# Limpiar todo y empezar de nuevo
rm -rf node_modules
npm install
npm start --clear
```

## 📱 Próximos pasos

1. **Agregar OpenAI Key** para obtener recomendaciones personalizadas
2. **Configurar Stripe** para habilitar suscripciones premium
3. **Personalizar la app** modificando colores y estilos en los archivos de [src/screens/](src/screens/)

## 📚 Más información

- [README completo](README.md) - Documentación detallada
- [Guía de Configuración de Firebase](CONFIGURACION_FIREBASE.md) - Paso a paso con Firebase
- [Detalles de la Migración](MIGRACION.md) - Qué cambió de web a mobile
- [Documentación de Expo](https://docs.expo.dev/)
- [Firebase Phone Auth iOS](https://firebase.google.com/docs/auth/ios/phone-auth?hl=es-419)

---

¿Problemas? Revisa el README completo o los logs en la terminal para más detalles.
