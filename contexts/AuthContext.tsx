import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';
import { fetchProfile as fetchUserProfile } from '../lib/api/profile';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, nickname: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const activeUserIdRef = useRef<string | null>(null);
  const inFlightProfileRef = useRef<{ userId: string; promise: Promise<UserProfile | null> } | null>(null);

  const fetchProfile = useCallback(async (userId: string, force = false): Promise<UserProfile | null> => {
    if (!force && inFlightProfileRef.current?.userId === userId) {
      return inFlightProfileRef.current.promise;
    }

    setProfileLoading(true);

    const request = (async () => {
      const data = await fetchUserProfile(userId);
      if (activeUserIdRef.current === userId) {
        setProfile(data);
      }
      return data;
    })().finally(() => {
      if (inFlightProfileRef.current?.promise === request) {
        inFlightProfileRef.current = null;
      }
      setProfileLoading(false);
    });

    inFlightProfileRef.current = { userId, promise: request };
    return request;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, true);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      activeUserIdRef.current = currentSession?.user?.id ?? null;
    }).finally(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      activeUserIdRef.current = newSession?.user?.id ?? null;

      if (!newSession?.user) {
        setProfile(null);
        setProfileLoading(false);
        inFlightProfileRef.current = null;
        return;
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        void fetchProfile(newSession.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }

    if (data.user?.id) {
      activeUserIdRef.current = data.user.id;
      await fetchProfile(data.user.id);
    }

    return { error: null };
  };

  const register = async (
    email: string,
    password: string,
    nickname: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
      },
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, profileLoading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
};
