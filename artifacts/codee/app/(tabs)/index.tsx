import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ConfettiOverlay from "@/components/ConfettiOverlay";
import ResultsBar from "@/components/ResultsBar";
import VoteCard from "@/components/VoteCard";
import { VoteProvider, useVote } from "@/context/VoteContext";

function getShareUrl(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "https://codee.replit.app";
}

function VotingContent() {
  const { votedFor, faysalVotes, newVotes, isLoading, vote } = useVote();
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedAnim] = useState(new Animated.Value(0));
  const [showCopied, setShowCopied] = useState(false);
  const insets = useSafeAreaInsets();

  const total = faysalVotes + newVotes;
  const faysalPct = total > 0 ? Math.round((faysalVotes / total) * 100) : 50;
  const newPct = total > 0 ? 100 - faysalPct : 50;
  const faysalIsWinner = faysalVotes > newVotes;
  const newIsWinner = newVotes > faysalVotes;

  const shareMessage = `🗳️ CODEE — Vote for the best LED lighting company!\n\n⚡ Faysal: ${faysalPct}%\n🌿 New: ${newPct}%\n\n${total.toLocaleString()} votes so far. Cast yours now 👇\n${getShareUrl()}`;

  const showCopiedToast = () => {
    setShowCopied(true);
    Animated.sequence([
      Animated.timing(copiedAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(copiedAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowCopied(false));
  };

  const handleShare = async () => {
    const url = getShareUrl();
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({ title: "CODEE Vote", text: shareMessage, url });
        } catch { /* user cancelled */ }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          showCopiedToast();
        } catch { /* ignore */ }
      }
      return;
    }
    try {
      await Share.share({ message: shareMessage, url });
    } catch { /* cancelled */ }
  };

  const handleWhatsApp = async () => {
    const encoded = encodeURIComponent(shareMessage);
    const nativeUrl = `whatsapp://send?text=${encoded}`;
    const webUrl = `https://wa.me/?text=${encoded}`;

    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.open(webUrl, "_blank");
      return;
    }
    const canOpen = await Linking.canOpenURL(nativeUrl);
    await Linking.openURL(canOpen ? nativeUrl : webUrl);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    if (Platform.OS === "web") {
      try {
        await navigator.clipboard.writeText(url);
        showCopiedToast();
      } catch { /* ignore */ }
      return;
    }
    try {
      await Share.share({ message: url });
    } catch { /* cancelled */ }
  };

  const handleVote = async (company: "faysal" | "new") => {
    await vote(company);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3200);
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

      {/* Copied toast */}
      {showCopied && (
        <Animated.View
          style={[
            styles.copiedToast,
            {
              opacity: copiedAnim,
              transform: [
                {
                  translateY: copiedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Feather name="check" size={14} color="#10B981" />
          <Text style={styles.copiedText}>Link copied!</Text>
        </Animated.View>
      )}

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
        </View>

        {/* Already voted banner */}
        {votedFor && (
          <View style={styles.votedBanner}>
            <Feather name="check-circle" size={15} color="#10B981" />
            <Text style={styles.votedBannerText}>
              You voted for{" "}
              <Text style={styles.votedBannerHighlight}>
                {votedFor === "faysal" ? "Faysal" : "New"}
              </Text>
              . Results are live below.
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

        {/* ── Share Section ── */}
        <LinearGradient
          colors={["rgba(79,70,229,0.12)", "rgba(16,185,129,0.06)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shareCard}
        >
          <View style={styles.shareHeaderRow}>
            <View style={styles.shareIconWrap}>
              <Feather name="share-2" size={15} color="#fff" />
            </View>
            <View>
              <Text style={styles.shareTitle}>Share this poll</Text>
              <Text style={styles.shareSub}>Let your friends vote too</Text>
            </View>
          </View>

          {/* Main share button */}
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [styles.mainShareBtn, pressed && { opacity: 0.85 }]}
          >
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.mainShareGradient}
            >
              <Feather name="share-2" size={16} color="#fff" />
              <Text style={styles.mainShareText}>Share Poll</Text>
            </LinearGradient>
          </Pressable>

          {/* Quick-share row */}
          <View style={styles.quickShareRow}>
            {/* WhatsApp */}
            <Pressable
              onPress={handleWhatsApp}
              style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.75 }]}
            >
              <LinearGradient
                colors={["rgba(37,211,102,0.18)", "rgba(37,211,102,0.08)"]}
                style={styles.quickBtnInner}
              >
                {/* WhatsApp icon via SVG-like unicode or feather fallback */}
                <View style={styles.whatsappIcon}>
                  <Text style={styles.whatsappEmoji}>💬</Text>
                </View>
                <Text style={[styles.quickBtnLabel, { color: "#25D366" }]}>WhatsApp</Text>
              </LinearGradient>
            </Pressable>

            {/* Twitter / X */}
            <Pressable
              onPress={async () => {
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
                if (Platform.OS === "web") {
                  window.open(url, "_blank");
                } else {
                  await Linking.openURL(url);
                }
              }}
              style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.75 }]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.09)", "rgba(255,255,255,0.04)"]}
                style={styles.quickBtnInner}
              >
                <Text style={styles.whatsappEmoji}>𝕏</Text>
                <Text style={styles.quickBtnLabel}>Twitter</Text>
              </LinearGradient>
            </Pressable>

            {/* Telegram */}
            <Pressable
              onPress={async () => {
                const url = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(shareMessage)}`;
                if (Platform.OS === "web") {
                  window.open(url, "_blank");
                } else {
                  await Linking.openURL(url);
                }
              }}
              style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.75 }]}
            >
              <LinearGradient
                colors={["rgba(0,136,204,0.18)", "rgba(0,136,204,0.08)"]}
                style={styles.quickBtnInner}
              >
                <Text style={styles.whatsappEmoji}>✈️</Text>
                <Text style={[styles.quickBtnLabel, { color: "#0088cc" }]}>Telegram</Text>
              </LinearGradient>
            </Pressable>

            {/* Copy link */}
            <Pressable
              onPress={handleCopyLink}
              style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.75 }]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.09)", "rgba(255,255,255,0.04)"]}
                style={styles.quickBtnInner}
              >
                <Feather name="link" size={15} color="rgba(255,255,255,0.6)" />
                <Text style={styles.quickBtnLabel}>Copy</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>

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
            <Text style={styles.totalText}>{total.toLocaleString()} total votes</Text>
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
  copiedToast: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(16,185,129,0.15)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    zIndex: 100,
  },
  copiedText: {
    color: "#10B981",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
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
  // ── Share Card ──
  shareCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(79,70,229,0.25)",
    gap: 14,
  },
  shareHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shareIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(79,70,229,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  shareTitle: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  shareSub: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  mainShareBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  mainShareGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
  },
  mainShareText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  quickShareRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  quickBtnInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  whatsappIcon: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  quickBtnLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  // ── Results ──
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
