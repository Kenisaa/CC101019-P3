import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Welcome"
>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      {/* Top Decorative Background */}
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
        <View style={styles.backgroundCircle3} />
      </View>

      {/* Wave Effect */}
      <View style={styles.waveContainer}>
        <Svg
          height="100"
          width={Dimensions.get("window").width}
          viewBox={`0 0 ${Dimensions.get("window").width} 100`}
          style={styles.wave}
        >
          <Path
            d={`M0,40 Q${Dimensions.get("window").width / 4},0 ${
              Dimensions.get("window").width / 2
            },40 T${Dimensions.get("window").width},40 L${Dimensions.get(
              "window"
            ).width},100 L0,100 Z`}
            fill="#FFFFFF"
          />
        </Svg>
      </View>

      {/* Bottom Content */}
      <View style={styles.bottomContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Bienvenido</Text>
          <Text style={styles.descriptionText}>
            Descubre recetas deliciosas y gestiona tus comidas con la ayuda de
            nuestra IA
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate("Auth")}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundContainer: {
    height: "70%",
    width: "100%",
    backgroundColor: "#FF8383",
    position: "relative",
    overflow: "hidden",
  },
  backgroundCircle1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    top: -80,
    right: -120,
  },
  backgroundCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    bottom: 50,
    left: -80,
  },
  backgroundCircle3: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: "40%",
    right: -40,
  },
  waveContainer: {
    position: "absolute",
    top: "70%",
    left: 0,
    right: 0,
    height: 100,
    marginTop: -50,
  },
  wave: {
    position: "absolute",
    bottom: 0,
  },
  bottomContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "space-between",
  },
  textContainer: {
    gap: 16,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#333",
  },
  descriptionText: {
    fontSize: 16,
    color: "#999",
    lineHeight: 24,
    maxWidth: "80%",
  },
  continueButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    alignSelf: "flex-end",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#999",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#999",
  },
});
