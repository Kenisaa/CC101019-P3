const express = require('express');
const router = express.Router();
const db = require('../models/sqlite-database');

// Helper function to check if user has premium access
function checkPremiumAccess(userId) {
  const user = db.getUserById(userId);
  if (!user) {
    return { allowed: false, message: 'Usuario no encontrado' };
  }

  const tier = user.subscription_tier || 'free';
  if (tier !== 'premium') {
    return {
      allowed: false,
      message: 'Esta función requiere suscripción Premium',
      requiresUpgrade: true
    };
  }

  return { allowed: true };
}

// Obtener estadísticas del usuario (DEBE IR ANTES de /:userId/:weekStartDate)
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = db.getUserStats(userId);

    return res.json(result);
  } catch (error) {
    console.error('Error in /stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Guardar/actualizar plan de comida
router.post('/save', async (req, res) => {
  try {
    const { userId, weekStartDate, dayOfWeek, mealType, mealData } = req.body;

    if (!userId || !weekStartDate || dayOfWeek === undefined || !mealType || !mealData) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos'
      });
    }

    // Check premium access
    const accessCheck = checkPremiumAccess(userId);
    if (!accessCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
        requiresUpgrade: accessCheck.requiresUpgrade
      });
    }

    const result = db.saveMealPlan(userId, weekStartDate, dayOfWeek, mealType, mealData);

    return res.json(result);
  } catch (error) {
    console.error('Error in /save:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obtener plan de la semana
router.get('/:userId/:weekStartDate', async (req, res) => {
  try {
    const { userId, weekStartDate } = req.params;

    // Check premium access
    const accessCheck = checkPremiumAccess(userId);
    if (!accessCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
        requiresUpgrade: accessCheck.requiresUpgrade
      });
    }

    const result = db.getWeekPlan(userId, weekStartDate);

    return res.json(result);
  } catch (error) {
    console.error('Error in /get week plan:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Eliminar plan específico
router.delete('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId es requerido'
      });
    }

    // Check premium access
    const accessCheck = checkPremiumAccess(userId);
    if (!accessCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
        requiresUpgrade: accessCheck.requiresUpgrade
      });
    }

    const result = db.deleteMealPlan(planId, userId);

    return res.json(result);
  } catch (error) {
    console.error('Error in /delete plan:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Limpiar toda la semana
router.delete('/week/:userId/:weekStartDate', async (req, res) => {
  try {
    const { userId, weekStartDate } = req.params;

    // Check premium access
    const accessCheck = checkPremiumAccess(userId);
    if (!accessCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
        requiresUpgrade: accessCheck.requiresUpgrade
      });
    }

    const result = db.clearWeekPlan(userId, weekStartDate);

    return res.json(result);
  } catch (error) {
    console.error('Error in /clear week:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
