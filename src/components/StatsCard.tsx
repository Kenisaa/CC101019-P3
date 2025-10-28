import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Restaurant01Icon,
  Fire02Icon,
  Calendar03Icon,
  Trophy01Icon,
} from "@hugeicons/core-free-icons";
import { getUserStats, type UserStats } from "../services/meals";

interface StatsCardProps {
  userId: string;
}

export default function StatsCard({ userId }: StatsCardProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await getUserStats(userId);
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8383" />
      </View>
    );
  }

  if (!stats) {
    return null;
  }

  const getCategoryEmoji = (category: string) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu Progreso</Text>

      <View style={styles.statsGrid}>
        {/* Racha */}
        <View style={[styles.statCard, styles.streakCard]}>
          <View style={styles.iconContainer}>
            <HugeiconsIcon icon={Fire02Icon} size={28} color="#FF6B35" />
          </View>
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Racha de días</Text>
        </View>

        {/* Comidas este mes */}
        <View style={[styles.statCard, styles.monthCard]}>
          <View style={styles.iconContainer}>
            <HugeiconsIcon icon={Calendar03Icon} size={28} color="#66BB6A" />
          </View>
          <Text style={styles.statValue}>{stats.mealsThisMonth}</Text>
          <Text style={styles.statLabel}>Este mes</Text>
        </View>

        {/* Total comidas */}
        <View style={[styles.statCard, styles.totalCard]}>
          <View style={styles.iconContainer}>
            <HugeiconsIcon icon={Restaurant01Icon} size={28} color="#5C6BC0" />
          </View>
          <Text style={styles.statValue}>{stats.totalMeals}</Text>
          <Text style={styles.statLabel}>Total comidas</Text>
        </View>

        {/* Categoría favorita */}
        <View style={[styles.statCard, styles.categoryCard]}>
          <View style={styles.iconContainer}>
            <HugeiconsIcon icon={Trophy01Icon} size={28} color="#FFA726" />
          </View>
          {stats.topCategory ? (
            <>
              <Text style={styles.categoryEmoji}>
                {getCategoryEmoji(stats.topCategory.category)}
              </Text>
              <Text style={styles.statLabel}>
                {stats.topCategory.category.charAt(0).toUpperCase() +
                  stats.topCategory.category.slice(1)}
              </Text>
              <Text style={styles.categoryCount}>
                {stats.topCategory.count} veces
              </Text>
            </>
          ) : (
            <Text style={styles.statLabel}>Sin datos</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 120,
    justifyContent: "center",
  },
  streakCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
  },
  monthCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#66BB6A",
  },
  totalCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#5C6BC0",
  },
  categoryCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FFA726",
  },
  iconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
});
