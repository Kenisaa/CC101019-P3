import axios from 'axios';
import { Recipe } from './meals';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface FavoriteRecipe {
  id: string;
  userId: string;
  recommendationId?: string;
  recipeName: string;
  recipeData: Recipe;
  createdAt: string;
}

export interface AddFavoriteInput {
  userId: string;
  recipeData: Recipe & {
    recommendationId?: string;
  };
}

// Agregar receta a favoritos
export async function addFavoriteRecipe(userId: string, recipeData: Recipe, recommendationId?: string) {
  try {
    const response = await axios.post(`${API_URL}/favorites/add`, {
      userId,
      recipeData: {
        ...recipeData,
        recommendationId
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error adding favorite recipe:', error);
    throw error;
  }
}

// Obtener recetas favoritas
export async function getFavoriteRecipes(userId: string, limit = 50) {
  try {
    const response = await axios.get(`${API_URL}/favorites/${userId}?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting favorite recipes:', error);
    throw error;
  }
}

// Eliminar receta de favoritos
export async function removeFavoriteRecipe(favoriteId: string, userId: string) {
  try {
    const response = await axios.delete(`${API_URL}/favorites/${favoriteId}`, {
      data: { userId }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error removing favorite recipe:', error);
    throw error;
  }
}

// Verificar si una receta es favorita
export async function isFavoriteRecipe(userId: string, recipeName: string) {
  try {
    const encodedName = encodeURIComponent(recipeName);
    const response = await axios.get(`${API_URL}/favorites/check/${userId}/${encodedName}`);
    return response.data;
  } catch (error: any) {
    console.error('Error checking favorite recipe:', error);
    throw error;
  }
}
