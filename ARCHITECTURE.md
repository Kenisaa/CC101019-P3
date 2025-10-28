# Meal Buddy App - Complete Architecture Overview

## 1. PROJECT STRUCTURE & ARCHITECTURE

### Overall Setup
- **Frontend**: React Native + Expo (Mobile App)
- **Backend**: Express.js + Node.js (REST API)
- **Database**: SQLite (primary) with Firebase fallback (hybrid approach)
- **Authentication**: Email/Phone OTP-based authentication
- **AI Provider**: Google Gemini API for meal recommendations

### Technology Stack
```
Frontend:
├── React 19.1.0
├── React Native 0.81.5
├── Expo 54.0.20
├── React Navigation 7.1.18
├── TypeScript 5.9.2
├── Axios (HTTP client)
└── React Hook Form

Backend:
├── Express 4.18.2
├── Better SQLite3 (database)
├── Firebase Admin SDK
├── bcryptjs (password hashing)
├── jsonwebtoken (JWT)
└── Nodemailer (email)

Mobile Icons:
├── Hugeicons React Native (UI icons)
└── Core Free Icons library
```

---

## 2. FRONTEND ARCHITECTURE

### Project Structure
```
src/
├── config/
│   ├── firebase.ts          # Firebase initialization
│   └── firebase-admin.js    # Backend Firebase config
│
├── screens/
│   ├── WelcomeScreen.tsx    # Landing page
│   ├── AuthScreen.tsx       # Login/Register
│   ├── DashboardScreen.tsx  # Main dashboard
│   ├── PlannerScreen.tsx    # Meal planning (Premium)
│   └── PreferencesScreen.tsx # User preferences
│
├── components/
│   ├── PremiumUpgradeModal.tsx
│   └── StatsCard.tsx
│
├── navigation/
│   ├── AppNavigator.tsx     # Main navigation stack
│   └── types.ts             # Navigation types
│
├── services/
│   ├── meals.ts             # Meal API service (HTTP calls)
│   ├── firestore.ts         # Firestore operations (backup)
│   ├── recommendations.ts   # AI recommendation service
│   └── subscription.ts      # Subscription management
│
├── hooks/
│   ├── useAuth.ts           # Authentication context
│   └── useSubscription.ts   # Subscription state
│
└── utils/
    └── subscription.ts      # Subscription helpers
```

### Navigation Structure
```
Root Navigator (Stack)
├── [Not Authenticated]
│   ├── Welcome Screen
│   └── Auth Screen (Login/Register/OTP Verify)
│
└── [Authenticated]
    └── Dashboard Screen
        ├── Meal History Display
        ├── Add Meal Modal
        ├── Get Recommendation Button
        ├── Recommendation Display Modal
        ├── Preferences Screen (Optional)
        └── Planner Screen (Premium only)
```

### State Management Approach
- **AuthContext**: Global authentication state via React Context
  - Stores: `user`, `loading`, `login()`, `logout()`
  - Persisted in AsyncStorage (but not restored on app launch)
  - User object: `{ id, name, email, verified }`

- **Local Component State**: useState for UI state
  - Modal visibility
  - Form inputs
  - Loading states
  - Meal data

- **Service Layer**: Direct API calls via Axios
  - No Redux/Zustand
  - Each service function makes HTTP requests
  - Results handled in component useState

---

## 3. BACKEND ARCHITECTURE

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   └── firebase-admin.js    # Firebase Admin initialization
│   │
│   ├── models/
│   │   ├── database.js          # JSON file-based (deprecated)
│   │   ├── sqlite-database.js   # SQLite implementation (PRIMARY)
│   │   ├── firebase-database.js # Firestore implementation (FALLBACK)
│   │   └── hybrid-database.js   # Hybrid adapter
│   │
│   ├── controllers/
│   │   └── authController.js    # Auth logic
│   │
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── meals.js             # Meals endpoints
│   │   ├── recommendations.js   # AI recommendations
│   │   └── plans.js             # Meal planning (Premium)
│   │
│   ├── utils/
│   │   └── email.js             # Email sending via Nodemailer
│   │
│   ├── data/                    # SQLite & JSON storage
│   │   ├── mealbuddy.db         # SQLite database
│   │   ├── users.json           # JSON users (fallback)
│   │   └── otps.json            # JSON OTPs (fallback)
│   │
│   └── index.js                 # Express server setup
│
└── package.json
```

### API Endpoints

#### Authentication
```
POST /api/auth/register
  Body: { name, email, phone, password }
  Response: { success, userId, identifier }

