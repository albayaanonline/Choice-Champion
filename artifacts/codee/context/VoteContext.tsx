import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY_VOTED_FOR = "codee_voted_for";
const STORAGE_KEY_FAYSAL = "codee_votes_faysal";
const STORAGE_KEY_NEW = "codee_votes_new";

const SEED_FAYSAL = 1247;
const SEED_NEW = 1089;

interface VoteContextType {
  votedFor: "faysal" | "new" | null;
  faysalVotes: number;
  newVotes: number;
  isLoading: boolean;
  vote: (company: "faysal" | "new") => Promise<void>;
  resetVotes: () => Promise<void>;
}

const VoteContext = createContext<VoteContextType | null>(null);

export function VoteProvider({ children }: { children: React.ReactNode }) {
  const [votedFor, setVotedFor] = useState<"faysal" | "new" | null>(null);
  const [faysalVotes, setFaysalVotes] = useState(SEED_FAYSAL);
  const [newVotes, setNewVotes] = useState(SEED_NEW);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [voted, fv, nv] = await AsyncStorage.multiGet([
          STORAGE_KEY_VOTED_FOR,
          STORAGE_KEY_FAYSAL,
          STORAGE_KEY_NEW,
        ]);

        const storedVotedFor = voted[1] as "faysal" | "new" | null;
        const storedFaysal = fv[1] ? parseInt(fv[1], 10) : SEED_FAYSAL;
        const storedNew = nv[1] ? parseInt(nv[1], 10) : SEED_NEW;

        if (storedVotedFor) setVotedFor(storedVotedFor);
        setFaysalVotes(storedFaysal);
        setNewVotes(storedNew);
      } catch {
        // fallback to defaults
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const vote = useCallback(async (company: "faysal" | "new") => {
    if (votedFor) return;

    const newFaysal = company === "faysal" ? faysalVotes + 1 : faysalVotes;
    const newNew = company === "new" ? newVotes + 1 : newVotes;

    setVotedFor(company);
    setFaysalVotes(newFaysal);
    setNewVotes(newNew);

    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEY_VOTED_FOR, company],
        [STORAGE_KEY_FAYSAL, String(newFaysal)],
        [STORAGE_KEY_NEW, String(newNew)],
      ]);
    } catch {
      // ignore storage errors
    }
  }, [votedFor, faysalVotes, newVotes]);

  const resetVotes = useCallback(async () => {
    setVotedFor(null);
    setFaysalVotes(SEED_FAYSAL);
    setNewVotes(SEED_NEW);
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEY_VOTED_FOR,
        STORAGE_KEY_FAYSAL,
        STORAGE_KEY_NEW,
      ]);
    } catch {
      // ignore
    }
  }, []);

  return (
    <VoteContext.Provider value={{ votedFor, faysalVotes, newVotes, isLoading, vote, resetVotes }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVote() {
  const ctx = useContext(VoteContext);
  if (!ctx) throw new Error("useVote must be used within VoteProvider");
  return ctx;
}
