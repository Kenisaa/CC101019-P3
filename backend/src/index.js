require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const mealsRoutes = require('./routes/meals');
const recommendationsRoutes = require('./routes/recommendations');

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
        delete: 'DELETE /api/meals/:mealId',
        getPreferences: 'GET /api/meals/preferences/:userId',
        savePreferences: 'POST /api/meals/preferences'
      },
      recommendations: {
        generate: 'POST /api/recommendations/generate',
        history: 'GET /api/recommendations/history/:userId'
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
  console.log(`     DELETE /api/meals/:mealId - Eliminar comida`);
  console.log(`     GET /api/meals/preferences/:userId - Obtener preferencias`);
  console.log(`     POST /api/meals/preferences - Guardar preferencias`);
  console.log(`   Recommendations:`);
  console.log(`     POST /api/recommendations/generate - Generar recomendación`);
  console.log(`     GET /api/recommendations/history/:userId - Historial de recomendaciones\n`);
});

module.exports = app;
