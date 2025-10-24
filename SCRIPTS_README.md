# 🚀 Scripts de Desarrollo - Meal Buddy

## 📋 Scripts Disponibles

### 🎯 **Script Principal de Desarrollo**

```bash
npm run dev
```

**¿Qué hace?**

- ✅ Inicia el backend automáticamente
- ✅ Inicia Expo automáticamente
- ✅ Maneja ambos procesos con colores diferentes
- ✅ Limpia procesos al salir (Ctrl+C)

### 🧹 **Script de Limpieza**

```bash
npm run clean
```

**¿Qué hace?**

- ✅ Detiene todos los procesos de backend
- ✅ Detiene todos los procesos de Expo
- ✅ Libera los puertos 3000, 8081, 8082
- ✅ Prepara el sistema para un inicio limpio

### 🔧 **Scripts Individuales**

```bash
# Solo backend
npm run backend

# Solo Expo
npm run expo

# Versión simple (con concurrently)
npm run dev:simple
```

## 🎯 **Flujo de Trabajo Recomendado**

### 1. **Primera vez o después de errores:**

```bash
npm run clean
npm run dev
```

### 2. **Desarrollo normal:**

```bash
npm run dev
```

### 3. **Si hay problemas de puertos:**

```bash
npm run clean
# Esperar 2-3 segundos
npm run dev
```

## 📱 **URLs Importantes**

- **Backend API:** `http://192.168.1.14:3000`
- **Expo DevTools:** `http://localhost:8081` (en navegador)
- **QR Code:** Aparece en la terminal de Expo

## 🔧 **Configuración de Email**

Para que los emails funcionen, edita `backend/.env`:

```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-de-16-caracteres
```

**Pasos para Gmail:**

1. Google Account → Seguridad → Verificación en 2 pasos
2. Contraseñas de aplicaciones → Generar nueva
3. Copiar la contraseña de 16 caracteres
4. Pegar en `EMAIL_PASSWORD`

## 🐛 **Solución de Problemas**

### **Error: "address already in use"**

```bash
npm run clean
npm run dev
```

### **Error: "Network request failed"**

- Verifica que la IP en `src/screens/AuthScreen.tsx` sea correcta
- Ejecuta: `ifconfig | grep "inet " | grep -v 127.0.0.1`

### **Backend no inicia**

```bash
cd backend
npm install
npm start
```

### **Expo no inicia**

```bash
npx expo start --clear
```

## 🎉 **¡Listo para Desarrollar!**

Con `npm run dev` tienes todo funcionando:

- ✅ Backend en puerto 3000
- ✅ Expo en puerto 8081/8082
- ✅ Códigos OTP en consola (si no hay email configurado)
- ✅ Aplicación lista para probar en el teléfono

