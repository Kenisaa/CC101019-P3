require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const mealsRoutes = require('./routes/meals');
const recommendationsRoutes = require('./routes/recommendations');
const favoritesRoutes = require('./routes/favorites');
const shoppingListRoutes = require('./routes/shopping-list');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/shopping-list', shoppingListRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Meal Buddy API funcionando',
    version: '2.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'POST /api/auth/verify',
        resend: 'POST /api/auth/resend'
      },
      meals: {
        add: 'POST /api/meals/add',
        history: 'GET /api/meals/history/:userId',
        recent: 'GET /api/meals/recent/:userId',
        update: 'PUT /api/meals/:mealId',
        delete: 'DELETE /api/meals/:mealId',
        getPreferences: 'GET /api/meals/preferences/:userId',
        savePreferences: 'POST /api/meals/preferences'
      },
      recommendations: {
        generate: 'POST /api/recommendations/generate',
        history: 'GET /api/recommendations/history/:userId'
      },
      favorites: {
        add: 'POST /api/favorites/add',
        list: 'GET /api/favorites/:userId',
        remove: 'DELETE /api/favorites/:favoriteId',
        check: 'GET /api/favorites/check/:userId/:recipeName'
      },
      shoppingList: {
        add: 'POST /api/shopping-list/add',
        addFromRecipe: 'POST /api/shopping-list/add-from-recipe',
        list: 'GET /api/shopping-list/:userId',
        toggle: 'PUT /api/shopping-list/:itemId/toggle',
        update: 'PUT /api/shopping-list/:itemId',
        delete: 'DELETE /api/shopping-list/:itemId',
        clearChecked: 'DELETE /api/shopping-list/clear-checked/:userId',
        clearAll: 'DELETE /api/shopping-list/clear-all/:userId'
      }
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📧 Email configurado: ${process.env.EMAIL_USER || 'NO CONFIGURADO'}`);
  console.log(`🤖 Gemini API configurado: ${process.env.GEMINI_API_KEY ? 'SÍ' : 'NO'}`);
  console.log(`\n📚 Endpoints disponibles:`);
  console.log(`   Auth:`);
  console.log(`     POST /api/auth/register - Registrar usuario`);
  console.log(`     POST /api/auth/login - Iniciar sesión`);
  console.log(`     POST /api/auth/verify - Verificar código OTP`);
  console.log(`     POST /api/auth/resend - Reenviar código OTP`);
  console.log(`   Meals:`);
  console.log(`     POST /api/meals/add - Agregar comida`);
  console.log(`     GET /api/meals/history/:userId - Historial de comidas`);
  console.log(`     GET /api/meals/recent/:userId - Comidas recientes`);
  console.log(`     PUT /api/meals/:mealId - Actualizar comida`);
  console.log(`     DELETE /api/meals/:mealId - Eliminar comida`);
  console.log(`     GET /api/meals/preferences/:userId - Obtener preferencias`);
  console.log(`     POST /api/meals/preferences - Guardar preferencias`);
  console.log(`   Recommendations:`);
  console.log(`     POST /api/recommendations/generate - Generar recomendación`);
  console.log(`     GET /api/recommendations/history/:userId - Historial de recomendaciones`);
  console.log(`   Favorites:`);
  console.log(`     POST /api/favorites/add - Agregar receta a favoritos`);
  console.log(`     GET /api/favorites/:userId - Listar recetas favoritas`);
  console.log(`     DELETE /api/favorites/:favoriteId - Eliminar favorito`);
  console.log(`     GET /api/favorites/check/:userId/:recipeName - Verificar si es favorito`);
  console.log(`   Shopping List:`);
  console.log(`     POST /api/shopping-list/add - Agregar item`);
  console.log(`     POST /api/shopping-list/add-from-recipe - Agregar ingredientes de receta`);
  console.log(`     GET /api/shopping-list/:userId - Obtener lista de compras`);
  console.log(`     PUT /api/shopping-list/:itemId/toggle - Toggle estado comprado`);
  console.log(`     PUT /api/shopping-list/:itemId - Actualizar item`);
  console.log(`     DELETE /api/shopping-list/:itemId - Eliminar item`);
  console.log(`     DELETE /api/shopping-list/clear-checked/:userId - Limpiar items comprados`);
  console.log(`     DELETE /api/shopping-list/clear-all/:userId - Limpiar toda la lista\n`);
});

module.exports = app;
