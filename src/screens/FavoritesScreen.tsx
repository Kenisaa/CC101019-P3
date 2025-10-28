import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  FavouriteIcon,
  ArrowLeft01Icon,
  Delete02Icon,
  Share01Icon,
  Clock01Icon,
  Chart01Icon,
} from "@hugeicons/core-free-icons";
import {
  getFavoriteRecipes,
  removeFavoriteRecipe,
  type FavoriteRecipe,
} from "../services/favorites";

interface FavoritesScreenProps {
  userId: string;
  onClose: () => void;
}

export default function FavoritesScreen({
  userId,
  onClose,
}: FavoritesScreenProps) {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const result = await getFavoriteRecipes(userId);
      if (result.success) {
        setFavorites(result.favorites || []);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      Alert.alert("Error", "No se pudieron cargar los favoritos");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    Alert.alert(
      "Eliminar favorito",
      "¿Estás seguro que deseas eliminar esta receta de favoritos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await removeFavoriteRecipe(favoriteId, userId);
              if (result.success) {
                Alert.alert("¡Éxito!", "Receta eliminada de favoritos");
                loadFavorites();
              }
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "No se pudo eliminar la receta"
              );
            }
          },
        },
      ]
    );
  };

  const handleShareRecipe = async (favorite: FavoriteRecipe) => {
    try {
      const recipe = favorite.recipeData;
      const message =
        `🍽️ Receta: ${recipe.name}\n\n` +
        `⏱️ Tiempo: ${recipe.prepTime}\n` +
        `📊 Dificultad: ${recipe.difficulty}\n\n` +
        `📝 Ingredientes:\n${recipe.ingredients.map((i) => `• ${i}`).join("\n")}\n\n` +
        `👨‍🍳 Instrucciones:\n${recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n")}\n\n` +
        `Compartido desde Meal Buddy 🤖`;

      await Share.share({
        message,
      });
    } catch (error: any) {
      console.error("Error sharing recipe:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <HugeiconsIcon icon={FavouriteIcon} size={24} color="#FF8383" variant="solid" />
          <Text style={styles.headerTitle}>Recetas Favoritas</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF8383" />
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <HugeiconsIcon icon={FavouriteIcon} size={64} color="#DDD" variant="stroke" />
            <Text style={styles.emptyText}>
              No tienes recetas favoritas aún
            </Text>
            <Text style={styles.emptySubtext}>
              Guarda tus recetas favoritas desde las recomendaciones de IA
            </Text>
          </View>
        ) : (
          favorites.map((favorite) => (
            <View key={favorite.id} style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <HugeiconsIcon icon={FavouriteIcon} size={20} color="#FF8383" variant="solid" />
                <Text style={styles.recipeName}>{favorite.recipeData.name}</Text>
              </View>

              <View style={styles.recipeInfoContainer}>
                <View style={styles.recipeInfoItem}>
                  <HugeiconsIcon icon={Clock01Icon} size={16} color="#666" />
                  <Text style={styles.recipeInfo}>
                    {favorite.recipeData.prepTime}
                  </Text>
                </View>
                <Text style={styles.recipeInfo}>•</Text>
                <View style={styles.recipeInfoItem}>
                  <HugeiconsIcon icon={Chart01Icon} size={16} color="#666" />
                  <Text style={styles.recipeInfo}>
                    {favorite.recipeData.difficulty}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Ingredientes:</Text>
              {favorite.recipeData.ingredients.map((ingredient, i) => (
                <Text key={i} style={styles.listItem}>
                  • {ingredient}
                </Text>
              ))}

              <Text style={styles.sectionTitle}>Instrucciones:</Text>
              {favorite.recipeData.instructions.map((instruction, i) => (
                <Text key={i} style={styles.listItem}>
                  {i + 1}. {instruction}
                </Text>
              ))}

              <View style={styles.recipeActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={() => handleShareRecipe(favorite)}
                >
                  <HugeiconsIcon icon={Share01Icon} size={20} color="#666" />
                  <Text style={styles.actionButtonText}>Compartir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleRemoveFavorite(favorite.id)}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={20} color="#FF8383" />
                  <Text style={[styles.actionButtonText, { color: "#FF8383" }]}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  recipeCard: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  recipeInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  recipeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recipeInfo: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 12,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  recipeActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareButton: {
    backgroundColor: "#F5F5F5",
  },
  deleteButton: {
    backgroundColor: "#FFF0F0",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
});