POST /api/auth/login
  Body: { identifier, password }
  Response: { success, userId, identifier }

POST /api/auth/verify
  Body: { identifier, code }
  Response: { success, token, user: { id, name, email, verified } }

POST /api/auth/resend
  Body: { identifier }
  Response: { success, message }
```

#### Meals Management
```
POST /api/meals/add
  Body: { userId, name, category, date?, imageUrl?, notes? }
  Response: { success, id }
  Categories: desayuno, almuerzo, cena, snack

GET /api/meals/history/:userId?limit=20
  Response: { success, meals: Meal[] }

GET /api/meals/recent/:userId?days=7
  Response: { success, meals: Meal[] }

DELETE /api/meals/:mealId
  Body: { userId }
  Response: { success }

GET /api/meals/preferences/:userId
  Response: { success, preferences: UserPreferences }

POST /api/meals/preferences
  Body: { userId, preferences: UserPreferences }
  Response: { success }
```

#### Recommendations (AI)
```
POST /api/recommendations/generate
  Body: { userId, subscriptionTier: 'free'|'premium' }
  Response: { success, recommendation: Recommendation }

GET /api/recommendations/history/:userId?limit=10
  Response: { success, recommendations: Recommendation[] }
```

#### Meal Planning (Premium Only)
```
GET /api/plans/stats/:userId
  Response: { success, stats }

POST /api/plans/save
  Body: { userId, weekStartDate, dayOfWeek, mealType, mealData }
  Response: { success }

GET /api/plans/:userId/:weekStartDate
  Response: { success, plan }

DELETE /api/plans/:planId
  Body: { userId }
  Response: { success }

DELETE /api/plans/week/:userId/:weekStartDate
  Response: { success }
```

---

## 4. DATA MODELS & DATABASE SCHEMA

### SQLite Database Schema

#### users table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password TEXT NOT NULL,              -- bcrypt hashed
  verified INTEGER DEFAULT 0,          -- 0=false, 1=true
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### otps table
```sql
CREATE TABLE otps (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,            -- email or phone
  code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,        -- 10 minutes from creation
  used INTEGER DEFAULT 0,
  used_at DATETIME
);
```

#### meals table
```sql
CREATE TABLE meals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,              -- desayuno, almuerzo, cena, snack
  date DATETIME NOT NULL,
  image_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### meal_recommendations table
```sql
CREATE TABLE meal_recommendations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  description TEXT,
  reasoning TEXT,
  recipes TEXT NOT NULL,               -- JSON stringified
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### user_preferences table
```sql
CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  dietary_restrictions TEXT,           -- JSON stringified array
  allergies TEXT,                      -- JSON stringified array
  favorite_cuisines TEXT,              -- JSON stringified array
  disliked_foods TEXT,                 -- JSON stringified array
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### meal_plans table (Premium Feature)
```sql
CREATE TABLE meal_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  day_of_week INTEGER,                 -- 0-6 (Sun-Sat)
  meal_type TEXT,                      -- desayuno, almuerzo, cena, snack
  meal_data TEXT NOT NULL,             -- JSON stringified
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### TypeScript Interfaces (Frontend)

#### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}
```

#### Meal
```typescript
interface Meal {
  id: string;
  user_id: string;
  name: string;
  category: string;      // 'desayuno' | 'almuerzo' | 'cena' | 'snack'
  date: string;          // ISO format
  image_url?: string;
  notes?: string;
  created_at: string;
}

interface MealInput {
  name: string;
  category: string;
  date?: string;
  imageUrl?: string;
  notes?: string;
}
```

#### Recommendation (AI Generated)
```typescript
interface Recommendation {
  meal: string;
  description: string;
  recipes: Recipe[];
  reasoning: string;
}

interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;      // e.g., "30 minutos"
  difficulty: string;    // 'Fácil' | 'Media' | 'Difícil'
}
```

#### User Preferences
```typescript
interface UserPreferences {
  dietaryRestrictions: string[];  // e.g., ['vegetariano', 'sin gluten']
  allergies: string[];            // e.g., ['maní', 'lácteos']
  favoriteCuisines: string[];     // e.g., ['italiana', 'asiática']
  dislikedFoods: string[];         // e.g., ['brócoli', 'cebolla']
}
```

#### Subscription
```typescript
type SubscriptionTier = 'free' | 'premium';

interface UserSubscription {
  tier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
}

interface TierLimits {
  maxRecommendationsPerDay: number;
  maxFavorites: number;
  historyDays: number;
  recipesPerRecommendation: number;
  canAccessPlanner: boolean;
  canAccessStats: boolean;
}
```

