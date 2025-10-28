const express = require('express');
const router = express.Router();
const db = require('../models/sqlite-database');

// Agregar receta a favoritos
router.post('/add', async (req, res) => {
  try {
    const { userId, recipeData } = req.body;

    if (!userId || !recipeData || !recipeData.name) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos. Se requiere userId y recipeData con nombre'
      });
    }

    const result = await db.addFavoriteRecipe(userId, recipeData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Receta agregada a favoritos',
        favoriteId: result.id
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Error al agregar a favoritos'
      });
    }
  } catch (error) {
    console.error('Error en /favorites/add:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener favoritos del usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const result = await db.getFavoriteRecipes(userId, limit);

    if (result.success) {
      res.status(200).json({
        success: true,
        favorites: result.favorites
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error al obtener favoritos'
      });
    }
  } catch (error) {
    console.error('Error en /favorites/:userId:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Eliminar favorito
router.delete('/:favoriteId', async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere userId'
      });
    }

    const result = await db.removeFavoriteRecipe(favoriteId, userId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Receta eliminada de favoritos'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Favorito no encontrado o sin permisos'
      });
    }
  } catch (error) {
    console.error('Error en /favorites/:favoriteId:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Verificar si una receta es favorita
router.get('/check/:userId/:recipeName', async (req, res) => {
  try {
    const { userId, recipeName } = req.params;
    const decodedRecipeName = decodeURIComponent(recipeName);

    const result = await db.isFavoriteRecipe(userId, decodedRecipeName);

    res.status(200).json({
      success: true,
      isFavorite: result.isFavorite,
      favoriteId: result.favoriteId
    });
  } catch (error) {
    console.error('Error en /favorites/check:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
