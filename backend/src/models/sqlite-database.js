const Database = require('better-sqlite3');
const path = require('path');

// Crear o abrir la base de datos
const dbPath = path.join(__dirname, '../../data/mealbuddy.db');
const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS otps (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    used_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATETIME NOT NULL,
    image_url TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS meal_recommendations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    description TEXT,
    reasoning TEXT,
    recipes TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    dietary_restrictions TEXT,
    allergies TEXT,
    favorite_cuisines TEXT,
    disliked_foods TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS favorite_recipes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    recommendation_id TEXT,
    recipe_name TEXT NOT NULL,
    recipe_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recommendation_id) REFERENCES meal_recommendations(id) ON DELETE SET NULL,
    UNIQUE(user_id, recipe_name)
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
  CREATE INDEX IF NOT EXISTS idx_otps_identifier ON otps(identifier);
  CREATE INDEX IF NOT EXISTS idx_otps_code ON otps(code);
  CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
  CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
  CREATE INDEX IF NOT EXISTS idx_meal_recommendations_user_id ON meal_recommendations(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
  CREATE INDEX IF NOT EXISTS idx_favorite_recipes_user_id ON favorite_recipes(user_id);
`);

// Migraciones: Verificar y recrear tabla favorite_recipes si es necesario
try {
  const tableInfo = db.prepare(`PRAGMA table_info(favorite_recipes)`).all();
  const columns = tableInfo.map(col => col.name);

  console.log('📋 Columnas actuales en favorite_recipes:', columns.join(', '));

  // Verificar si la estructura es correcta
  const requiredColumns = ['id', 'user_id', 'recommendation_id', 'recipe_name', 'recipe_data', 'created_at'];
  const hasCorrectStructure = requiredColumns.every(col => columns.includes(col));

  // Si tiene columnas incorrectas (como meal_name) o estructura incorrecta, recrear
  if (columns.includes('meal_name') || !hasCorrectStructure) {
    console.log('⚠️  Estructura de tabla incorrecta. Recreando favorite_recipes...');
    db.exec(`DROP TABLE IF EXISTS favorite_recipes`);
    db.exec(`
      CREATE TABLE favorite_recipes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        recommendation_id TEXT,
        recipe_name TEXT NOT NULL,
        recipe_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, recipe_name)
      )
    `);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_favorite_recipes_user_id ON favorite_recipes(user_id)`);
    console.log('✅ Tabla favorite_recipes recreada correctamente');
  } else {
    console.log('✅ Estructura de tabla correcta');
  }
} catch (error) {
  console.error('❌ Error en migración:', error.message);
  // Si hay cualquier error, recrear la tabla
  console.log('🔄 Recreando tabla favorite_recipes por seguridad...');
  try {
    db.exec(`DROP TABLE IF EXISTS favorite_recipes`);
    db.exec(`
      CREATE TABLE favorite_recipes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        recommendation_id TEXT,
        recipe_name TEXT NOT NULL,
        recipe_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, recipe_name)
      )
    `);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_favorite_recipes_user_id ON favorite_recipes(user_id)`);
    console.log('✅ Tabla favorite_recipes recreada correctamente');
  } catch (recreateError) {
    console.error('❌ Error recreando tabla:', recreateError.message);
  }
}

class SQLiteDatabase {
  // USUARIOS
  getUsers() {
    try {
      const stmt = db.prepare('SELECT * FROM users');
      return stmt.all();
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  findUserByEmail(email) {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
      return stmt.get(email.toLowerCase());
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  findUserByPhone(phone) {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE phone = ? LIMIT 1');
      return stmt.get(phone);
    } catch (error) {
      console.error('Error finding user by phone:', error);
      return null;
    }
  }

  findUserById(id) {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
      return stmt.get(id);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  createUser(userData) {
    try {
      const id = this.generateId();
      const stmt = db.prepare(`
        INSERT INTO users (id, name, email, phone, password, verified)
        VALUES (?, ?, ?, ?, ?, 0)
      `);
      
      stmt.run(
        id,
        userData.name,
        userData.email ? userData.email.toLowerCase() : null,
        userData.phone || null,
        userData.password
      );
      
      return this.findUserById(id);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  updateUser(id, updates) {
    try {
      const fields = [];
      const values = [];
      
      Object.keys(updates).forEach(key => {
        fields.push(`${key} = ?`);
        // Convertir booleanos a enteros para SQLite
        let value = updates[key];
        if (typeof value === 'boolean') {
          value = value ? 1 : 0;
        }
        values.push(value);
      });
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const stmt = db.prepare(`
        UPDATE users SET ${fields.join(', ')} WHERE id = ?
      `);
      
      stmt.run(...values);
      return this.findUserById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // OTPs
  getOTPs() {
    try {
      const stmt = db.prepare('SELECT * FROM otps');
      return stmt.all();
    } catch (error) {
      console.error('Error getting OTPs:', error);
      return [];
    }
  }

  createOTP(identifier, code) {
    try {
      const id = this.generateId();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
      
      const stmt = db.prepare(`
        INSERT INTO otps (id, identifier, code, expires_at, used)
        VALUES (?, ?, ?, ?, 0)
      `);
      
      stmt.run(id, identifier, code, expiresAt.toISOString());
      
      return {
        id,
        identifier,
        code,
        expiresAt,
        used: false
      };
    } catch (error) {
      console.error('Error creating OTP:', error);
      throw error;
    }
  }

  findValidOTP(identifier, code) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM otps 
        WHERE identifier = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
        ORDER BY created_at DESC
        LIMIT 1
      `);
      
      return stmt.get(identifier, code);
    } catch (error) {
      console.error('Error finding valid OTP:', error);
      return null;
    }
  }

  markOTPAsUsed(id) {
    try {
      const stmt = db.prepare(`
        UPDATE otps SET used = 1, used_at = CURRENT_TIMESTAMP WHERE id = ?
      `);
      
      stmt.run(id);
      return true;
    } catch (error) {
      console.error('Error marking OTP as used:', error);
      return false;
    }
  }

  cleanExpiredOTPs() {
    try {
      const stmt = db.prepare(`
        DELETE FROM otps WHERE expires_at < datetime('now')
      `);
      
      const result = stmt.run();
      console.log(`🗑️  Eliminados ${result.changes} OTPs expirados`);
    } catch (error) {
      console.error('Error cleaning expired OTPs:', error);
    }
  }

  // MEALS (Historial de comidas)
  addMeal(userId, mealData) {
    try {
      const id = this.generateId();
      const stmt = db.prepare(`
        INSERT INTO meals (id, user_id, name, category, date, image_url, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        userId,
        mealData.name,
        mealData.category,
        mealData.date || new Date().toISOString(),
        mealData.imageUrl || null,
        mealData.notes || null
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error adding meal:', error);
      return { success: false, error };
    }
  }

  getMealHistory(userId, limitCount = 20) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM meals 
        WHERE user_id = ? 
        ORDER BY date DESC 
        LIMIT ?
      `);
      
      const meals = stmt.all(userId, limitCount);
      return { success: true, meals };
    } catch (error) {
      console.error('Error getting meal history:', error);
      return { success: false, meals: [], error };
    }
  }

  getRecentMeals(userId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const stmt = db.prepare(`
        SELECT * FROM meals 
        WHERE user_id = ? AND date >= ? 
        ORDER BY date DESC
      `);
      
      const meals = stmt.all(userId, startDate.toISOString());
      return { success: true, meals };
    } catch (error) {
      console.error('Error getting recent meals:', error);
      return { success: false, meals: [], error };
    }
  }

  updateMeal(mealId, userId, mealData) {
    try {
      const fields = [];
      const values = [];

      if (mealData.name !== undefined) {
        fields.push('name = ?');
        values.push(mealData.name);
      }
      if (mealData.category !== undefined) {
        fields.push('category = ?');
        values.push(mealData.category);
      }
      if (mealData.date !== undefined) {
        fields.push('date = ?');
        values.push(mealData.date);
      }
      if (mealData.imageUrl !== undefined) {
        fields.push('image_url = ?');
        values.push(mealData.imageUrl);
      }
      if (mealData.notes !== undefined) {
        fields.push('notes = ?');
        values.push(mealData.notes);
      }

      if (fields.length === 0) {
        return { success: false, error: 'No hay campos para actualizar' };
      }

      values.push(mealId, userId);

      const stmt = db.prepare(`
        UPDATE meals SET ${fields.join(', ')}
        WHERE id = ? AND user_id = ?
      `);

      const result = stmt.run(...values);
      return { success: result.changes > 0 };
    } catch (error) {
      console.error('Error updating meal:', error);
      return { success: false, error };
    }
  }

  deleteMeal(mealId, userId) {
    try {
      const stmt = db.prepare(`
        DELETE FROM meals WHERE id = ? AND user_id = ?
      `);

      const result = stmt.run(mealId, userId);
      return { success: result.changes > 0 };
    } catch (error) {
      console.error('Error deleting meal:', error);
      return { success: false, error };
    }
  }

  // MEAL RECOMMENDATIONS
  saveMealRecommendation(userId, recommendation) {
    try {
      const id = this.generateId();
      const stmt = db.prepare(`
        INSERT INTO meal_recommendations (id, user_id, meal_name, description, reasoning, recipes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        userId,
        recommendation.meal,
        recommendation.description,
        recommendation.reasoning,
        JSON.stringify(recommendation.recipes)
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error saving recommendation:', error);
      return { success: false, error };
    }
  }

  getRecommendationHistory(userId, limitCount = 10) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM meal_recommendations 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `);
      
      const recommendations = stmt.all(userId, limitCount).map(rec => ({
        ...rec,
        recipes: JSON.parse(rec.recipes)
      }));
      
      return { success: true, recommendations };
    } catch (error) {
      console.error('Error getting recommendation history:', error);
      return { success: false, recommendations: [], error };
    }
  }

  // USER PREFERENCES
  saveUserPreferences(userId, preferences) {
    try {
      const existing = db.prepare('SELECT id FROM user_preferences WHERE user_id = ?').get(userId);
      
      if (existing) {
        // Update
        const stmt = db.prepare(`
          UPDATE user_preferences 
          SET dietary_restrictions = ?, allergies = ?, favorite_cuisines = ?, 
              disliked_foods = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `);
        
        stmt.run(
          preferences.dietaryRestrictions ? JSON.stringify(preferences.dietaryRestrictions) : null,
          preferences.allergies ? JSON.stringify(preferences.allergies) : null,
          preferences.favoriteCuisines ? JSON.stringify(preferences.favoriteCuisines) : null,
          preferences.dislikedFoods ? JSON.stringify(preferences.dislikedFoods) : null,
          userId
        );
      } else {
        // Insert
        const id = this.generateId();
        const stmt = db.prepare(`
          INSERT INTO user_preferences (id, user_id, dietary_restrictions, allergies, favorite_cuisines, disliked_foods)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          id,
          userId,
          preferences.dietaryRestrictions ? JSON.stringify(preferences.dietaryRestrictions) : null,
          preferences.allergies ? JSON.stringify(preferences.allergies) : null,
          preferences.favoriteCuisines ? JSON.stringify(preferences.favoriteCuisines) : null,
          preferences.dislikedFoods ? JSON.stringify(preferences.dislikedFoods) : null
        );
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return { success: false, error };
    }
  }

  getUserPreferences(userId) {
    try {
      const stmt = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?');
      const prefs = stmt.get(userId);
      
      if (!prefs) {
        return { success: true, preferences: null };
      }
      
      return {
        success: true,
        preferences: {
          dietaryRestrictions: prefs.dietary_restrictions ? JSON.parse(prefs.dietary_restrictions) : [],
          allergies: prefs.allergies ? JSON.parse(prefs.allergies) : [],
          favoriteCuisines: prefs.favorite_cuisines ? JSON.parse(prefs.favorite_cuisines) : [],
          dislikedFoods: prefs.disliked_foods ? JSON.parse(prefs.disliked_foods) : []
        }
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return { success: false, preferences: null, error };
    }
  }

  // FAVORITE RECIPES
  addFavoriteRecipe(userId, recipeData) {
    try {
      const id = this.generateId();
      const stmt = db.prepare(`
        INSERT INTO favorite_recipes (id, user_id, recommendation_id, recipe_name, recipe_data)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        userId,
        recipeData.recommendationId || null,
        recipeData.name,
        JSON.stringify(recipeData)
      );

      return { success: true, id };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        return { success: false, error: 'Esta receta ya está en favoritos' };
      }
      console.error('Error adding favorite recipe:', error);
      return { success: false, error };
    }
  }

  getFavoriteRecipes(userId, limitCount = 50) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM favorite_recipes
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `);

      const rawFavorites = stmt.all(userId, limitCount);
      const favorites = rawFavorites
        .filter(fav => fav.recipe_data) // Filtrar registros sin datos
        .map(fav => ({
          id: fav.id,
          userId: fav.user_id,
          recommendationId: fav.recommendation_id,
          recipeName: fav.recipe_name,
          recipeData: JSON.parse(fav.recipe_data),
          createdAt: fav.created_at
        }));

      return { success: true, favorites };
    } catch (error) {
      console.error('Error getting favorite recipes:', error);
      return { success: false, favorites: [], error };
    }
  }

  removeFavoriteRecipe(favoriteId, userId) {
    try {
      const stmt = db.prepare(`
        DELETE FROM favorite_recipes WHERE id = ? AND user_id = ?
      `);

      const result = stmt.run(favoriteId, userId);
      return { success: result.changes > 0 };
    } catch (error) {
      console.error('Error removing favorite recipe:', error);
      return { success: false, error };
    }
  }

  isFavoriteRecipe(userId, recipeName) {
    try {
      const stmt = db.prepare(`
        SELECT id FROM favorite_recipes
        WHERE user_id = ? AND recipe_name = ?
        LIMIT 1
      `);

      const favorite = stmt.get(userId, recipeName);
      return { success: true, isFavorite: !!favorite, favoriteId: favorite?.id };
    } catch (error) {
      console.error('Error checking favorite recipe:', error);
      return { success: false, isFavorite: false };
    }
  }

  // Utilidades
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Cerrar la base de datos
  close() {
    db.close();
  }
}

module.exports = new SQLiteDatabase();
