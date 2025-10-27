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
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import {
  addMeal,
  getMealHistory,
  generateRecommendation,
  type Meal,
  type Recommendation,
} from "../services/meals";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "desayuno":
        return "🌅";
      case "almuerzo":
        return "🍽️";
      case "cena":
        return "🌙";
      case "snack":
        return "🍿";
      default:
        return "🍴";
    }
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
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => setShowAddMeal(true)}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>➕ Agregar Comida</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleGetRecommendation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FF8383" />
            ) : (
              <Text style={styles.actionButtonTextSecondary}>🤖 Recomendar con IA</Text>
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
                  <Text style={styles.mealIcon}>
                    {getCategoryIcon(meal.category)}
                  </Text>
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
        onRequestClose={() => setShowAddMeal(false)}
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
                    mealCategory === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setMealCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      mealCategory === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
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
                onPress={() => setShowAddMeal(false)}
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
              <Text style={styles.modalTitle}>🤖 Recomendación IA</Text>
              <TouchableOpacity
                style={styles.closeButtonTop}
                onPress={() => setShowRecommendation(false)}
              >
                <Text style={styles.closeButtonTopText}>✕</Text>
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

                  <Text style={styles.recipeTitle}>📝 Receta</Text>
                  {recommendation.recipes.map((recipe, index) => (
                    <View key={index} style={styles.recipeCard}>
                      <Text style={styles.recipeName}>{recipe.name}</Text>
                      <Text style={styles.recipeInfo}>
                        ⏱️ {recipe.prepTime} • 📊 {recipe.difficulty}
                      </Text>

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

                  <Text style={styles.reasoning}>
                    💡 {recommendation.reasoning}
                  </Text>
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
  recipeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
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
    backgroundColor: "#F0F8FF",
    padding: 12,
    borderRadius: 8,
  },
});
