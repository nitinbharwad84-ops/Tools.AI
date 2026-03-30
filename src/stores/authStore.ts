import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { Profile } from "../types/supabase";
import { supabase } from "../services/supabaseClient";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  clearAuth: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  clearAuth: () => set({ session: null, user: null, profile: null }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));
