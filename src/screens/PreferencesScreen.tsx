import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Settings02Icon,
  Add01Icon,
  CancelCircleIcon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import axios from "axios";
import NotificationSettings from "../components/NotificationSettings";
import ThemeSelector from "../components/ThemeSelector";
import { useTheme } from "../hooks/useTheme";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

interface PreferencesScreenProps {
  userId: string;
  onClose?: () => void;
}

interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteCuisines: string[];
  dislikedFoods: string[];
}

export default function PreferencesScreen({ userId, onClose }: PreferencesScreenProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    allergies: [],
    favoriteCuisines: [],
    dislikedFoods: [],
  });

  // States para agregar nuevos items
  const [newRestriction, setNewRestriction] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [newCuisine, setNewCuisine] = useState("");
  const [newDislikedFood, setNewDislikedFood] = useState("");

  const dietaryOptions = [
    "Vegetariano",
    "Vegano",
    "Sin gluten",
    "Sin lactosa",
    "Keto",
    "Paleo",
    "Bajo en carbohidratos",
    "Bajo en sodio",
  ];

  const cuisineOptions = [
    "Mexicana",
    "Italiana",
    "Asiática",
    "Japonesa",
    "China",
    "Mediterránea",
    "India",
    "Tailandesa",
    "Francesa",
    "Americana",
    "Española",
    "Peruana",
  ];

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/meals/preferences/${userId}`);
      if (response.data.success && response.data.preferences) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/meals/preferences`, {
        userId,
        preferences,
      });

      if (response.data.success) {
        Alert.alert("¡Guardado!", "Tus preferencias se guardaron correctamente");
        onClose?.();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudieron guardar las preferencias");
    } finally {
      setLoading(false);
    }
  };

  const toggleDietaryRestriction = (item: string) => {
    setPreferences((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(item)
        ? prev.dietaryRestrictions.filter((i) => i !== item)
        : [...prev.dietaryRestrictions, item],
    }));
  };

  const toggleCuisine = (item: string) => {
    setPreferences((prev) => ({
      ...prev,
      favoriteCuisines: prev.favoriteCuisines.includes(item)
        ? prev.favoriteCuisines.filter((i) => i !== item)
        : [...prev.favoriteCuisines, item],
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setPreferences((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (item: string) => {
    setPreferences((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((i) => i !== item),
    }));
  };

  const addDislikedFood = () => {
    if (newDislikedFood.trim()) {
      setPreferences((prev) => ({
        ...prev,
        dislikedFoods: [...prev.dislikedFoods, newDislikedFood.trim()],
      }));
      setNewDislikedFood("");
    }
  };

  const removeDislikedFood = (item: string) => {
    setPreferences((prev) => ({
      ...prev,
      dislikedFoods: prev.dislikedFoods.filter((i) => i !== item),
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerTitleContainer}>
          <HugeiconsIcon icon={Settings02Icon} size={24} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Preferencias</Text>
        </View>
        {onClose && <View style={{ width: 24 }} />}
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Tema */}
        <View style={styles.section}>
          <ThemeSelector />
        </View>

        {/* Restricciones Dietéticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restricciones Dietéticas</Text>
          <Text style={styles.sectionSubtitle}>
            Selecciona tus restricciones alimentarias
          </Text>
          <View style={styles.optionsGrid}>
            {dietaryOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionChip,
                  preferences.dietaryRestrictions.includes(option) &&
                    styles.optionChipActive,
                ]}
                onPress={() => toggleDietaryRestriction(option)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    preferences.dietaryRestrictions.includes(option) &&
                      styles.optionChipTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Alergias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alergias</Text>
          <Text style={styles.sectionSubtitle}>
            Agrega los alimentos a los que eres alérgico
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ej: Cacahuates, Mariscos..."
              value={newAllergy}
              onChangeText={setNewAllergy}
              onSubmitEditing={addAllergy}
            />
            <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
              <HugeiconsIcon icon={Add01Icon} size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsList}>
            {preferences.allergies.map((allergy, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{allergy}</Text>
                <TouchableOpacity onPress={() => removeAllergy(allergy)}>
                  <HugeiconsIcon icon={CancelCircleIcon} size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Cocinas Favoritas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cocinas Favoritas</Text>
          <Text style={styles.sectionSubtitle}>
            Selecciona tus cocinas preferidas
          </Text>
          <View style={styles.optionsGrid}>
            {cuisineOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionChip,
                  preferences.favoriteCuisines.includes(option) &&
                    styles.optionChipActive,
                ]}
                onPress={() => toggleCuisine(option)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    preferences.favoriteCuisines.includes(option) &&
                      styles.optionChipTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comidas que no te gustan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comidas que no te gustan</Text>
          <Text style={styles.sectionSubtitle}>
            Agrega alimentos que prefieres evitar
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ej: Brócoli, Hígado..."
              value={newDislikedFood}
              onChangeText={setNewDislikedFood}
              onSubmitEditing={addDislikedFood}
            />
            <TouchableOpacity style={styles.addButton} onPress={addDislikedFood}>
              <HugeiconsIcon icon={Add01Icon} size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsList}>
            {preferences.dislikedFoods.map((food, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{food}</Text>
                <TouchableOpacity onPress={() => removeDislikedFood(food)}>
                  <HugeiconsIcon icon={CancelCircleIcon} size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <NotificationSettings />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={savePreferences}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Preferencias</Text>
          )}
        </TouchableOpacity>
      </View>
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
  section: {
    padding: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "white",
  },
  optionChipActive: {
    backgroundColor: "#FF8383",
    borderColor: "#FF8383",
  },
  optionChipText: {
    fontSize: 14,
    color: "#666",
  },
  optionChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  addButton: {
    backgroundColor: "#FF8383",
    borderRadius: 12,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  chipsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  chipText: {
    fontSize: 14,
    color: "#000",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  saveButton: {
    backgroundColor: "#FF8383",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
