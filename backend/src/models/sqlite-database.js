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

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
  CREATE INDEX IF NOT EXISTS idx_otps_identifier ON otps(identifier);
  CREATE INDEX IF NOT EXISTS idx_otps_code ON otps(code);
  CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
  CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
  CREATE INDEX IF NOT EXISTS idx_meal_recommendations_user_id ON meal_recommendations(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
`);

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
