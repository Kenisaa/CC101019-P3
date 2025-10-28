import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Calendar03Icon,
  ArrowLeft01Icon,
  Add01Icon,
  Delete02Icon,
  ShoppingBasket01Icon,
} from "@hugeicons/core-free-icons";
import {
  getWeekPlan,
  saveMealPlan,
  deleteMealPlan,
  getFavoriteRecipes,
  type MealPlanItem,
} from "../services/meals";

interface PlannerScreenProps {
  userId: string;
  onClose: () => void;
}

interface FavoriteRecipe {
  id: string;
  meal_name: string;
  description: string;
  recipes: any[];
}

interface WeekPlan {
  [dayIndex: number]: {
    [mealType: string]: MealPlanItem & { plan_id?: string };
  };
}

export default function PlannerScreen({ userId, onClose }: PlannerScreenProps) {
  const [loading, setLoading] = useState(false);
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({});
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState("");

  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const mealTypes = ["desayuno", "almuerzo", "cena"];

  useEffect(() => {
    const weekStart = getWeekStart();
    setCurrentWeekStart(weekStart);
    loadWeekPlan(weekStart);
    loadFavorites();
  }, []);

  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Lunes como inicio
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0];
  };

  const loadWeekPlan = async (weekStart: string) => {
    try {
      setLoading(true);
      const result = await getWeekPlan(userId, weekStart);
      if (result.success) {
        const organized: WeekPlan = {};
        result.plans.forEach((plan: any) => {
          if (!organized[plan.day_of_week]) {
            organized[plan.day_of_week] = {};
          }
          organized[plan.day_of_week][plan.meal_type] = {
            ...plan.meal_data,
            plan_id: plan.id,
          };
        });
        setWeekPlan(organized);
      }
    } catch (error) {
      console.error("Error loading week plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const result = await getFavoriteRecipes(userId, 50);
      if (result.success && result.favorites) {
        setFavorites(Array.isArray(result.favorites) ? result.favorites : []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      setFavorites([]);
    }
  };

  const handleAddMeal = (dayIndex: number, mealType: string) => {
    setSelectedDay(dayIndex);
    setSelectedMealType(mealType);
    setShowFavorites(true);
  };

  const handleSelectFavorite = async (favorite: FavoriteRecipe) => {
    if (selectedDay === null || !selectedMealType) return;

    try {
      setLoading(true);
      const mealData: MealPlanItem = {
        meal_name: favorite.meal_name,
        description: favorite.description,
        recipes: favorite.recipes,
      };

      const result = await saveMealPlan(
        userId,
        currentWeekStart,
        selectedDay,
        selectedMealType,
        mealData
      );

      if (result.success) {
        setShowFavorites(false);
        loadWeekPlan(currentWeekStart);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo agregar al plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (dayIndex: number, mealType: string) => {
    const meal = weekPlan[dayIndex]?.[mealType];
    if (!meal?.plan_id) return;

    try {
      const result = await deleteMealPlan(meal.plan_id, userId);
      if (result.success) {
        loadWeekPlan(currentWeekStart);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo eliminar");
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case "desayuno":
        return "#FFA726";
      case "almuerzo":
        return "#66BB6A";
      case "cena":
        return "#5C6BC0";
      default:
        return "#999";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <HugeiconsIcon icon={Calendar03Icon} size={24} color="#FF8383" />
          <Text style={styles.headerTitle}>Planificador Semanal</Text>
        </View>
        <TouchableOpacity style={styles.shoppingButton}>
          <HugeiconsIcon icon={ShoppingBasket01Icon} size={24} color="#FF8383" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {loading && Object.keys(weekPlan).length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF8383" />
          </View>
        ) : (
          <View style={styles.calendar}>
            {daysOfWeek.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.dayColumn}>
                <Text style={styles.dayLabel}>{day}</Text>

                {mealTypes.map((mealType) => {
                  const meal = weekPlan[dayIndex]?.[mealType];

                  return (
                    <View key={mealType} style={styles.mealSlot}>
                      <View
                        style={[
                          styles.mealTypeIndicator,
                          { backgroundColor: getMealTypeColor(mealType) },
                        ]}
                      />
                      {meal ? (
                        <View style={styles.mealCard}>
                          <Text style={styles.mealName} numberOfLines={2}>
                            {meal.meal_name}
                          </Text>
                          <TouchableOpacity
                            style={styles.deleteMealButton}
                            onPress={() => handleDeleteMeal(dayIndex, mealType)}
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={16} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addMealButton}
                          onPress={() => handleAddMeal(dayIndex, mealType)}
                        >
                          <HugeiconsIcon icon={Add01Icon} size={20} color="#999" />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal de Selección de Favoritos */}
      <Modal
        visible={showFavorites}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFavorites(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona una receta</Text>
            <ScrollView style={styles.favoritesList}>
              {favorites.length === 0 ? (
                <Text style={styles.emptyText}>
                  No tienes recetas favoritas. Agrega algunas primero desde el Dashboard.
                </Text>
              ) : (
                favorites.map((favorite) => (
                  <TouchableOpacity
                    key={favorite.id}
                    style={styles.favoriteItem}
                    onPress={() => handleSelectFavorite(favorite)}
                  >
                    <Text style={styles.favoriteName}>{favorite.meal_name}</Text>
                    <Text style={styles.favoriteDesc} numberOfLines={1}>
                      {favorite.description}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFavorites(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    width: 24,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  shoppingButton: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  calendar: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  dayColumn: {
    width: 120,
    marginRight: 8,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: "white",
    borderRadius: 8,
  },
  mealSlot: {
    marginBottom: 8,
    position: "relative",
  },
  mealTypeIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    zIndex: 1,
  },
  mealCard: {
    backgroundColor: "white",
    padding: 12,
    paddingLeft: 16,
    borderRadius: 8,
    minHeight: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mealName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
    lineHeight: 16,
  },
  deleteMealButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  addMealButton: {
    backgroundColor: "white",
    padding: 12,
    paddingLeft: 16,
    borderRadius: 8,
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  favoritesList: {
    maxHeight: 400,
  },
  favoriteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  favoriteDesc: {
    fontSize: 14,
    color: "#666",
  },
  closeButton: {
    backgroundColor: "#FF8383",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    padding: 20,
    lineHeight: 22,
  },
});
