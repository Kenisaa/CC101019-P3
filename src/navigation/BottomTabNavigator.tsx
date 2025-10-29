import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Home01Icon,
  Settings01Icon,
  ShoppingBasket01Icon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "../hooks/useTheme";

// Screens
import DashboardScreen from "../screens/DashboardScreen";
import PreferencesScreen from "../screens/PreferencesScreen";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import { useAuth } from "../hooks/useAuth";

export type BottomTabParamList = {
  Home: undefined;
  Preferences: undefined;
  ShoppingList: undefined;
  Favorites: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF8383",
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.backgroundCard,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={Home01Icon} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        options={{
          tabBarLabel: "Favoritos",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={FavouriteIcon} size={size} color={color} />
          ),
        }}
      >
        {() => <FavoritesScreen userId={user?.id || ""} />}
      </Tab.Screen>
      <Tab.Screen
        name="ShoppingList"
        options={{
          tabBarLabel: "Compras",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={ShoppingBasket01Icon} size={size} color={color} />
          ),
        }}
      >
        {() => <ShoppingListScreen userId={user?.id || ""} />}
      </Tab.Screen>
      <Tab.Screen
        name="Preferences"
        options={{
          tabBarLabel: "Preferencias",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={Settings01Icon} size={size} color={color} />
          ),
        }}
      >
        {() => <PreferencesScreen userId={user?.id || ""} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