**Subscription Tiers:**
- **Free**: 3 recs/day, 10 favorites, 7-day history, 1 recipe/recommendation
- **Premium**: 999 recs/day, 999 favorites, 365-day history, 3 recipes/recommendation, meal planner access

---

## 5. AI RECIPE GENERATION

### Gemini API Integration

**Provider**: Google Gemini API (Backend)

**Endpoint**: 
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent
```

**Process**:
1. Frontend calls: `POST /api/recommendations/generate`
2. Backend retrieves user's recent meal history (last 7-30 days based on tier)
3. Backend fetches user preferences (dietary restrictions, allergies, cuisines, dislikes)
4. Backend constructs detailed prompt with context
5. Backend calls Gemini API with JSON response format
6. Gemini returns structured JSON with meal recommendation and recipes
7. Backend parses and saves recommendation to database
8. Backend returns recommendation to frontend
9. Frontend displays in modal with recipe details

**Prompt Structure**:
```
System: "You are an expert nutrition assistant..."
User: "Based on my meal history: [meals]
      My restrictions: [restrictions]
      My allergies: [allergies]
      My favorite cuisines: [cuisines]
      Recommend 1-3 meals with complete recipes..."
Response Format: JSON with meal, description, recipes, reasoning
```

**Response Schema**:
```json
{
  "meal": "Pasta Carbonara",
  "description": "Creamy pasta...",
  "recipes": [
    {
      "name": "Pasta Carbonara",
      "ingredients": ["pasta", "eggs", ...],
      "instructions": ["Cook pasta", ...],
      "prepTime": "30 minutos",
      "difficulty": "Media"
    }
  ],
  "reasoning": "Based on your recent meals..."
}
```

### Subscription Impact on AI
- **Free tier**: Gets 1 recipe per recommendation, limited history context
- **Premium tier**: Gets 3 recipes, full 30-day history for better context

---

## 6. AUTHENTICATION FLOW

### Registration Flow
```
1. User enters: name, email, password
2. Frontend -> POST /api/auth/register
3. Backend:
   - Validate inputs
   - Check email doesn't exist
   - Hash password with bcryptjs
   - Create user in SQLite
   - Generate 6-digit OTP
   - Save OTP with 10-min expiry
   - Send OTP via Nodemailer
4. Frontend moves to OTP verification step
```

### Login Flow
```
1. User enters: email, password
2. Frontend -> POST /api/auth/login
3. Backend:
   - Validate inputs
   - Find user by email/phone
   - Compare password hash
   - Generate new 6-digit OTP
   - Send OTP via email
4. Frontend moves to OTP verification step
```

### OTP Verification Flow
```
1. User enters: OTP code
2. Frontend -> POST /api/auth/verify
3. Backend:
   - Find valid (non-expired, unused) OTP
   - Mark OTP as used
   - Generate JWT token
   - Return token + user data
