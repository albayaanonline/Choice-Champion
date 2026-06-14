import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}/api` : "/api";
}

interface Stats {
  totals: { faysal: number; new: number };
  totalAll: number;
  last24h: { faysal: number; new: number };
  faysalPct: number;
  newPct: number;
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: string;
}) {
  return (
    <LinearGradient
      colors={[`${color}18`, `${color}08`]}
      style={[styles.statCard, { borderColor: `${color}28` }]}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}22` }]}>
        <Feather name={icon as any} size={15} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </LinearGradient>
  );
}

export default function ManagementPortal() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const insets = useSafeAreaInsets();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBase()}/votes/stats`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats(data);
      setLastRefreshed(new Date());
    } catch {
      // keep old stats
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleReset = () => {
    Alert.alert(
      "⚠️ Reset All Votes",
      "This will permanently delete ALL votes from the database. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            setResetting(true);
            try {
              const res = await fetch(`${getApiBase()}/votes/reset`, {
                method: "DELETE",
              });
              if (res.ok) {
                await fetchStats();
                Alert.alert("Done", "All votes have been reset successfully.");
              } else {
                Alert.alert("Error", "Failed to reset votes.");
              }
            } catch {
              Alert.alert("Error", "Network error. Could not reset votes.");
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0D0E2A", "#1A1040", "#0D1F35"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: botPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.adminBadge}>
              <Feather name="shield" size={13} color="#F59E0B" />
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
            <Text style={styles.title}>Management Portal</Text>
            {lastRefreshed && (
              <Text style={styles.lastRefreshed}>
                Updated {lastRefreshed.toLocaleTimeString()}
              </Text>
            )}
          </View>
          <Pressable onPress={fetchStats} style={styles.refreshBtn} hitSlop={8}>
            <Feather name="refresh-cw" size={16} color="rgba(255,255,255,0.5)" />
          </Pressable>
        </View>

        {/* URL hint */}
        <View style={styles.urlBar}>
          <Feather name="lock" size={11} color="rgba(255,255,255,0.25)" />
          <Text style={styles.urlText}>albayaan.pro/management-portal</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#4F46E5" size="large" />
            <Text style={styles.loadingText}>Loading stats…</Text>
          </View>
        ) : stats ? (
          <>
            {/* Overview Cards */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Total Votes"
                value={stats.totalAll.toLocaleString()}
                sub="all time"
                color="#4F46E5"
                icon="bar-chart-2"
              />
              <StatCard
                label="Last 24 Hours"
                value={(stats.last24h.faysal + stats.last24h.new).toLocaleString()}
                sub="new votes"
                color="#10B981"
                icon="clock"
              />
            </View>

            {/* Detailed Breakdown */}
            <LinearGradient
              colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
              style={styles.breakdownCard}
            >
              <Text style={styles.sectionTitle}>Vote Breakdown</Text>

              <View style={styles.companyRow}>
                <View style={styles.companyLeft}>
                  <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.companyDot} />
                  <Text style={styles.companyName}>Faysal</Text>
                </View>
                <View style={styles.companyRight}>
                  <Text style={[styles.companyPct, { color: "#4F46E5" }]}>
                    {stats.faysalPct}%
                  </Text>
                  <Text style={styles.companyCount}>
                    {stats.totals.faysal.toLocaleString()} votes
                  </Text>
                </View>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${stats.faysalPct}%` as any,
                      backgroundColor: "#4F46E5",
                    },
                  ]}
                />
              </View>

              <View style={[styles.companyRow, { marginTop: 16 }]}>
                <View style={styles.companyLeft}>
                  <LinearGradient colors={["#10B981", "#059669"]} style={styles.companyDot} />
                  <Text style={styles.companyName}>New</Text>
                </View>
                <View style={styles.companyRight}>
                  <Text style={[styles.companyPct, { color: "#10B981" }]}>
                    {stats.newPct}%
                  </Text>
                  <Text style={styles.companyCount}>
                    {stats.totals.new.toLocaleString()} votes
                  </Text>
                </View>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${stats.newPct}%` as any,
                      backgroundColor: "#10B981",
                    },
                  ]}
                />
              </View>

              {stats.totalAll > 0 && (
                <View style={styles.winnerBanner}>
                  <Feather name="award" size={14} color="#F59E0B" />
                  <Text style={styles.winnerText}>
                    {stats.faysalPct > stats.newPct
                      ? "Faysal is currently leading"
                      : stats.newPct > stats.faysalPct
                      ? "New is currently leading"
                      : "It's a tie!"}
                  </Text>
                </View>
              )}
            </LinearGradient>

            {/* 24h breakdown */}
            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
              style={styles.breakdownCard}
            >
              <Text style={styles.sectionTitle}>Last 24 Hours</Text>
              <View style={styles.recentRow}>
                <View style={styles.recentItem}>
                  <Text style={[styles.recentNum, { color: "#4F46E5" }]}>
                    {stats.last24h.faysal}
                  </Text>
                  <Text style={styles.recentLabel}>Faysal votes</Text>
                </View>
                <View style={styles.recentDivider} />
                <View style={styles.recentItem}>
                  <Text style={[styles.recentNum, { color: "#10B981" }]}>
                    {stats.last24h.new}
                  </Text>
                  <Text style={styles.recentLabel}>New votes</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Danger Zone */}
            <LinearGradient
              colors={["rgba(239,68,68,0.08)", "rgba(239,68,68,0.03)"]}
              style={[styles.breakdownCard, { borderColor: "rgba(239,68,68,0.2)" }]}
            >
              <View style={styles.dangerHeader}>
                <Feather name="alert-triangle" size={15} color="#EF4444" />
                <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>Danger Zone</Text>
              </View>
              <Text style={styles.dangerDesc}>
                Resetting votes permanently deletes all records from the database. This cannot be undone.
              </Text>
              <Pressable
                onPress={handleReset}
                disabled={resetting}
                style={({ pressed }) => [
                  styles.resetBtn,
                  pressed && { opacity: 0.7 },
                  resetting && { opacity: 0.5 },
                ]}
              >
                {resetting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather name="trash-2" size={15} color="#fff" />
                    <Text style={styles.resetBtnText}>Reset All Votes</Text>
                  </>
                )}
              </Pressable>
            </LinearGradient>
          </>
        ) : (
          <View style={styles.loadingBox}>
            <Feather name="wifi-off" size={32} color="rgba(255,255,255,0.2)" />
            <Text style={styles.loadingText}>Could not connect to server</Text>
            <Pressable onPress={fetchStats} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0E2A",
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLeft: {
    gap: 4,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  adminBadgeText: {
    color: "#F59E0B",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  lastRefreshed: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  urlBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  urlText: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  statSub: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  breakdownCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  companyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  companyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  companyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  companyName: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  companyRight: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  companyPct: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  companyCount: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  barTrack: {
    height: 7,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 100,
  },
  winnerBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(245,158,11,0.08)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 4,
  },
  winnerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  recentDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  recentNum: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  recentLabel: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  dangerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dangerDesc: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 4,
  },
  resetBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  retryBtn: {
    backgroundColor: "rgba(79,70,229,0.2)",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: "#4F46E5",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
