# 📄 GoogleService-Info.plist

## ¿Qué es este archivo?

El archivo `GoogleService-Info.plist` es la **configuración oficial de Firebase para apps iOS**. Lo descargaste de Firebase Console al registrar tu app iOS.

## 🔑 Contenido

Este archivo contiene las credenciales de tu proyecto Firebase:

```
Project ID: whatchat2-e3786
API Key: AIzaSyB4nPeeGXhAhDZvyRsrLk8yDZ2r5mDOHuE
Bundle ID: com.mealbuddy.app
App ID: 1:54991485629:ios:b8a7d98d460d0bbb5295d4
```

## 📱 ¿Cuándo se usa?

### Con Expo Go (Desarrollo) - **LO QUE ESTÁS USANDO AHORA**

- ❌ NO se usa directamente el `GoogleService-Info.plist`
- ✅ Las credenciales están en el archivo `.env`
- ✅ Ya extraje automáticamente las credenciales y creé tu `.env`

### Con Builds Nativos (Producción)

Cuando hagas builds nativos con `eas build`, necesitarás:

1. **Para iOS**: `GoogleService-Info.plist`
2. **Para Android**: `google-services.json`

Estos archivos se configuran en `app.json` con el plugin de Firebase.

## ✅ Estado Actual

- ✅ Archivo `GoogleService-Info.plist` detectado
- ✅ Credenciales extraídas al archivo `.env`
- ✅ Archivo protegido en `.gitignore` (no se subirá a Git)
- ✅ Listo para usar con Expo Go

## 🚀 Próximos Pasos

**Puedes ejecutar la app ahora:**

```bash
npm start
```

Luego escanea el QR con Expo Go en tu iPhone.

## 🔒 Seguridad

⚠️ **IMPORTANTE**: Este archivo contiene credenciales sensibles.

- ✅ Ya está agregado al `.gitignore`
- ❌ NO lo compartas públicamente
- ❌ NO lo subas a GitHub
- ✅ Manténlo solo en tu computadora local

## 🔄 ¿Necesitas actualizarlo?

Si actualizas o cambias tu proyecto de Firebase:

1. Descarga el nuevo `GoogleService-Info.plist` de Firebase Console
2. Reemplaza el archivo existente
3. Extrae las nuevas credenciales:
   ```bash
   # Verifica los valores en el archivo
   cat GoogleService-Info.plist
   ```
4. Actualiza el `.env` con los nuevos valores

## 📚 Referencia Rápida

| Clave en .plist | Variable en .env |
|----------------|------------------|
| `API_KEY` | `EXPO_PUBLIC_FIREBASE_API_KEY` |
| `PROJECT_ID` | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` |
| `STORAGE_BUCKET` | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `GCM_SENDER_ID` | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `GOOGLE_APP_ID` | `EXPO_PUBLIC_FIREBASE_APP_ID` |

Auth Domain se construye como: `{PROJECT_ID}.firebaseapp.com`

## 🆘 Problemas

### "Firebase project not found"
- Verifica que el archivo `.env` tenga los valores correctos
- Reinicia el servidor: `npm start --clear`

### "Auth domain mismatch"
- Asegúrate de que el `PROJECT_ID` en `.env` sea correcto
- El Auth Domain debe ser: `{PROJECT_ID}.firebaseapp.com`

### "Bundle ID mismatch"
- Verifica que el Bundle ID en `app.json` coincida con Firebase Console
- Debe ser: `com.mealbuddy.app`

---

**Tu configuración actual está lista para usar con Expo Go.** 🎉

No necesitas hacer nada más con este archivo por ahora.
