import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  Share,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Add01Icon,
  AiBrain01Icon,
  Sun02Icon,
  Restaurant01Icon,
  Moon02Icon,
  PopcornIcon,
  Note01Icon,
  Clock01Icon,
  Chart01Icon,
  Idea01Icon,
  CancelCircleIcon,
  PencilEdit01Icon,
  Delete02Icon,
  FavouriteIcon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "../hooks/useAuth";
import {
  addMeal,
  getMealHistory,
  generateRecommendation,
  updateMeal,
  deleteMeal,
  type Meal,
  type Recommendation,
  type Recipe,
} from "../services/meals";
import {
  addFavoriteRecipe,
  isFavoriteRecipe,
  removeFavoriteRecipe,
} from "../services/favorites";
import PreferencesScreen from "./PreferencesScreen";
import FavoritesScreen from "./FavoritesScreen";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showEditMeal, setShowEditMeal] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Set<string>>(new Set());

  // Form states
  const [mealName, setMealName] = useState("");
  const [mealCategory, setMealCategory] = useState("desayuno");
  const [mealNotes, setMealNotes] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadMealHistory();
    }
  }, [user]);

  const loadMealHistory = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const result = await getMealHistory(user.id, 10);
      if (result.success) {
        setMeals(result.meals || []);
      }
    } catch (error) {
      console.error("Error loading meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async () => {
    if (!user?.id || !mealName.trim()) {
      Alert.alert("Error", "Por favor ingresa el nombre de la comida");
      return;
    }

    try {
      setLoading(true);
      const result = await addMeal(user.id, {
        name: mealName,
        category: mealCategory,
        notes: mealNotes,
      });

      if (result.success) {
        Alert.alert("¡Éxito!", "Comida agregada correctamente");
        setMealName("");
        setMealCategory("desayuno");
        setMealNotes("");
        setShowAddMeal(false);
        loadMealHistory();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo agregar la comida");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAddMeal = () => {
    setMealName("");
    setMealCategory("desayuno");
    setMealNotes("");
    setShowAddMeal(false);
  };

  const handleGetRecommendation = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await generateRecommendation(user.id, "free");
      
      if (result.success && result.recommendation) {
        setRecommendation(result.recommendation);
        setShowRecommendation(true);
      } else {
        Alert.alert("Error", result.error || "No se pudo generar la recomendación");
      }
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Error al generar recomendación");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setMealName(meal.name);
    setMealCategory(meal.category);
    setMealNotes(meal.notes || "");
    setShowEditMeal(true);
  };

  const handleUpdateMeal = async () => {
    if (!user?.id || !editingMeal || !mealName.trim()) {
      Alert.alert("Error", "Por favor ingresa el nombre de la comida");
      return;
    }

    try {
      setLoading(true);
      const result = await updateMeal(editingMeal.id, user.id, {
        name: mealName,
        category: mealCategory,
        notes: mealNotes,
      });

      if (result.success) {
        Alert.alert("¡Éxito!", "Comida actualizada correctamente");
        setMealName("");
        setMealCategory("desayuno");
        setMealNotes("");
        setShowEditMeal(false);
        setEditingMeal(null);
        loadMealHistory();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar la comida");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEditMeal = () => {
    setMealName("");
    setMealCategory("desayuno");
    setMealNotes("");
    setShowEditMeal(false);
    setEditingMeal(null);
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!user?.id) return;

    Alert.alert(
      "Eliminar comida",
      "¿Estás seguro que deseas eliminar esta comida?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const result = await deleteMeal(mealId, user.id);
              if (result.success) {
                Alert.alert("¡Éxito!", "Comida eliminada correctamente");
                loadMealHistory();
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "No se pudo eliminar la comida");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (recipe: Recipe, recommendationId?: string) => {
    if (!user?.id) return;

    try {
      const recipeName = recipe.name;
      const isFavorite = favoriteRecipes.has(recipeName);

      if (isFavorite) {
        // Eliminar de favoritos
        const checkResult = await isFavoriteRecipe(user.id, recipeName);
        if (checkResult.isFavorite && checkResult.favoriteId) {
          await removeFavoriteRecipe(checkResult.favoriteId, user.id);
          setFavoriteRecipes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(recipeName);
            return newSet;
          });
          Alert.alert("Eliminado", "Receta eliminada de favoritos");
        }
      } else {
        // Agregar a favoritos
        await addFavoriteRecipe(user.id, recipe, recommendationId);
        setFavoriteRecipes((prev) => new Set(prev).add(recipeName));
        Alert.alert("¡Guardado!", "Receta agregada a favoritos");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar favoritos");
    }
  };

  const handleShareRecipe = async (recipe: Recipe, mealName: string) => {
    try {
      const message = `🍽️ Receta: ${recipe.name}\n\n` +
        `De: ${mealName}\n\n` +
        `⏱️ Tiempo: ${recipe.prepTime}\n` +
        `📊 Dificultad: ${recipe.difficulty}\n\n` +
        `📝 Ingredientes:\n${recipe.ingredients.map(i => `• ${i}`).join('\n')}\n\n` +
        `👨‍🍳 Instrucciones:\n${recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}\n\n` +
        `Compartido desde Meal Buddy 🤖`;

      await Share.share({
        message,
      });
    } catch (error: any) {
      console.error("Error sharing recipe:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "desayuno":
        return "#FFB84D"; // Naranja suave (amanecer)
      case "almuerzo":
        return "#FF6B6B"; // Rojo (mediodía)
      case "cena":
        return "#6B8AFF"; // Azul (atardecer)
      case "snack":
        return "#51CF66"; // Verde (saludable)
      default:
        return "#FF8383";
    }
  };

  const getCategoryIcon = (category: string, size: number = 32, color?: string) => {
    let icon;
    const iconColor = color || getCategoryColor(category);

    switch (category) {
      case "desayuno":
        icon = Sun02Icon;
        break;
      case "almuerzo":
        icon = Restaurant01Icon;
        break;
      case "cena":
        icon = Moon02Icon;
        break;
      case "snack":
        icon = PopcornIcon;
        break;
      default:
        icon = Restaurant01Icon;
    }
    return <HugeiconsIcon icon={icon} size={size} color={iconColor} />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString("es", { day: "numeric", month: "short" });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>¡Hola {user?.name}!</Text>
            <Text style={styles.headerSubtitle}>¿Qué vas a comer hoy?</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowFavorites(true)}
            >
              <HugeiconsIcon icon={FavouriteIcon} size={20} color="#FF8383" variant="solid" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.preferencesButton}
              onPress={() => setShowPreferences(true)}
            >
              <Text style={styles.preferencesButtonText}>Preferencias</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => setShowAddMeal(true)}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <HugeiconsIcon icon={Add01Icon} size={20} color="white" />
              <Text style={styles.actionButtonText}>Agregar Comida</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleGetRecommendation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FF8383" />
            ) : (
              <View style={styles.buttonContent}>
                <HugeiconsIcon icon={AiBrain01Icon} size={20} color="#FF8383" />
                <Text style={styles.actionButtonTextSecondary}>Recomendar con IA</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Meal History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Comidas</Text>
          
          {loading && meals.length === 0 ? (
            <View style={styles.card}>
              <ActivityIndicator size="large" color="#FF8383" />
            </View>
          ) : meals.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>
                No hay comidas registradas aún.{"\n"}
                ¡Comienza agregando tu primera comida!
              </Text>
            </View>
          ) : (
            meals.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealIconContainer}>
                    {getCategoryIcon(meal.category)}
                  </View>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealCategory}>
                      {meal.category.charAt(0).toUpperCase() + meal.category.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.mealDate}>{formatDate(meal.date)}</Text>
                </View>
                {meal.notes && (
                  <Text style={styles.mealNotes}>{meal.notes}</Text>
                )}
                <View style={styles.mealActions}>
                  <TouchableOpacity
                    style={styles.mealActionButton}
                    onPress={() => handleEditMeal(meal)}
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} size={18} color="#666" />
                    <Text style={styles.mealActionText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mealActionButton}
                    onPress={() => handleDeleteMeal(meal.id)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={18} color="#FF8383" />
                    <Text style={[styles.mealActionText, { color: "#FF8383" }]}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMeal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseAddMeal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Comida</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la comida"
              value={mealName}
              onChangeText={setMealName}
            />

            <Text style={styles.label}>Categoría:</Text>
            <View style={styles.categoryButtons}>
              {["desayuno", "almuerzo", "cena", "snack"].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    mealCategory === cat && {
                      backgroundColor: getCategoryColor(cat),
                      borderColor: getCategoryColor(cat),
                    },
                  ]}
                  onPress={() => setMealCategory(cat)}
                >
                  <View style={styles.categoryButtonContent}>
                    {getCategoryIcon(cat, 18, mealCategory === cat ? "white" : getCategoryColor(cat))}
                    <Text
                      style={[
                        styles.categoryButtonText,
                        mealCategory === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas (opcional)"
              value={mealNotes}
              onChangeText={setMealNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseAddMeal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddMeal}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recommendation Modal */}
      <Modal
        visible={showRecommendation}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecommendation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.recommendationModalContainer}>
            <View style={styles.recommendationModalHeader}>
              <View style={styles.modalTitleContainer}>
                <HugeiconsIcon icon={AiBrain01Icon} size={24} color="#FF8383" />
                <Text style={styles.modalTitle}>Recomendación IA</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButtonTop}
                onPress={() => setShowRecommendation(false)}
              >
                <HugeiconsIcon icon={CancelCircleIcon} size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.recommendationModalScroll}>
              <View style={styles.recommendationModalContent}>
                {recommendation && (
                <>
                  <Text style={styles.recommendationMeal}>
                    {recommendation.meal}
                  </Text>
                  <Text style={styles.recommendationDescription}>
                    {recommendation.description}
                  </Text>

                  <View style={styles.recipeTitleContainer}>
                    <HugeiconsIcon icon={Note01Icon} size={20} color="#000" />
                    <Text style={styles.recipeTitle}>Receta</Text>
                  </View>
                  {recommendation.recipes.map((recipe, index) => (
                    <View key={index} style={styles.recipeCard}>
                      <View style={styles.recipeHeader}>
                        <Text style={styles.recipeName}>{recipe.name}</Text>
                        <View style={styles.recipeActions}>
                          <TouchableOpacity
                            style={styles.recipeActionButton}
                            onPress={() => handleToggleFavorite(recipe)}
                          >
                            <HugeiconsIcon
                              icon={FavouriteIcon}
                              size={24}
                              color={
                                favoriteRecipes.has(recipe.name)
                                  ? "#FF8383"
                                  : "#999"
                              }
                              variant={
                                favoriteRecipes.has(recipe.name) ? "solid" : "stroke"
                              }
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.recipeActionButton}
                            onPress={() =>
                              handleShareRecipe(recipe, recommendation.meal)
                            }
                          >
                            <HugeiconsIcon icon={Share01Icon} size={22} color="#666" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.recipeInfoContainer}>
                        <View style={styles.recipeInfoItem}>
                          <HugeiconsIcon icon={Clock01Icon} size={16} color="#666" />
                          <Text style={styles.recipeInfo}>{recipe.prepTime}</Text>
                        </View>
                        <Text style={styles.recipeInfo}>•</Text>
                        <View style={styles.recipeInfoItem}>
                          <HugeiconsIcon icon={Chart01Icon} size={16} color="#666" />
                          <Text style={styles.recipeInfo}>{recipe.difficulty}</Text>
                        </View>
                      </View>

                      <Text style={styles.recipeSection}>Ingredientes:</Text>
                      {recipe.ingredients.map((ingredient, i) => (
                        <Text key={i} style={styles.recipeItem}>
                          • {ingredient}
                        </Text>
                      ))}

                      <Text style={styles.recipeSection}>Instrucciones:</Text>
                      {recipe.instructions.map((instruction, i) => (
                        <Text key={i} style={styles.recipeItem}>
                          {i + 1}. {instruction}
                        </Text>
                      ))}
                    </View>
                  ))}

                  <View style={styles.reasoningContainer}>
                    <HugeiconsIcon icon={Idea01Icon} size={18} color="#666" />
                    <Text style={styles.reasoning}>
                      {recommendation.reasoning}
                    </Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { marginTop: 20, marginBottom: 20 }]}
                onPress={() => setShowRecommendation(false)}
              >
                <Text style={styles.saveButtonText}>Cerrar</Text>
              </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Meal Modal */}
      <Modal
        visible={showEditMeal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseEditMeal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Comida</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la comida"
              value={mealName}
              onChangeText={setMealName}
            />

            <Text style={styles.label}>Categoría:</Text>
            <View style={styles.categoryButtons}>
              {["desayuno", "almuerzo", "cena", "snack"].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    mealCategory === cat && {
                      backgroundColor: getCategoryColor(cat),
                      borderColor: getCategoryColor(cat),
                    },
                  ]}
                  onPress={() => setMealCategory(cat)}
                >
                  <View style={styles.categoryButtonContent}>
                    {getCategoryIcon(cat, 18, mealCategory === cat ? "white" : getCategoryColor(cat))}
                    <Text
                      style={[
                        styles.categoryButtonText,
                        mealCategory === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas (opcional)"
              value={mealNotes}
              onChangeText={setMealNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseEditMeal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateMeal}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Actualizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Preferences Modal */}
      {showPreferences && user?.id && (
        <Modal
          visible={showPreferences}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowPreferences(false)}
        >
          <PreferencesScreen
            userId={user.id}
            onClose={() => setShowPreferences(false)}
          />
        </Modal>
      )}

      {/* Favorites Modal */}
      {showFavorites && user?.id && (
        <Modal
          visible={showFavorites}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowFavorites(false)}
        >
          <FavoritesScreen
            userId={user.id}
            onClose={() => setShowFavorites(false)}
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
  },
  preferencesButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FF8383",
    borderRadius: 8,
  },
  preferencesButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
  signOutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#FF8383",
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#FF8383",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtonTextSecondary: {
    color: "#FF8383",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  mealCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  mealCategory: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  mealDate: {
    fontSize: 12,
    color: "#999",
  },
  mealNotes: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    paddingLeft: 44,
  },
  mealActions: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    gap: 12,
  },
  mealActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  mealActionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  recommendationModalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    marginTop: 60,
    marginHorizontal: 20,
    maxHeight: "85%",
    overflow: "hidden",
  },
  recommendationModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  closeButtonTop: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonTopText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "600",
  },
  recommendationModalScroll: {
    flex: 1,
  },
  recommendationModalContent: {
    padding: 24,
  },
  recommendationModal: {
    flex: 1,
    marginTop: 100,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "white",
  },
  categoryButtonActive: {
    backgroundColor: "#FF8383",
    borderColor: "#FF8383",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "white",
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#FF8383",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  recommendationMeal: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF8383",
    marginBottom: 12,
    textAlign: "center",
  },
  recommendationDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    lineHeight: 24,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  recipeCard: {
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  recipeActions: {
    flexDirection: "row",
    gap: 8,
  },
  recipeActionButton: {
    padding: 4,
  },
  recipeInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  recipeSection: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 12,
    marginBottom: 8,
  },
  recipeItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  reasoning: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    lineHeight: 20,
    flex: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mealIconContainer: {
    marginRight: 12,
  },
  categoryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  recipeTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  recipeInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  recipeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reasoningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F0F8FF",
    padding: 12,
    borderRadius: 8,
  },
});
