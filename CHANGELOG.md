# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [2.0.0] - 2025-10-29

### 🎉 Agregado

#### Navegación
- **Navegación con tabs inferiores estilo WhatsApp iOS**
  - Tab de Inicio (Dashboard)
  - Tab de Favoritos
  - Tab de Lista de Compras
  - Tab de Preferencias
  - Los tabs ahora son la navegación principal de la app
  - Los botones de header se movieron a sus respectivas secciones

#### Gestión de Imágenes
- **Sistema completo de manejo de imágenes**
  - Captura de fotos con cámara
  - Selección de imágenes desde galería
  - Optimización automática de imágenes para iPhone de alta resolución (48MP+)
  - Redimensionamiento a 800px de ancho máximo
  - Compresión inteligente (quality: 0.2, compress: 0.5)
  - Conversión a base64 para almacenamiento en SQLite
  - Tamaño final: ~100-300KB por imagen
  - Sin dependencia de Firebase Storage

#### Funcionalidades de Usuario
- **Sistema de Favoritos**
  - Guardar recetas favoritas desde recomendaciones
  - Ver lista completa de recetas guardadas
  - Compartir recetas favoritas
  - Agregar ingredientes de favoritos a lista de compras
  - Eliminar recetas de favoritos

- **Lista de Compras**
  - Agregar items manualmente
  - Importar ingredientes desde recetas
  - Marcar items como comprados/pendientes
  - Categorización automática de items
  - Compartir lista completa
  - Limpiar items comprados
  - Limpiar toda la lista

- **Preferencias de Usuario**
  - Configurar restricciones dietéticas (vegetariano, vegano, sin gluten, etc.)
  - Gestionar alergias alimentarias
  - Seleccionar cocinas favoritas (italiana, mexicana, asiática, etc.)
  - Indicar alimentos que no gustan
  - Configuración de notificaciones por comida (desayuno, almuerzo, cena)
  - Selector de tema (claro, oscuro, automático)

#### Backend
- **Arquitectura de base de datos SQLite**
  - Tabla `users` para usuarios
  - Tabla `meals` con soporte para imágenes base64
  - Tabla `meal_recommendations` para historial de recomendaciones
  - Tabla `user_preferences` para preferencias alimentarias
  - Tabla `favorite_recipes` para recetas favoritas
  - Tabla `shopping_list_items` para lista de compras
  - Tabla `otps` para códigos de verificación

- **APIs RESTful**
  - `/api/auth` - Autenticación y verificación OTP
  - `/api/meals` - CRUD de comidas con imágenes
  - `/api/recommendations` - Recomendaciones con IA
  - `/api/favorites` - Gestión de favoritos
  - `/api/shopping-list` - Lista de compras
  - Límite de payload aumentado a 10MB para imágenes

### 🔄 Cambiado

#### Navegación
- Dashboard ya no muestra modales para Preferencias, Favoritos y Lista de Compras
- Estas secciones ahora son tabs independientes con navegación persistente
- Header del Dashboard reorganizado: título arriba, botón de salir a la derecha
- Los botones de acceso rápido se eliminaron del header

#### Sistema de Autenticación
- Cambio de solo teléfono a **email o teléfono**
- OTP enviado por email en lugar de SMS
- JWT para gestión de sesiones
- Backend Node.js + Express en lugar de Firebase Functions

#### Recomendaciones de IA
- Cambio de OpenAI GPT-4 a **Google Gemini AI**
- Recomendaciones más personalizadas basadas en preferencias
- Incluye tiempo de preparación y nivel de dificultad
- Opción de agregar ingredientes directamente a lista de compras

#### Almacenamiento
- Migración de Firestore a **SQLite local**
- Imágenes almacenadas en base64 dentro de SQLite
- Mejor performance y sin dependencias de red para datos

#### UI/UX
- Temas mejorados con soporte para modo oscuro
- Animaciones suaves en cards de comidas
- Búsqueda y filtros en historial de comidas
- Estadísticas visuales por categoría de comida
- Mensajes de carga personalizados con emojis

### 🐛 Corregido

- **Error "Payload Too Large"** al subir imágenes
  - Backend configurado para aceptar hasta 10MB
  - Imágenes optimizadas a ~100-300KB antes de subir

- **Error con expo-file-system API deprecada**
  - Migración a `expo-file-system/legacy`
  - Compatibilidad con Expo SDK 54

- **Botón de lista de compras inaccesible** en header
  - Reorganización del header en dos filas
  - Botones movidos a tabs para mejor accesibilidad

- **Imágenes de iPhone de alta resolución muy grandes**
  - Redimensionamiento automático a 800px
  - Compresión multicapa (quality + resize + compress)
  - Optimización específica para cámaras de 48MP+

### 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Validación de OTP en backend
- Reglas de seguridad para acceso a datos de usuario
- Variables de entorno para credenciales sensibles

### 📦 Dependencias

#### Agregadas
- `@react-navigation/bottom-tabs` - Navegación con tabs
- `expo-file-system` - Manejo de archivos
- `expo-image-manipulator` - Redimensionamiento de imágenes
- `expo-image-picker` - Captura y selección de fotos
- `expo-notifications` - Sistema de notificaciones

#### Backend
- `express` - Framework web
- `better-sqlite3` - Base de datos SQLite
- `bcryptjs` - Encriptación de passwords
- `jsonwebtoken` - Tokens JWT
- `nodemailer` - Envío de emails
- `@google/generative-ai` - Google Gemini AI
- `cors` - CORS middleware
- `dotenv` - Variables de entorno

### 📝 Notas de Migración

Si vienes de una versión anterior:

1. **Backend Nuevo**: Ahora necesitas iniciar el servidor backend
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Variables de Entorno**: Actualiza tu `.env` con las nuevas variables
   - `EXPO_PUBLIC_API_URL` para la URL del backend
   - `GEMINI_API_KEY` en lugar de OpenAI

3. **Navegación**: La estructura de navegación cambió completamente a tabs

4. **Datos**: Los datos de Firestore deben migrarse a SQLite si es necesario

---

## [1.0.0] - 2025-10-24

### Agregado
- Versión inicial con Firestore
- Autenticación con teléfono
- Dashboard básico
- Sistema de recomendaciones con OpenAI
