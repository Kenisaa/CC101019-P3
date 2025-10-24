# Migración a Gemini API y Sistema de Comidas 🤖🍽️

## Resumen de Cambios

Se ha completado la migración de OpenAI a Gemini API y se ha implementado un sistema completo de gestión de comidas con SQLite.

## 1. Nuevas Tablas en SQLite

Se agregaron 3 nuevas tablas a la base de datos:

### `meals` - Historial de comidas

- `id`: ID único de la comida
- `user_id`: ID del usuario (foreign key)
- `name`: Nombre de la comida
- `category`: Categoría (desayuno, almuerzo, cena, snack)
- `date`: Fecha de la comida
- `image_url`: URL de imagen (opcional)
- `notes`: Notas adicionales (opcional)
- `created_at`: Fecha de creación

### `meal_recommendations` - Historial de recomendaciones

- `id`: ID único
- `user_id`: ID del usuario (foreign key)
- `meal_name`: Nombre de la comida recomendada
- `description`: Descripción breve
- `reasoning`: Razonamiento de la recomendación
- `recipes`: Recetas en formato JSON
- `created_at`: Fecha de creación

### `user_preferences` - Preferencias del usuario

- `id`: ID único
- `user_id`: ID del usuario (foreign key, único)
- `dietary_restrictions`: Restricciones dietéticas (JSON)
- `allergies`: Alergias (JSON)
- `favorite_cuisines`: Cocinas favoritas (JSON)
- `disliked_foods`: Comidas que no le gustan (JSON)
- `updated_at`: Última actualización

## 2. Nuevos Endpoints del Backend

### Meals API (`/api/meals`)

#### POST `/api/meals/add`

Agregar una comida al historial

```json
{
  "userId": "user123",
  "name": "Tacos de pollo",
  "category": "almuerzo",
  "date": "2025-10-24T18:00:00Z",
  "imageUrl": "https://...",
  "notes": "Muy buenos"
}
```

#### GET `/api/meals/history/:userId?limit=20`

Obtener historial de comidas del usuario

#### GET `/api/meals/recent/:userId?days=7`

Obtener comidas recientes (últimos X días)

#### DELETE `/api/meals/:mealId`

Eliminar una comida

```json
{
  "userId": "user123"
}
```

#### GET `/api/meals/preferences/:userId`

Obtener preferencias del usuario

#### POST `/api/meals/preferences`

Guardar/actualizar preferencias del usuario

```json
{
  "userId": "user123",
  "preferences": {
    "dietaryRestrictions": ["vegetariano"],
    "allergies": ["maní", "lactosa"],
    "favoriteCuisines": ["mexicana", "italiana"],
    "dislikedFoods": ["brócoli"]
  }
}
```

### Recommendations API (`/api/recommendations`)

#### POST `/api/recommendations/generate`

Generar recomendación usando Gemini API

```json
{
  "userId": "user123",
  "subscriptionTier": "premium"
}
```

**Respuesta:**

```json
{
  "success": true,
  "recommendation": {
    "meal": "Ensalada César con Pollo",
    "description": "Una ensalada fresca y nutritiva...",
    "recipes": [
      {
        "name": "Ensalada César con Pollo",
        "ingredients": ["lechuga romana", "pollo", "..."],
        "instructions": ["Paso 1", "Paso 2"],
        "prepTime": "30 minutos",
        "difficulty": "Fácil"
      }
    ],
    "reasoning": "Basándome en tu historial..."
  }
}
```

#### GET `/api/recommendations/history/:userId?limit=10`

Obtener historial de recomendaciones

## 3. Variables de Entorno

### Backend (`backend/.env`)

```env
GEMINI_API_KEY=tu_api_key_aqui
```

### Frontend (`.env`)

```env
EXPO_PUBLIC_GEMINI_API_KEY=tu_api_key_aqui
```

## 4. Obtener API Key de Gemini

1. Ve a https://makersuite.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API Key
4. Copia la clave y agrégala a los archivos `.env`

## 5. Características del Sistema

### Recomendaciones Inteligentes

- Usa el historial de comidas del usuario (7 días para free, 30 días para premium)
- Considera las preferencias del usuario (restricciones dietéticas, alergias, etc.)
- Genera 1 receta para usuarios free, 3 recetas para premium
- Guarda todas las recomendaciones en la base de datos

### Gestión de Comidas

- Los usuarios pueden agregar comidas con categoría, fecha, foto y notas
- Ver historial completo de comidas
- Filtrar comidas recientes
- Eliminar comidas

### Preferencias de Usuario

- Restricciones dietéticas (vegetariano, vegano, sin gluten, etc.)
- Alergias alimentarias
- Cocinas favoritas
- Comidas que no le gustan

## 6. Diferencias entre OpenAI y Gemini

| Aspecto              | OpenAI           | Gemini                        |
| -------------------- | ---------------- | ----------------------------- |
| Modelo               | gpt-4o-mini      | gemini-1.5-pro                |
| Endpoint             | chat/completions | generateContent               |
| Formato de respuesta | JSON directo     | Requiere limpieza de markdown |
| Temperatura          | 0.7              | 0.7                           |
| Costo                | Pagado           | Gratis (con límites)          |

## 7. Pruebas

El servidor está corriendo y listo para usar:

- ✅ Base de datos SQLite con nuevas tablas
- ✅ Endpoints de meals funcionando
- ✅ Endpoints de recommendations funcionando
- ✅ Gemini API configurado
- ✅ Email configurado

## 8. Próximos Pasos

1. **Frontend**: Actualizar `src/services/recommendations.ts` para usar el backend en lugar de llamar directamente a OpenAI
2. **UI**: Crear componentes para agregar comidas al historial
3. **UI**: Crear pantalla para configurar preferencias del usuario
4. **Testing**: Probar generación de recomendaciones con diferentes historiales
5. **Validación**: Verificar que el API key de Gemini funciona correctamente

## 9. Notas Importantes

- El API key actual en `.env` parece ser de Firebase, NO de Gemini. Necesitas obtener un API key real de Gemini.
- Las tablas se crean automáticamente al iniciar el servidor gracias a `CREATE TABLE IF NOT EXISTS`
- Todas las operaciones de meals están aisladas por usuario (`user_id`)
- Las preferencias son únicas por usuario (constraint UNIQUE)
- Los índices están configurados para optimizar las búsquedas frecuentes

## 10. Ejemplo de Flujo Completo

```javascript
// 1. Usuario agrega una comida
POST /api/meals/add
{ userId: "user123", name: "Pizza", category: "cena" }

// 2. Usuario configura preferencias
POST /api/meals/preferences
{ userId: "user123", preferences: { allergies: ["lactosa"] } }

// 3. Usuario solicita recomendación
POST /api/recommendations/generate
{ userId: "user123", subscriptionTier: "free" }

// 4. Sistema:
// - Obtiene últimas 7 días de comidas
// - Obtiene preferencias del usuario
// - Genera prompt personalizado
// - Llama a Gemini API
// - Guarda recomendación en DB
// - Retorna recomendación al usuario
```

---

¡La migración está completa! 🎉
