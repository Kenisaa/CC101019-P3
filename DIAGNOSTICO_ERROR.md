# 🔍 Diagnóstico del Error "Network request failed"

## Causa del Problema

El error **"Network request failed"** ocurrió porque:

### 1. **IP Hardcodeada Incorrecta**

- El código tenía la IP `192.168.1.14` hardcodeada en 2 archivos:
  - `src/screens/AuthScreen.tsx`
  - `src/services/meals.ts`

### 2. **Tu IP Actual es Diferente**

- La IP actual de tu Mac es: `10.203.12.126`
- Tu teléfono/emulador intentaba conectarse a `http://192.168.1.14:3000`
- Pero el servidor backend está corriendo en `http://10.203.12.126:3000`
- **Resultado:** La conexión fallaba porque no había nada en la IP antigua

### 3. **Por Qué Cambia la IP**

Las IPs locales pueden cambiar por:

- Reconexión al WiFi
- Cambio de red
- Configuración DHCP del router
- Reinicio de la computadora

## ✅ Solución Implementada

1. **Agregué variable de entorno** en `.env`:

   ```env
   EXPO_PUBLIC_API_URL=http://10.203.12.126:3000/api
   ```

2. **Actualicé los archivos** para usar la variable:

   ```typescript
   const API_URL =
     process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
   ```

3. **Beneficios:**
   - ✅ Solo cambias la IP en un lugar (archivo `.env`)
   - ✅ Más fácil de mantener
   - ✅ Puedes tener diferentes IPs para desarrollo/producción

## 🚀 Próximos Pasos

1. **Reiniciar el servidor de Expo** para que cargue la nueva variable de entorno
2. **Asegurarte de que el backend esté corriendo** en puerto 3000
3. **Probar nuevamente** el login

## 📝 Nota Importante

Cada vez que cambies de red WiFi, es posible que necesites actualizar la IP en `.env` ejecutando:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

Y luego actualizar `EXPO_PUBLIC_API_URL` con la nueva IP.
