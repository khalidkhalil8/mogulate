
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface UserProfile {
  subscription_tier: string;
  subscription_started_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  userProfile: UserProfile | null;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_started_at")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  // Provide a function to manually refresh the user profile
  const refreshUserProfile = useCallback(async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  }, [user?.id, fetchUserProfile]);

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Log authentication events for security monitoring
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', { userId: session.user.id, email: session.user.email });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUserProfile(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for user:', session?.user?.id);
        }

        // Safely fetch user profile data using setTimeout to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (email: string, password: string) => {
    // Input validation
    if (!email?.trim()) {
      toast.error("Email is required");
      return;
    }
    
    if (!password) {
      toast.error("Password is required");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error("Login error:", error);
        
        // More specific error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password", {
            description: "Please check your credentials and try again",
          });
        } else if (error.message.includes('too_many_requests')) {
          toast.error("Too many login attempts", {
            description: "Please wait a moment before trying again",
          });
        } else {
          toast.error("Login failed", {
            description: error.message,
          });
        }
        return;
      }

      if (data.user) {
        toast.success("Logged in successfully");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast.error("An unexpected error occurred during login");
    }
  };

  const signUp = async (email: string, password: string) => {
    // Input validation
    if (!email?.trim()) {
      toast.error("Email is required");
      return;
    }
    
    if (!password) {
      toast.error("Password is required");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error("Sign up error:", error);
        
        // More specific error messages
        if (error.message.includes('already_registered')) {
          toast.error("Account already exists", {
            description: "Please try logging in instead",
          });
        } else if (error.message.includes('weak_password')) {
          toast.error("Password is too weak", {
            description: "Please choose a stronger password",
          });
        } else {
          toast.error("Sign up failed", {
            description: error.message,
          });
        }
        return;
      }

      if (data.user) {
        toast.success("Account created successfully", {
          description: "You can now log in with your credentials",
        });
        
        // With email confirmation disabled, we can log the user in immediately
        if (data.session) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Unexpected sign up error:", error);
      toast.error("An unexpected error occurred during sign up");
    }
  };

  const logout = async () => {
    try {
      // Check if there's an active session before attempting logout
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log('No active session found, clearing local state');
        setUserProfile(null);
        localStorage.removeItem('last_subscription_update');
        toast.success("Logged out successfully");
        navigate("/");
        return;
      }

      console.log('Attempting logout for session:', currentSession.access_token.substring(0, 10) + '...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error("Failed to log out", {
          description: error.message,
        });
        return;
      }
      
      // Clear any cached data
      setUserProfile(null);
      localStorage.removeItem('last_subscription_update');
      
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Unexpected logout error:", error);
      // Even if logout fails, clear local state
      setUserProfile(null);
      localStorage.removeItem('last_subscription_update');
      toast.error("An unexpected error occurred during logout");
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        login,
        signUp,
        logout,
        userProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
