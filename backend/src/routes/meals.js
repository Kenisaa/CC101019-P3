const express = require('express');
const router = express.Router();
const db = require('../models/sqlite-database');

// Agregar una comida
router.post('/add', async (req, res) => {
  try {
    const { userId, name, category, date, imageUrl, notes } = req.body;

    if (!userId || !name || !category) {
      return res.status(400).json({
        success: false,
        message: 'userId, name y category son requeridos'
      });
    }

    const result = db.addMeal(userId, {
      name,
      category,
      date: date || new Date().toISOString(),
      imageUrl,
      notes
    });

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(500).json({
        success: false,
        message: 'Error al agregar comida'
      });
    }
  } catch (error) {
    console.error('Error in /add:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obtener historial de comidas
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    const result = db.getMealHistory(userId, limit ? parseInt(limit) : 20);

    return res.json(result);
  } catch (error) {
    console.error('Error in /history:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obtener comidas recientes
router.get('/recent/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days } = req.query;

    const result = db.getRecentMeals(userId, days ? parseInt(days) : 7);

    return res.json(result);
  } catch (error) {
    console.error('Error in /recent:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Eliminar una comida
router.delete('/:mealId', async (req, res) => {
  try {
    const { mealId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId es requerido'
      });
    }

    const result = db.deleteMeal(mealId, userId);

    if (result.success) {
      return res.json(result);
    } else {
      return res.status(404).json({
        success: false,
        message: 'Comida no encontrada'
      });
    }
  } catch (error) {
    console.error('Error in /delete:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obtener preferencias de usuario
router.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = db.getUserPreferences(userId);
    return res.json(result);
  } catch (error) {
    console.error('Error in /preferences:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Guardar preferencias de usuario
router.post('/preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId es requerido'
      });
    }

    const result = db.saveUserPreferences(userId, preferences);
    return res.json(result);
  } catch (error) {
    console.error('Error in /preferences:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
