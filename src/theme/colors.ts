export interface Theme {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundCard: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // UI Elements
  border: string;
  divider: string;
  shadow: string;

  // Status colors
  success: string;
  error: string;
  warning: string;
  info: string;

  // Category colors (same for both themes)
  categoryBreakfast: string;
  categoryLunch: string;
  categoryDinner: string;
  categorySnack: string;

  // Shopping list
  shoppingListPrimary: string;

  // Favorites
  favoriteColor: string;
}

export const lightTheme: Theme = {
  // Backgrounds
  background: '#F5F5F5',
  backgroundSecondary: '#FFFFFF',
  backgroundCard: '#FFFFFF',

  // Text
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Primary colors
  primary: '#FF8383',
  primaryLight: '#FFB4B4',
  primaryDark: '#FF6B6B',

  // UI Elements
  border: '#E0E0E0',
  divider: '#EEEEEE',
  shadow: 'rgba(0, 0, 0, 0.1)',

  // Status colors
  success: '#4CAF50',
  error: '#FF6B6B',
  warning: '#FFB84D',
  info: '#2196F3',

  // Category colors
  categoryBreakfast: '#FFB84D',
  categoryLunch: '#FF6B6B',
  categoryDinner: '#6B8AFF',
  categorySnack: '#51CF66',

  // Shopping list
  shoppingListPrimary: '#4CAF50',

  // Favorites
  favoriteColor: '#FF8383',
};

export const darkTheme: Theme = {
  // Backgrounds
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  backgroundCard: '#2C2C2C',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',

  // Primary colors
  primary: '#FF9A9A',
  primaryLight: '#FFBFBF',
  primaryDark: '#FF8383',

  // UI Elements
  border: '#3A3A3A',
  divider: '#2A2A2A',
  shadow: 'rgba(0, 0, 0, 0.5)',

  // Status colors
  success: '#66BB6A',
  error: '#EF5350',
  warning: '#FFA726',
  info: '#42A5F5',

  // Category colors
  categoryBreakfast: '#FFB84D',
  categoryLunch: '#FF6B6B',
  categoryDinner: '#6B8AFF',
  categorySnack: '#51CF66',

  // Shopping list
  shoppingListPrimary: '#66BB6A',

  // Favorites
  favoriteColor: '#FF9A9A',
};
