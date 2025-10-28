import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  CancelCircleIcon,
  CheckmarkCircle01Icon,
  Trophy01Icon,
} from "@hugeicons/core-free-icons";

interface PremiumUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PremiumUpgradeModal({
  visible,
  onClose,
}: PremiumUpgradeModalProps) {
  const features = {
    free: [
      "3 recomendaciones por día",
      "10 recetas favoritas",
      "Historial de 7 días",
      "1 receta por recomendación",
      "Dashboard de estadísticas",
    ],
    premium: [
      "Recomendaciones ilimitadas",
      "Recetas favoritas ilimitadas",
      "Historial de 365 días",
      "3 recetas por recomendación",
      "Dashboard de estadísticas",
      "Planificador semanal",
      "Organiza todas tus comidas",
      "Sincronización en la nube",
    ],
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <HugeiconsIcon icon={CancelCircleIcon} size={24} color="#666" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <HugeiconsIcon icon={Trophy01Icon} size={48} color="#FFD700" />
              <Text style={styles.title}>Actualiza a Premium</Text>
              <Text style={styles.subtitle}>
                Desbloquea todas las funciones y lleva tu planificación de comidas
                al siguiente nivel
              </Text>
            </View>

            <View style={styles.comparisonContainer}>
              {/* Free Plan */}
              <View style={styles.planColumn}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Free</Text>
                  <Text style={styles.planPrice}>$0</Text>
                </View>
                <View style={styles.featuresList}>
                  {features.free.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        size={16}
                        color="#999"
                      />
                      <Text style={styles.featureTextFree}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Premium Plan */}
              <View style={[styles.planColumn, styles.premiumColumn]}>
                <View style={[styles.planHeader, styles.premiumHeader]}>
                  <Text style={styles.planNamePremium}>Premium</Text>
                  <Text style={styles.planPricePremium}>$3.99</Text>
                  <Text style={styles.planPeriod}>/mes</Text>
                </View>
                <View style={styles.featuresList}>
                  {features.premium.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        size={16}
                        color="#FFD700"
                      />
                      <Text style={styles.featureTextPremium}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>
                ¿Por qué elegir Premium?
              </Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitEmoji}>📅</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Planificador Semanal</Text>
                  <Text style={styles.benefitDesc}>
                    Organiza todas las comidas de tu semana de forma visual y
                    práctica
                  </Text>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitEmoji}>♾️</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Sin límites</Text>
                  <Text style={styles.benefitDesc}>
                    Recomendaciones y favoritos ilimitados para explorar más
                    recetas
                  </Text>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitEmoji}>🍽️</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Más recetas</Text>
                  <Text style={styles.benefitDesc}>
                    Obtén 3 recetas por cada recomendación para más variedad
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.upgradeButton}>
              <HugeiconsIcon icon={Trophy01Icon} size={20} color="white" />
              <Text style={styles.upgradeButtonText}>
                Actualizar a Premium - $3.99/mes
              </Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Próximamente: Integración de pagos con RevenueCat
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: "92%",
    maxHeight: "90%",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#000",
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  comparisonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  planColumn: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    overflow: "hidden",
  },
  premiumColumn: {
    backgroundColor: "#FFF9E6",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  planHeader: {
    padding: 16,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  premiumHeader: {
    backgroundColor: "#FFD700",
  },
  planName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  planNamePremium: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  planPricePremium: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  planPeriod: {
    fontSize: 12,
    color: "#666",
  },
  featuresList: {
    padding: 12,
    gap: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  featureTextFree: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  featureTextPremium: {
    flex: 1,
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
    lineHeight: 16,
  },
  benefitsSection: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  benefitEmoji: {
    fontSize: 28,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: "row",
    backgroundColor: "#FFD700",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
});
