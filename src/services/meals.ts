import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  category: string;
  date: string;
  image_url?: string;
  notes?: string;
  created_at: string;
}

export interface MealInput {
  name: string;
  category: string;
  date?: string;
  imageUrl?: string;
  notes?: string;
}

export interface Recommendation {
  meal: string;
  description: string;
  recipes: Recipe[];
  reasoning: string;
}

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: string;
}

// Agregar comida
export async function addMeal(userId: string, meal: MealInput) {
  try {
    const response = await axios.post(`${API_URL}/meals/add`, {
      userId,
      ...meal,
      date: meal.date || new Date().toISOString(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Error adding meal:', error);
    throw error;
  }
}

// Obtener historial de comidas
export async function getMealHistory(userId: string, limit = 20) {
  try {
    const response = await axios.get(`${API_URL}/meals/history/${userId}?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting meal history:', error);
    throw error;
  }
}

// Obtener comidas recientes
export async function getRecentMeals(userId: string, days = 7) {
  try {
    const response = await axios.get(`${API_URL}/meals/recent/${userId}?days=${days}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting recent meals:', error);
    throw error;
  }
}

// Eliminar comida
export async function deleteMeal(mealId: string, userId: string) {
  try {
    const response = await axios.delete(`${API_URL}/meals/${mealId}`, {
      data: { userId }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error deleting meal:', error);
    throw error;
  }
}

// Generar recomendación con IA
export async function generateRecommendation(userId: string, subscriptionTier: string = 'free') {
  try {
    const response = await axios.post(`${API_URL}/recommendations/generate`, {
      userId,
      subscriptionTier
    });
    return response.data;
  } catch (error: any) {
    console.error('Error generating recommendation:', error);
    throw error;
  }
}

// Obtener historial de recomendaciones
export async function getRecommendationHistory(userId: string, limit = 10) {
  try {
    const response = await axios.get(`${API_URL}/recommendations/history/${userId}?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting recommendation history:', error);
    throw error;
  }
}
