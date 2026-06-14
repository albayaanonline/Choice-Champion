import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const STORAGE_KEY_VOTED_FOR = "codee_voted_for";
const STORAGE_KEY_USER_ID = "codee_user_id";

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}/api` : "/api";
}

function generateUserId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "u_";
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

interface VoteTotals {
  faysal: number;
  new: number;
}

interface VoteContextType {
  votedFor: "faysal" | "new" | null;
  faysalVotes: number;
  newVotes: number;
  isLoading: boolean;
  isSyncing: boolean;
  vote: (company: "faysal" | "new") => Promise<void>;
  refresh: () => Promise<void>;
}

const VoteContext = createContext<VoteContextType | null>(null);

export function VoteProvider({ children }: { children: React.ReactNode }) {
  const [votedFor, setVotedFor] = useState<"faysal" | "new" | null>(null);
  const [totals, setTotals] = useState<VoteTotals>({ faysal: 0, new: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTotals = useCallback(async (): Promise<VoteTotals | null> => {
    try {
      const res = await fetch(`${getApiBase()}/votes`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { faysal: data.faysal ?? 0, new: data.new ?? 0 };
    } catch {
      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsSyncing(true);
    const data = await fetchTotals();
    if (data) setTotals(data);
    setIsSyncing(false);
  }, [fetchTotals]);

  // Initialize: load userId, votedFor, and fetch live counts
  useEffect(() => {
    const init = async () => {
      try {
        const [storedVoted, storedUserId] = await AsyncStorage.multiGet([
          STORAGE_KEY_VOTED_FOR,
          STORAGE_KEY_USER_ID,
        ]);

        // Ensure userId exists
        let userId = storedUserId[1];
        if (!userId) {
          userId = generateUserId();
          await AsyncStorage.setItem(STORAGE_KEY_USER_ID, userId);
        }
        userIdRef.current = userId;

        if (storedVoted[1]) {
          setVotedFor(storedVoted[1] as "faysal" | "new");
        }

        // Fetch real vote totals
        const data = await fetchTotals();
        if (data) setTotals(data);
      } catch {
        // fallback stays at zeros
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [fetchTotals]);

  // Poll for live updates every 15 seconds
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      const data = await fetchTotals();
      if (data) setTotals(data);
    }, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchTotals]);

  const vote = useCallback(
    async (company: "faysal" | "new") => {
      if (votedFor) return;
      const userId = userIdRef.current;
      if (!userId) return;

      // Optimistic update
      setVotedFor(company);
      setTotals((prev) => ({
        ...prev,
        [company]: prev[company] + 1,
      }));

      try {
        const res = await fetch(`${getApiBase()}/votes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company, userId }),
        });

        const data = await res.json();

        if (res.ok) {
          // Update with server-confirmed totals
          setTotals({ faysal: data.faysal, new: data.new });
          await AsyncStorage.setItem(STORAGE_KEY_VOTED_FOR, company);
        } else if (res.status === 409) {
          // Already voted on server side — sync state
          await AsyncStorage.setItem(STORAGE_KEY_VOTED_FOR, company);
          const latest = await fetchTotals();
          if (latest) setTotals(latest);
        } else {
          // Revert optimistic update on error
          setVotedFor(null);
          setTotals((prev) => ({
            ...prev,
            [company]: Math.max(0, prev[company] - 1),
          }));
        }
      } catch {
        // Network error — still persist locally for UX
        await AsyncStorage.setItem(STORAGE_KEY_VOTED_FOR, company);
      }
    },
    [votedFor, fetchTotals]
  );

  return (
    <VoteContext.Provider
      value={{
        votedFor,
        faysalVotes: totals.faysal,
        newVotes: totals.new,
        isLoading,
        isSyncing,
        vote,
        refresh,
      }}
    >
      {children}
    </VoteContext.Provider>
  );
}

export function useVote() {
  const ctx = useContext(VoteContext);
  if (!ctx) throw new Error("useVote must be used within VoteProvider");
  return ctx;
}