4. Frontend:
   - Saves token to AsyncStorage (but doesn't restore on restart)
   - Calls useAuth.login()
   - Navigates to Dashboard
```

### No Session Persistence
- Tokens stored in AsyncStorage but **not restored on app restart**
- User must login again each app session
- Logout clears AsyncStorage

---

## 7. CURRENT SCREENS & FEATURES

### Implemented Screens

#### 1. WelcomeScreen
- Landing page with app description
- "Login" and "Register" buttons
- No functional data yet

#### 2. AuthScreen
- Three modes: login, register, verify
- **Register mode**:
  - Name, email, password inputs
  - Creates new user account
- **Login mode**:
  - Email/phone and password
  - Initiates OTP send
- **Verify mode**:
  - OTP code input
  - Completes authentication

#### 3. DashboardScreen
- **Header**: Greeting + Sign Out button
- **Action Buttons**:
  - "Agregar Comida" (Add Meal) - Opens add meal modal
  - "Recomendar con IA" (Get AI Recommendation) - Opens recommendation modal
- **Meal History Section**:
  - List of recent meals (10 max)
  - Shows meal name, category (with icon), date, notes
  - Empty state if no meals
- **Modals**:
  - Add Meal Modal: Name, category selector, notes
  - Recommendation Modal: Scrollable recipe display with full details

#### 4. PreferencesScreen (Partially Implemented)
- Dietary restrictions (vegetarian, vegan, etc.)
- Allergies management
- Favorite cuisines
- Disliked foods
- Add/remove functionality for each category
- Load and save preferences to backend

#### 5. PlannerScreen (Premium Feature, Partially Implemented)
- Week-based meal planning
- Drag-drop meal assignment (intended)
- Favorite recipes drawer
- Delete individual plans or clear week
- Premium access required

### Features Status

#### Implemented ✓
- User registration & authentication (email OTP)
- Meal logging (add, view history, delete)
- AI meal recommendations (Gemini-powered)
- User preferences management
- Subscription tier system (free/premium)
- Meal categories (desayuno, almuerzo, cena, snack)
- Date-based meal filtering
- Modal-based UI for recipes

#### Partial Implementation
- Meal planner (UI created, premium gating exists)
- Statistics/Analytics (structure exists)
- Preferences screen (UI created)

#### Not Implemented
- Favorite/star recipes
- Recipe sharing
- Social features
- Shopping list generation
- Meal plan export
- Image uploads for meals
- Notifications
- Dark mode
- Multiple language support

---

## 8. EXISTING FAVORITES/SHARING FUNCTIONALITY

### Current Favoriting System
**Status**: Referenced but NOT implemented

Evidence:
- `src/screens/PlannerScreen.tsx` imports `getFavoriteRecipes()`
- `getFavoriteRecipes()` not defined in `src/services/meals.ts`
- No favorite table in SQLite schema
- No API endpoint for favorites in backend

### Sharing Functionality
**Status**: NOT implemented

No sharing code found in:
- Frontend services
- Backend routes
- UI components

---

## 9. RUNNING THE APPLICATION

### Local Development

**Frontend**:
```bash
npm install
npm start                    # Start Expo
# or
expo start --ios            # Direct to iOS simulator
```

**Backend**:
```bash
cd backend
npm install
npm start                    # Runs on localhost:3000
```

**Environment Variables Needed**:
```
# Frontend (.env)
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_OPENAI_API_KEY=...

# Backend (.env)
GEMINI_API_KEY=...
EMAIL_USER=...
EMAIL_PASSWORD=...
```

---

## 10. KEY PATTERNS & CONVENTIONS

### Service Layer Pattern
```typescript
// Each service exports functions, not classes
export async function addMeal(userId, meal) { ... }
export async function getMealHistory(userId, limit) { ... }

// Called directly from components
const result = await addMeal(user.id, mealData);
```

### Custom Hooks
```typescript
// useAuth: Returns user state and auth functions
const { user, loading, login, logout } = useAuth();

// useSubscription: Returns subscription tier and limits
const { subscription, isPremium, loading } = useSubscription();
```

### Error Handling
- Backend: Returns `{ success: boolean, data?, message?, error? }`
- Frontend: Try-catch blocks, Alert.alert() for errors
- No global error boundary yet

### Database Hybrid Approach
- **Primary**: SQLite (always available, faster)
- **Fallback**: Firebase (if SQLite unavailable)
- Adapter pattern in `hybrid-database.js` switches between implementations

---

## 11. API COMMUNICATION

### HTTP Client Setup
```typescript
// Uses Axios directly
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const response = await axios.post(`${API_URL}/meals/add`, data);
```

### Response Format
```typescript
// Consistent response format
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  requiresUpgrade?: boolean;  // For premium features
}
```

---

## 12. FUTURE CONSIDERATIONS FOR NEW FEATURES

When implementing new features, consider:

1. **Database**: Add tables to `sqlite-database.js` schema section
2. **Backend**: Create route file in `/routes/` and register in `index.js`
3. **API**: Follow existing pattern: `{ success, data, message, error }`
4. **Frontend**: Add service functions in `/services/`
5. **Screens**: Create new screen in `/screens/` and add to AppNavigator
6. **State**: Use Context for global state, useState for local state
7. **Styling**: Follow existing StyleSheet.create() patterns
8. **Icons**: Use HugeiconsIcon from @hugeicons/react-native
9. **Types**: Define TypeScript interfaces for new data models
10. **Auth**: Protected endpoints should check userId in body/params

---

## SUMMARY

This meal planning app uses a **modern mobile architecture** with:
- Clean separation between frontend (React Native) and backend (Express)
- Flexible database layer supporting both SQLite and Firebase
- Context-based auth state management
- Service-based API calls
- Gemini AI integration for recipe generation
- Subscription tiers for feature gating
- Strong type safety with TypeScript throughout

The codebase is well-structured for extension and supports both local development and production deployment.
