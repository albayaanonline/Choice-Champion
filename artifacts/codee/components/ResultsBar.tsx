import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface ResultsBarProps {
  label: string;
  percentage: number;
  voteCount: number;
  color: string;
  isWinner: boolean;
}

export default function ResultsBar({
  label,
  percentage,
  voteCount,
  color,
  isWinner,
}: ResultsBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const prevPercent = useRef(0);

  useEffect(() => {
    if (percentage !== prevPercent.current) {
      prevPercent.current = percentage;
      Animated.timing(widthAnim, {
        toValue: percentage,
        duration: 900,
        useNativeDriver: false,
      }).start();
    }
  }, [percentage]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={styles.labelLeft}>
          {isWinner && <View style={[styles.winnerDot, { backgroundColor: color }]} />}
          <Text style={[styles.label, isWinner && styles.labelWinner]}>{label}</Text>
        </View>
        <View style={styles.labelRight}>
          <Text style={[styles.percent, { color }]}>{percentage}%</Text>
          <Text style={styles.count}>{voteCount.toLocaleString()}</Text>
        </View>
      </View>
      <View style={[styles.track, { borderColor: "rgba(255,255,255,0.06)" }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color, width: animatedWidth },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  labelRight: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  winnerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  labelWinner: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter_600SemiBold",
  },
  percent: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  count: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  track: {
    height: 8,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    borderWidth: 1,
  },
  fill: {
    height: "100%",
    borderRadius: 100,
  },
});
