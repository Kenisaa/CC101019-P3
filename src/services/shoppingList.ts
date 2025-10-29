import axios from 'axios';
import { Recipe } from './meals';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ShoppingListItem {
  id: string;
  user_id: string;
  name: string;
  quantity?: string;
  category?: string;
  checked: boolean;
  source_type?: 'manual' | 'recipe' | 'meal_plan';
  source_id?: string;
  created_at: string;
}

export interface AddItemInput {
  name: string;
  quantity?: string;
  category?: string;
  sourceType?: 'manual' | 'recipe' | 'meal_plan';
  sourceId?: string;
}

// Agregar item individual
export async function addShoppingListItem(userId: string, itemData: AddItemInput) {
  try {
    const response = await axios.post(`${API_URL}/shopping-list/add`, {
      userId,
      ...itemData
    });
    return response.data;
  } catch (error: any) {
    console.error('Error adding shopping list item:', error);
    throw error;
  }
}

// Agregar ingredientes desde una receta
export async function addItemsFromRecipe(userId: string, recipeData: Recipe, sourceId?: string) {
  try {
    const response = await axios.post(`${API_URL}/shopping-list/add-from-recipe`, {
      userId,
      recipeData,
      sourceId
    });
    return response.data;
  } catch (error: any) {
    console.error('Error adding items from recipe:', error);
    throw error;
  }
}

// Obtener lista de compras
export async function getShoppingList(userId: string, includeChecked = true) {
  try {
    const response = await axios.get(
      `${API_URL}/shopping-list/${userId}?includeChecked=${includeChecked}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error getting shopping list:', error);
    throw error;
  }
}

// Toggle estado de item (marcar/desmarcar como comprado)
export async function toggleShoppingListItem(itemId: string, userId: string) {
  try {
    const response = await axios.put(`${API_URL}/shopping-list/${itemId}/toggle`, {
      userId
    });
    return response.data;
  } catch (error: any) {
    console.error('Error toggling shopping list item:', error);
    throw error;
  }
}

// Actualizar item
export async function updateShoppingListItem(
  itemId: string,
  userId: string,
  updates: Partial<Pick<ShoppingListItem, 'name' | 'quantity' | 'category' | 'checked'>>
) {
  try {
    const response = await axios.put(`${API_URL}/shopping-list/${itemId}`, {
      userId,
      ...updates
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating shopping list item:', error);
    throw error;
  }
}

// Eliminar item individual
export async function deleteShoppingListItem(itemId: string, userId: string) {
  try {
    const response = await axios.delete(`${API_URL}/shopping-list/${itemId}`, {
      data: { userId }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error deleting shopping list item:', error);
    throw error;
  }
}

// Limpiar items marcados como comprados
export async function clearCheckedItems(userId: string) {
  try {
    const response = await axios.delete(`${API_URL}/shopping-list/clear-checked/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error clearing checked items:', error);
    throw error;
  }
}

// Limpiar toda la lista
export async function clearAllShoppingList(userId: string) {
  try {
    const response = await axios.delete(`${API_URL}/shopping-list/clear-all/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error clearing shopping list:', error);
    throw error;
  }
}
