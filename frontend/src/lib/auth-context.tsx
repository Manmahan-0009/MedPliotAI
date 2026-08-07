"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";
import { API_BASE_URL } from "./api-client";
import { registerTokenGetter, registerUnauthorizedHandler } from "./token-manager";

export type UserRole = "doctor" | "patient" | null;

export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  role: UserRole;
  doctor_profile?: {
    full_name: string;
    department?: string;
    specialization?: string;
    medical_registration_number?: string;
    phone?: string;
  } | null;
  patient_profile?: {
    patient_id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
  } | null;
}

const STORAGE_KEY = "medipilot_session_v2";
const SESSION_TYPE_KEY = "medipilot_session_type";

type SessionType = "firebase" | "db";

function loadSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function loadSessionType(): SessionType | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_TYPE_KEY) as SessionType | null;
}

function saveSession(profile: UserProfile, sessionType: SessionType): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(SESSION_TYPE_KEY, sessionType);
  } catch {}
}

function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_TYPE_KEY);
  } catch {}
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  getAccessToken: (forceRefresh?: boolean) => Promise<string | null>;
  login: (email: string, pass: string) => Promise<UserProfile | null>;
  signupDoctor: (data: {
    email: string;
    pass: string;
    full_name: string;
    department?: string;
    specialization?: string;
    medical_registration_number?: string;
    phone?: string;
  }) => Promise<void>;
  signupPatient: (data: {
    email: string;
    pass: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    gender?: string;
    phone?: string;
    blood_group?: string;
    address?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: (token: string) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  role: null,
  loading: true,
  getAccessToken: async () => null,
  login: async () => null,
  signupDoctor: async () => {},
  signupPatient: async () => {},
  logout: async () => {},
  fetchUserProfile: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Memoize loadSession so it doesn't return a new reference on every render
  const storedSession = React.useMemo(() => loadSession(), []);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => storedSession);
  const [role, setRole] = useState<UserRole>(() => storedSession?.role ?? null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const authReadyRef = useRef(false);
  const dbSessionActive = useRef<boolean>(loadSessionType() === "db" && Boolean(storedSession));
  const firebaseUserRef = useRef<FirebaseUser | null>(null);

  const applyProfile = useCallback((profile: UserProfile, sessionType: SessionType) => {
    setUserProfile(profile);
    setRole(profile.role);
    saveSession(profile, sessionType);
    if (sessionType === "db") {
      dbSessionActive.current = true;
    }
  }, []);

  const fetchUserProfile = useCallback(async (token: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: UserProfile = await res.json();
        applyProfile(data, "firebase");
        dbSessionActive.current = false;
        return data;
      }
      if (res.status === 401) {
        return null;
      }
      console.warn("Profile fetch failed:", await res.text());
      return null;
    } catch (err) {
      console.error("fetchUserProfile error:", err);
      return null;
    }
  }, [applyProfile]);

  const getAccessToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    const fbUser = firebaseUserRef.current;
    if (fbUser) {
      try {
        return await fbUser.getIdToken(forceRefresh);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const handleLogout = useCallback(async () => {
    dbSessionActive.current = false;
    authReadyRef.current = false;
    clearSession();
    firebaseUserRef.current = null;
    registerTokenGetter(async () => null);
    try {
      await firebaseSignOut(auth);
    } catch {}
    setFirebaseUser(null);
    setUserProfile(null);
    setRole(null);
  }, []);

  // Register token getter + 401 handler for API client
  useEffect(() => {
    registerTokenGetter(getAccessToken);
    registerUnauthorizedHandler(() => {
      if (firebaseUserRef.current) {
        handleLogout();
      }
    });
  }, [getAccessToken, handleLogout]);

  // Initialize Firebase auth — wait for persisted session restore
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        await auth.authStateReady();
      } catch (e) {
        console.error("authStateReady error:", e);
      }

      if (!mounted) return;
      authReadyRef.current = true;

      const currentUser = auth.currentUser;
      if (currentUser) {
        dbSessionActive.current = false;
        firebaseUserRef.current = currentUser;
        setFirebaseUser(currentUser);
        try {
          const token = await currentUser.getIdToken();
          const profile = await fetchUserProfile(token);
          if (!profile && storedSession) {
            setUserProfile(storedSession);
            setRole(storedSession.role);
          }
        } catch (e) {
          console.error("Initial token/profile error:", e);
          if (storedSession) {
            setUserProfile(storedSession);
            setRole(storedSession.role);
          }
        }
      } else if (dbSessionActive.current && storedSession) {
        setUserProfile(storedSession);
        setRole(storedSession.role);
      } else {
        clearSession();
        setUserProfile(null);
        setRole(null);
      }

      if (mounted) setLoading(false);
    };

    initAuth();

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (!authReadyRef.current) return;

      if (fbUser) {
        dbSessionActive.current = false;
        firebaseUserRef.current = fbUser;
        setFirebaseUser(fbUser);
        try {
          const token = await fbUser.getIdToken();
          await fetchUserProfile(token);
        } catch (e) {
          console.error("Auth state profile error:", e);
        }
        setLoading(false);
        return;
      }

      // Firebase reported no user — only clear if not a DB fallback session
      if (!dbSessionActive.current) {
        firebaseUserRef.current = null;
        setFirebaseUser(null);
        setUserProfile(null);
        setRole(null);
        clearSession();
      }
      setLoading(false);
    });

    const unsubToken = onIdTokenChanged(auth, (fbUser) => {
      if (fbUser) {
        firebaseUserRef.current = fbUser;
        setFirebaseUser(fbUser);
      }
    });

    return () => {
      mounted = false;
      unsubAuth();
      unsubToken();
    };
  }, [fetchUserProfile, storedSession]);

  const login = async (email: string, pass: string): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      firebaseUserRef.current = cred.user;
      setFirebaseUser(cred.user);
      const token = await cred.user.getIdToken();
      const profile = await fetchUserProfile(token);
      setLoading(false);
      return profile;
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      const isConfigError =
        fbErr?.code === "auth/configuration-not-found" ||
        fbErr?.code === "auth/internal-error" ||
        fbErr?.code === "auth/operation-not-allowed";

      if (isConfigError) {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass }),
        });

        setLoading(false);

        if (!res.ok) {
          let msg = "Invalid email or password";
          try {
            const body = await res.json();
            msg = body.detail || msg;
          } catch {}
          throw new Error(msg);
        }

        const profileData: UserProfile = await res.json();
        dbSessionActive.current = true;
        firebaseUserRef.current = null;
        setFirebaseUser(null);
        applyProfile(profileData, "db");
        return profileData;
      }

      setLoading(false);
      throw err;
    }
  };

  const signupDoctor = async (data: {
    email: string;
    pass: string;
    full_name: string;
    department?: string;
    specialization?: string;
    medical_registration_number?: string;
    phone?: string;
  }) => {
    setLoading(true);
    let uid = "db_doctor_" + Math.random().toString(36).substring(2, 10);
    let isRealFirebase = false;

    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      uid = cred.user.uid;
      firebaseUserRef.current = cred.user;
      setFirebaseUser(cred.user);
      isRealFirebase = true;
    } catch (fbErr: unknown) {
      const code = (fbErr as { code?: string })?.code;
      const configErr =
        code === "auth/configuration-not-found" || code === "auth/operation-not-allowed";
      if (!configErr) {
        setLoading(false);
        throw fbErr;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_uid: uid,
          email: data.email,
          password: data.pass,
          full_name: data.full_name,
          department: data.department || null,
          specialization: data.specialization || null,
          medical_registration_number: data.medical_registration_number || null,
          phone: data.phone || null,
        }),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({ detail: "Registration failed" }));
        setLoading(false);
        throw new Error(b.detail || "Doctor registration failed");
      }

      const profileData: UserProfile = await res.json();
      if (isRealFirebase) {
        const token = await firebaseUserRef.current?.getIdToken();
        if (token) await fetchUserProfile(token);
        applyProfile(profileData, "firebase");
      } else {
        dbSessionActive.current = true;
        applyProfile(profileData, "db");
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signupPatient = async (data: {
    email: string;
    pass: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    gender?: string;
    phone?: string;
    blood_group?: string;
    address?: string;
  }) => {
    setLoading(true);
    let uid = "db_patient_" + Math.random().toString(36).substring(2, 10);
    let isRealFirebase = false;

    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      uid = cred.user.uid;
      firebaseUserRef.current = cred.user;
      setFirebaseUser(cred.user);
      isRealFirebase = true;
    } catch (fbErr: unknown) {
      const code = (fbErr as { code?: string })?.code;
      const configErr =
        code === "auth/configuration-not-found" || code === "auth/operation-not-allowed";
      if (!configErr) {
        setLoading(false);
        throw fbErr;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register-patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_uid: uid,
          email: data.email,
          password: data.pass,
          first_name: data.first_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth || null,
          gender: data.gender || null,
          phone: data.phone || null,
          blood_group: data.blood_group || null,
          address: data.address || null,
        }),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({ detail: "Registration failed" }));
        setLoading(false);
        throw new Error(b.detail || "Patient registration failed");
      }

      const profileData: UserProfile = await res.json();
      if (isRealFirebase) {
        const token = await firebaseUserRef.current?.getIdToken();
        if (token) await fetchUserProfile(token);
        applyProfile(profileData, "firebase");
      } else {
        dbSessionActive.current = true;
        applyProfile(profileData, "db");
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = handleLogout;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        role,
        loading,
        getAccessToken,
        login,
        signupDoctor,
        signupPatient,
        logout,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
