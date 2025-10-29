const express = require('express');
const router = express.Router();
const db = require('../models/sqlite-database');

// Agregar item individual a la lista
router.post('/add', async (req, res) => {
  try {
    const { userId, name, quantity, category, sourceType, sourceId } = req.body;

    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere userId y nombre del item'
      });
    }

    const result = await db.addShoppingListItem(userId, {
      name,
      quantity,
      category,
      sourceType,
      sourceId
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Item agregado a la lista',
        itemId: result.id
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Error al agregar item'
      });
    }
  } catch (error) {
    console.error('Error en /shopping-list/add:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Agregar items desde una receta
router.post('/add-from-recipe', async (req, res) => {
  try {
    const { userId, recipeData, sourceId } = req.body;

    if (!userId || !recipeData) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere userId y recipeData'
      });
    }

    const result = await db.addItemsFromRecipe(userId, recipeData, sourceId);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: `${result.addedCount} ingredientes agregados a la lista`,
        addedCount: result.addedCount
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Error al agregar ingredientes'
      });
    }
  } catch (error) {
    console.error('Error en /shopping-list/add-from-recipe:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener lista de compras del usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const includeChecked = req.query.includeChecked !== 'false';

    const result = await db.getShoppingList(userId, includeChecked);

    if (result.success) {
      res.status(200).json({
        success: true,
        items: result.items
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error al obtener lista de compras'
      });
    }
  } catch (error) {
    console.error('Error en /shopping-list/:userId:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Toggle estado checked de un item
router.put('/:itemId/toggle', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere userId'
      });
    }

    const result = await db.toggleShoppingListItem(itemId, userId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Estado actualizado'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Item no encontrado'
      });
    }
  } catch (error) {
    console.error('Error en /shopping-list/:itemId/toggle:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Actualizar item
router.put('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId, name, quantity, category, checked } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere userId'
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (quantity !== undefined) updates.quantity = quantity;
    if (category !== undefined) updates.category = category;
    if (checked !== undefined) updates.checked = checked;

    const result = await db.updateShoppingListItem(itemId, userId, updates);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Item actualizado'
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error || 'Item no encontrado'
      });
    }
  } catch (error) {
    console.error('Error en /shopping-list/:itemId:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Eliminar item individual
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere userId'
      });
    }

    const result = await db.deleteShoppingListItem(itemId, userId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Item eliminado'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Item no encontrado'
      });
    }
  } catch (error) {
    console.error('Error en /shopping-list/:itemId:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Limpiar items marcados como comprados
router.delete('/clear-checked/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.clearCheckedItems(userId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} items eliminados`,
        deletedCount: result.deletedCount
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error al limpiar items'
      });
    }
  } catch (error) {
    console.error('Error en /shopping-list/clear-checked:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Limpiar toda la lista
router.delete('/clear-all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.clearAllShoppingList(userId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} items eliminados`,
        deletedCount: result.deletedCount
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error al limpiar lista'
      });
    }
  } catch (error) {
    console.error('Error en /shopping-list/clear-all:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
