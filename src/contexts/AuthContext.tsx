import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: (callback?: () => void) => Promise<void>;
  isLoading: boolean;
  isMissingUsername: boolean;
  updateProfile: (username: string) => Promise<void>;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage", error);
    localStorage.removeItem("user");
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMissingUsername, setIsMissingUsername] = useState(() => {
    const storedUser = getStoredUser();
    return storedUser ? !storedUser.username_set : false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        localStorage.removeItem("user");
        setIsMissingUsername(false);
        setAuthLoading(false);
        if (event === "SIGNED_OUT") navigate("/");
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Handle profile upsert and only set authLoading to false after completion
        const handleProfileUpsert = async () => {
          try {
            const authUser = session.user;
            const provider = authUser.app_metadata.provider as
              | "google"
              | "github";
            const metadata = authUser.user_metadata;

            const { data: profile, error } = await supabase
              .from("profiles")
              .upsert({
                id: authUser.id,
                email: authUser.email,
                full_name:
                  provider === "google" ? metadata.full_name : metadata.name,
                avatar_url:
                  provider === "google"
                    ? metadata.picture
                    : metadata.avatar_url,
                provider: provider,
              })
              .select()
              .single();

            if (error) {
              console.error("Error upserting profile:", error);
              setUser(null);
              localStorage.removeItem("user");
            } else {
              setUser(profile as User);
              localStorage.setItem("user", JSON.stringify(profile));
              setIsMissingUsername(!profile.username_set);
            }
          } catch (error) {
            console.error("Error in profile upsert:", error);
            setUser(null);
            localStorage.removeItem("user");
          } finally {
            // Only set authLoading to false after profile is loaded (or failed)
            setAuthLoading(false);
          }
        };

        handleProfileUpsert();
      } else if (event === "USER_UPDATED") {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching updated profile:", error);
          } else {
            setUser(profile as User);
            localStorage.setItem("user", JSON.stringify(profile));
          }
        } catch (error) {
          console.error("Error in USER_UPDATED handler:", error);
        } finally {
          setAuthLoading(false);
        }
      } else {
        // For any other events, just mark as not loading
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const updateProfile = async (username: string) => {
    if (!session?.user) throw new Error("No user logged in");
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ username, username_set: true })
        .eq("id", session.user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setIsMissingUsername(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (callback?: () => void) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
      setUser(null);
      localStorage.removeItem("user");
      setIsMissingUsername(false);
      if (callback) callback();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signInWithGoogle,
        signInWithGitHub,
        signOut,
        isLoading,
        isMissingUsername,
        updateProfile,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
