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
  TextInput,
  Modal,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ArrowLeft01Icon,
  Delete02Icon,
  Share01Icon,
  ShoppingBasket01Icon,
  CheckmarkCircle01Icon,
  PlusSignIcon,
  Edit02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import {
  getShoppingList,
  toggleShoppingListItem,
  deleteShoppingListItem,
  addShoppingListItem,
  clearCheckedItems,
  type ShoppingListItem,
} from "../services/shoppingList";
import { useTheme } from "../hooks/useTheme";

interface ShoppingListScreenProps {
  userId: string;
  onClose?: () => void;
}

export default function ShoppingListScreen({
  userId,
  onClose,
}: ShoppingListScreenProps) {
  const { theme } = useTheme();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Otros");

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const result = await getShoppingList(userId, true);
      if (result.success) {
        setItems(result.items || []);
      }
    } catch (error) {
      console.error("Error loading shopping list:", error);
      Alert.alert("Error", "No se pudo cargar la lista de compras");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      await toggleShoppingListItem(itemId, userId);
      loadShoppingList();
    } catch (error) {
      console.error("Error toggling item:", error);
      Alert.alert("Error", "No se pudo actualizar el item");
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    Alert.alert(
      "Eliminar item",
      `¿Eliminar "${itemName}" de la lista?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteShoppingListItem(itemId, userId);
              loadShoppingList();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el item");
            }
          },
        },
      ]
    );
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert("Error", "Ingresa un nombre para el item");
      return;
    }

    try {
      await addShoppingListItem(userId, {
        name: newItemName.trim(),
        quantity: newItemQuantity.trim() || undefined,
        category: newItemCategory,
        sourceType: "manual",
      });

      setNewItemName("");
      setNewItemQuantity("");
      setNewItemCategory("Otros");
      setAddModalVisible(false);
      loadShoppingList();
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el item");
    }
  };

  const handleClearChecked = async () => {
    const checkedCount = items.filter((item) => item.checked).length;
    if (checkedCount === 0) {
      Alert.alert("Info", "No hay items marcados para limpiar");
      return;
    }

    Alert.alert(
      "Limpiar comprados",
      `¿Eliminar ${checkedCount} items marcados?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: async () => {
            try {
              await clearCheckedItems(userId);
              loadShoppingList();
            } catch (error) {
              Alert.alert("Error", "No se pudieron limpiar los items");
            }
          },
        },
      ]
    );
  };

  const handleShareList = async () => {
    try {
      const uncheckedItems = items.filter((item) => !item.checked);
      if (uncheckedItems.length === 0) {
        Alert.alert("Info", "No hay items para compartir");
        return;
      }

      // Agrupar por categoría
      const grouped: { [key: string]: ShoppingListItem[] } = {};
      uncheckedItems.forEach((item) => {
        const category = item.category || "Otros";
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(item);
      });

      let message = "🛒 Lista de Compras\n\n";
      Object.keys(grouped).forEach((category) => {
        message += `📦 ${category}\n`;
        grouped[category].forEach((item) => {
          message += `  • ${item.name}${item.quantity ? ` (${item.quantity})` : ""}\n`;
        });
        message += "\n";
      });

      message += "Compartido desde Meal Buddy 🤖";

      await Share.share({ message });
    } catch (error: any) {
      console.error("Error sharing list:", error);
    }
  };

  const uncheckedItems = items.filter((item) => !item.checked);
  const checkedItems = items.filter((item) => item.checked);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerTitleContainer}>
          <HugeiconsIcon
            icon={ShoppingBasket01Icon}
            size={24}
            color="#4CAF50"
            variant="solid"
          />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Lista de Compras</Text>
        </View>
        {onClose && <View style={{ width: 24 }} />}
      </View>

      <View style={[styles.actionsBar, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setAddModalVisible(true)}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Agregar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShareList}
        >
          <HugeiconsIcon icon={Share01Icon} size={20} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClearChecked}
        >
          <HugeiconsIcon icon={Delete02Icon} size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <HugeiconsIcon
              icon={ShoppingBasket01Icon}
              size={64}
              color={theme.textTertiary}
              variant="stroke"
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Tu lista está vacía</Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Agrega items manualmente o desde tus recetas favoritas
            </Text>
          </View>
        ) : (
          <>
            {uncheckedItems.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Por Comprar ({uncheckedItems.length})
                </Text>
                {uncheckedItems.map((item) => (
                  <View key={item.id} style={[styles.itemCard, { backgroundColor: theme.backgroundCard }]}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => handleToggleItem(item.id)}
                    >
                      <View style={styles.checkbox} />
                    </TouchableOpacity>

                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                      {item.quantity && (
                        <Text style={[styles.itemQuantity, { color: theme.textSecondary }]}>{item.quantity}</Text>
                      )}
                      {item.category && (
                        <Text style={[styles.itemCategory, { color: theme.textTertiary }]}>{item.category}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item.id, item.name)}
                      style={styles.deleteButton}
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={20}
                        color="#FF6B6B"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {checkedItems.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Comprados ({checkedItems.length})
                </Text>
                {checkedItems.map((item) => (
                  <View key={item.id} style={[styles.itemCard, styles.checkedCard, { backgroundColor: theme.backgroundSecondary }]}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => handleToggleItem(item.id)}
                    >
                      <View style={styles.checkedCheckbox}>
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          size={24}
                          color="#4CAF50"
                          variant="solid"
                        />
                      </View>
                    </TouchableOpacity>

                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, styles.checkedText, { color: theme.textTertiary }]}>
                        {item.name}
                      </Text>
                      {item.quantity && (
                        <Text style={[styles.itemQuantity, styles.checkedText, { color: theme.textTertiary }]}>
                          {item.quantity}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item.id, item.name)}
                      style={styles.deleteButton}
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={20}
                        color={theme.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal para agregar item */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Agregar Item</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <HugeiconsIcon icon={Cancel01Icon} size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
              placeholder="Nombre del item"
              placeholderTextColor={theme.textTertiary}
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
            />

            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
              placeholder="Cantidad (opcional)"
              placeholderTextColor={theme.textTertiary}
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
            />

            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
              placeholder="Categoría (opcional)"
              placeholderTextColor={theme.textTertiary}
              value={newItemCategory}
              onChangeText={setNewItemCategory}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.backgroundSecondary }]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddItem}
              >
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  actionsBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  shareButton: {
    flex: 0,
    backgroundColor: "#2196F3",
  },
  clearButton: {
    flex: 0,
    backgroundColor: "#FF6B6B",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
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
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  checkedCard: {
    backgroundColor: "#F9F9F9",
    opacity: 0.7,
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "#FFF",
  },
  checkedCheckbox: {
    width: 24,
    height: 24,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemCategory: {
    fontSize: 12,
    color: "#999",
  },
  checkedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#F9F9F9",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#4CAF50",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
