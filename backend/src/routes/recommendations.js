const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../models/sqlite-database');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Generar recomendación de comida usando Gemini
router.post('/generate', async (req, res) => {
  try {
    const { userId, subscriptionTier } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId es requerido'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key no configurada'
      });
    }

    // Obtener historial de comidas recientes
    const mealHistoryDays = subscriptionTier === 'premium' ? 30 : 7;
    const mealsResult = db.getRecentMeals(userId, mealHistoryDays);

    if (!mealsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener historial de comidas'
      });
    }

    // Obtener preferencias del usuario
    const preferencesResult = db.getUserPreferences(userId);
    const preferences = preferencesResult.preferences || {};

    // Obtener últimas 5 recomendaciones para evitar repetición
    const recommendationsResult = db.getRecommendationHistory(userId, 5);
    const recentRecommendations = recommendationsResult.success ? recommendationsResult.recommendations : [];

    // Preparar el contexto del usuario
    const mealHistory = mealsResult.meals
      .map((meal) => `${meal.category}: ${meal.name}`)
      .join(', ');

    // Extraer los ingredientes principales de las últimas recomendaciones
    const recentIngredients = recentRecommendations
      .map(rec => rec.meal_name)
      .filter(Boolean)
      .join(', ');

    const recipesCount = subscriptionTier === 'premium' ? 3 : 1;

    // Construir el prompt
    let prompt = `Eres un asistente de nutrición experto que ayuda a las personas a descubrir qué comer.
Tu objetivo es sugerir comidas deliciosas, nutritivas y MUY VARIADAS basándote en el historial de comidas del usuario.
Siempre responde en español.

Historial reciente de comidas del usuario: ${mealHistory || 'Sin historial previo'}
`;

    // Agregar recomendaciones recientes para evitar repetición
    if (recentIngredients) {
      prompt += `\n\n⚠️ IMPORTANTE - Recomendaciones recientes que ya recibió el usuario: ${recentIngredients}`;
      prompt += `\n🚫 EVITA REPETIR estos platillos o ingredientes principales. Busca opciones COMPLETAMENTE DIFERENTES.`;
      prompt += `\nSi las últimas fueron de pollo, sugiere pescado, res, cerdo, vegetariano, etc.`;
      prompt += `\nSi fueron asiáticas, sugiere mexicana, italiana, mediterránea, etc.`;
    }

    // Agregar preferencias si existen
    if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
      prompt += `\nRestricciones dietéticas: ${preferences.dietaryRestrictions.join(', ')}`;
    }
    if (preferences.allergies && preferences.allergies.length > 0) {
      prompt += `\nAlergias: ${preferences.allergies.join(', ')}`;
    }
    if (preferences.favoriteCuisines && preferences.favoriteCuisines.length > 0) {
      prompt += `\nCocinas favoritas: ${preferences.favoriteCuisines.join(', ')}`;
    }
    if (preferences.dislikedFoods && preferences.dislikedFoods.length > 0) {
      prompt += `\nComidas que no le gustan: ${preferences.dislikedFoods.join(', ')}`;
    }

    // Agregar instrucciones de variedad
    prompt += `\n\n🌟 PRIORIZA LA VARIEDAD:`;
    prompt += `\n- Alterna entre diferentes proteínas (pollo, res, cerdo, pescado, mariscos, legumbres, tofu)`;
    prompt += `\n- Varía los estilos de cocina (mexicana, italiana, asiática, mediterránea, india, etc.)`;
    prompt += `\n- Explora diferentes métodos de cocción (asado, al vapor, salteado, horneado, etc.)`;
    prompt += `\n- Considera platillos de temporada y regionales`;
    prompt += `\n- Balancea entre comidas ligeras y sustanciosas`;

    prompt += `\n\nPor favor recomiéndame una comida para hoy. Incluye:
1. El nombre de la comida recomendada
2. Una breve descripción (máximo 2 líneas)
3. ${recipesCount} receta${recipesCount > 1 ? 's' : ''} completa${recipesCount > 1 ? 's' : ''} con ingredientes (máximo 10), instrucciones (máximo 8 pasos), tiempo de preparación y nivel de dificultad
4. El razonamiento detrás de tu recomendación (máximo 2 líneas)

IMPORTANTE: Sé conciso en las cantidades e ingredientes. Usa nombres cortos.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin bloques de código) con esta estructura exacta:
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

    // Llamar a Gemini API con modo JSON nativo
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9, // Aumentado para más creatividad y variedad
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: "application/json"
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extraer el texto de la respuesta
    const generatedText = response.data.candidates[0].content.parts[0].text;

    // Limpiar el texto para obtener solo el JSON
    let jsonText = generatedText.trim();

    // Remover bloques de markdown si existen
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Remover espacios en blanco al inicio/final
    jsonText = jsonText.trim();

    // Parsear la respuesta JSON con manejo robusto de errores
    let recommendation;
    try {
      recommendation = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError.message);
      console.error('JSON text received:', jsonText.substring(0, 500)); // Log primeros 500 caracteres

      // Verificar si el JSON está truncado
      if (parseError.message.includes('Unterminated') || parseError.message.includes('Unexpected end')) {
        console.error('❌ La respuesta de Gemini fue truncada. Aumenta maxOutputTokens.');
        throw new Error('La receta generada es muy larga. Por favor, intenta de nuevo.');
      }

      // Intentar limpiar JSON malformado
      try {
        // Reemplazar saltos de línea dentro de strings
        const cleanedJson = jsonText
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');

        recommendation = JSON.parse(cleanedJson);
      } catch (secondParseError) {
        throw new Error('No se pudo generar la receta. Por favor, intenta de nuevo.');
      }
    }

    // Guardar la recomendación en la base de datos
    db.saveMealRecommendation(userId, recommendation);

    return res.json({
      success: true,
      recommendation
    });

  } catch (error) {
    console.error('Error generating recommendation:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al generar recomendación',
      error: error.response?.data || error.message
    });
  }
});

// Obtener historial de recomendaciones
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    const result = db.getRecommendationHistory(userId, limit ? parseInt(limit) : 10);

    return res.json(result);
  } catch (error) {
    console.error('Error in /history:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
