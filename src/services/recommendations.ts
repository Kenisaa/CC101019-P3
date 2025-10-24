import axios from "axios";
import { getRecentMeals } from "./firestore";
import { SUBSCRIPTION_LIMITS, type SubscriptionTier } from "./subscription";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface MealRecommendation {
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

export async function generateMealRecommendation(
  userId: string,
  subscriptionTier: SubscriptionTier
): Promise<{ success: boolean; recommendation?: MealRecommendation; error?: string }> {
  try {
    // Obtener historial de comidas recientes
    const mealHistoryDays = SUBSCRIPTION_LIMITS[subscriptionTier].mealHistoryDays;
    const { meals } = await getRecentMeals(userId, mealHistoryDays);

    // Preparar el contexto del usuario
    const mealHistory = meals
      .map((meal) => `${meal.category}: ${meal.name}`)
      .join(", ");

    const recipesCount = SUBSCRIPTION_LIMITS[subscriptionTier].recipesPerRecommendation;

    // Preparar el prompt para OpenAI
    const systemPrompt = `Eres un asistente de nutrición experto que ayuda a las personas a descubrir qué comer.
Tu objetivo es sugerir comidas deliciosas, nutritivas y variadas basándote en el historial de comidas del usuario.
Siempre responde en español.`;

    const userPrompt = `Basándote en mi historial reciente de comidas: ${mealHistory || "Sin historial previo"}

Por favor recomiéndame una comida para hoy. Incluye:
1. El nombre de la comida recomendada
2. Una breve descripción (2-3 líneas)
3. ${recipesCount} receta${recipesCount > 1 ? "s" : ""} completa${recipesCount > 1 ? "s" : ""} con ingredientes, instrucciones, tiempo de preparación y nivel de dificultad
4. El razonamiento detrás de tu recomendación

Responde en formato JSON con esta estructura:
{
  "meal": "nombre de la comida",
  "description": "descripción breve",
  "recipes": [
    {
      "name": "nombre de la receta",
      "ingredients": ["ingrediente 1", "ingrediente 2"],
      "instructions": ["paso 1", "paso 2"],
      "prepTime": "30 minutos",
      "difficulty": "Media"
    }
  ],
  "reasoning": "razonamiento de la recomendación"
}`;

    // Llamar a OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const recommendation = JSON.parse(
      response.data.choices[0].message.content
    ) as MealRecommendation;

    return { success: true, recommendation };
  } catch (error: any) {
    console.error("Error generating recommendation:", error);
    return {
      success: false,
      error: error.message || "Error al generar recomendación",
    };
  }
}
