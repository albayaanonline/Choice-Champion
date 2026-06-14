import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ConfettiOverlay from "@/components/ConfettiOverlay";
import ResultsBar from "@/components/ResultsBar";
import VoteCard from "@/components/VoteCard";
import { VoteProvider, useVote } from "@/context/VoteContext";

function VotingContent() {
  const { votedFor, faysalVotes, newVotes, isLoading, vote, resetVotes } = useVote();
  const [showConfetti, setShowConfetti] = useState(false);
  const insets = useSafeAreaInsets();

  const total = faysalVotes + newVotes;
  const faysalPct = total > 0 ? Math.round((faysalVotes / total) * 100) : 50;
  const newPct = total > 0 ? 100 - faysalPct : 50;

  const faysalIsWinner = faysalVotes > newVotes;
  const newIsWinner = newVotes > faysalVotes;

  const handleVote = async (company: "faysal" | "new") => {
    await vote(company);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3200);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Votes",
      "This will reset your vote and restore default counts. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: resetVotes,
        },
      ]
    );
  };

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  if (isLoading) {
    return (
      <View style={[styles.root, { paddingTop: topPad }]}>
        <LinearGradient colors={["#0D0E2A", "#1A1040", "#0D1F35"]} style={StyleSheet.absoluteFill} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0D0E2A", "#1A1040", "#0D1F35"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ConfettiOverlay visible={showConfetti} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: botPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={["#4F46E5", "#10B981"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoGradient}
          >
            <Feather name="zap" size={18} color="#fff" />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.logoText}>CODEE</Text>
            <Text style={styles.subtitle}>Vote for the best LED lighting company</Text>
          </View>
          <Pressable onPress={handleReset} style={styles.resetBtn} hitSlop={8}>
            <Feather name="refresh-cw" size={16} color="rgba(255,255,255,0.35)" />
          </Pressable>
        </View>

        {/* Already voted banner */}
        {votedFor && (
          <View style={styles.votedBanner}>
            <Feather name="check-circle" size={15} color="#10B981" />
            <Text style={styles.votedBannerText}>
              You voted for <Text style={styles.votedBannerHighlight}>{votedFor === "faysal" ? "Faysal" : "New"}</Text>. Results are live below.
            </Text>
          </View>
        )}

        {/* Cards */}
        <View style={styles.cardsRow}>
          <VoteCard
            company="faysal"
            name="Faysal"
            tagline="PREMIUM LED"
            description="Trusted quality with decades of experience in high-performance lighting."
            voteCount={faysalVotes}
            percentage={faysalPct}
            hasVoted={!!votedFor}
            isVotedFor={votedFor === "faysal"}
            onVote={() => handleVote("faysal")}
          />
          <View style={styles.vsContainer}>
            <View style={styles.vsDivider} />
            <View style={styles.vsCircle}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.vsDivider} />
          </View>
          <VoteCard
            company="new"
            name="New"
            tagline="INNOVATION LED"
            description="Next-generation LED technology pushing the boundaries of efficiency."
            voteCount={newVotes}
            percentage={newPct}
            hasVoted={!!votedFor}
            isVotedFor={votedFor === "new"}
            onVote={() => handleVote("new")}
          />
        </View>

        {/* Live Results */}
        <LinearGradient
          colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
          style={styles.resultsCard}
        >
          <View style={styles.resultsTitleRow}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.resultsTitle}>Results</Text>
          </View>

          <View style={styles.barsContainer}>
            <ResultsBar
              label="Faysal"
              percentage={faysalPct}
              voteCount={faysalVotes}
              color="#4F46E5"
              isWinner={faysalIsWinner}
            />
            <ResultsBar
              label="New"
              percentage={newPct}
              voteCount={newVotes}
              color="#10B981"
              isWinner={newIsWinner}
            />
          </View>

          <View style={styles.totalRow}>
            <Feather name="users" size={13} color="rgba(255,255,255,0.3)" />
            <Text style={styles.totalText}>
              {total.toLocaleString()} total votes
            </Text>
          </View>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Feather name="zap" size={12} color="rgba(255,255,255,0.2)" />
          <Text style={styles.footerText}>Powered by Codee Voting System</Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default function VoteScreen() {
  return (
    <VoteProvider>
      <VotingContent />
    </VoteProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0E2A",
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  logoGradient: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  logoText: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
  subtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  resetBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  votedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16,185,129,0.1)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.25)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  votedBannerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  votedBannerHighlight: {
    color: "#10B981",
    fontFamily: "Inter_600SemiBold",
  },
  cardsRow: {
    flexDirection: "row",
    gap: 0,
    alignItems: "stretch",
  },
  vsContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    gap: 6,
  },
  vsDivider: {
    flex: 1,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  vsCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  vsText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  resultsCard: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  resultsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(239,68,68,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
  liveText: {
    color: "#EF4444",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  resultsTitle: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  barsContainer: {
    gap: 16,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 14,
  },
  totalText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 4,
  },
  footerText: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
});
