import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

// Create authentication context
const AuthContext = createContext();

// 2023-04-26: Added authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    const getSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Expose authentication methods and state
  const value = {
    // Sign up with email and password
    signUp: (data) => supabase.auth.signUp(data),
    
    // Sign in with email and password
    signIn: (data) => supabase.auth.signInWithPassword(data),
    
    // Sign in with one-time password (OTP) for password reset
    signInWithOtp: (data) => supabase.auth.signInWithOtp(data),
    
    // Sign in with Google OAuth
    signInWithGoogle: () => 
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      }),
      
    // Sign out current user
    signOut: () => supabase.auth.signOut(),
    
    // User and session state
    user,
    session,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 