import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface VoteCardProps {
  company: "faysal" | "new";
  name: string;
  description: string;
  tagline: string;
  voteCount: number;
  percentage: number;
  hasVoted: boolean;
  isVotedFor: boolean;
  onVote: () => void;
}

export default function VoteCard({
  company,
  name,
  description,
  tagline,
  voteCount,
  percentage,
  hasVoted,
  isVotedFor,
  onVote,
}: VoteCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const primaryColor = company === "faysal" ? "#4F46E5" : "#10B981";
  const gradientColors: [string, string] =
    company === "faysal"
      ? ["rgba(79,70,229,0.22)", "rgba(79,70,229,0.06)"]
      : ["rgba(16,185,129,0.22)", "rgba(16,185,129,0.06)"];

  const handlePressIn = () => {
    if (hasVoted) return;
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 20 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  const handlePress = () => {
    if (hasVoted) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onVote();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={hasVoted}
        style={styles.pressable}
      >
        <LinearGradient
          colors={isVotedFor ? gradientColors : ["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
          style={[
            styles.card,
            isVotedFor && { borderColor: primaryColor, borderWidth: 1.5 },
            !isVotedFor && { borderColor: "rgba(255,255,255,0.1)", borderWidth: 1 },
          ]}
        >
          {isVotedFor && (
            <View style={[styles.votedBadge, { backgroundColor: primaryColor }]}>
              <Feather name="check" size={10} color="#fff" />
              <Text style={styles.votedBadgeText}>YOUR VOTE</Text>
            </View>
          )}

          <LinearGradient
            colors={[primaryColor, primaryColor + "99"]}
            style={styles.avatar}
          >
            <Text style={styles.avatarLetter}>{name[0].toUpperCase()}</Text>
          </LinearGradient>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.tagline}>{tagline}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.statsRow}>
            <Text style={[styles.percentage, { color: primaryColor }]}>{percentage}%</Text>
            <Text style={styles.voteCount}>{voteCount.toLocaleString()} votes</Text>
          </View>

          <LinearGradient
            colors={hasVoted ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.06)"] : [primaryColor, company === "faysal" ? "#7C3AED" : "#059669"]}
            style={styles.voteBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.voteBtnText, hasVoted && styles.voteBtnTextDisabled]}>
              {hasVoted ? (isVotedFor ? "Voted ✓" : "Voted") : "Vote"}
            </Text>
          </LinearGradient>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  pressable: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  votedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    alignSelf: "flex-end",
    marginBottom: 2,
  },
  votedBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarLetter: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  tagline: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  description: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 17,
    marginTop: 2,
  },
  statsRow: {
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  percentage: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  voteCount: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  voteBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },
  voteBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  voteBtnTextDisabled: {
    color: "rgba(255,255,255,0.3)",
  },
});
