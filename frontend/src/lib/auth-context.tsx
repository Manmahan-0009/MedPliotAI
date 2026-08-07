"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";
import { API_BASE_URL } from "./api";

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

// ─── localStorage helpers ────────────────────────────────────────────────────
const STORAGE_KEY = "medipilot_session_v2";

function loadSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function saveSession(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole;
  loading: boolean;
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
  login: async () => null,
  signupDoctor: async () => {},
  signupPatient: async () => {},
  logout: async () => {},
  fetchUserProfile: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ─── Synchronous initialisation from localStorage ─────────────────────────
  // These run BEFORE the first render, so ProtectedRoute never sees an empty
  // userProfile on page-refresh when a session is stored.
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => loadSession());
  const [role, setRole] = useState<UserRole>(() => loadSession()?.role ?? null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Start loading=true only if we don't already have a stored session.
  // If we have a session we can show the UI immediately and confirm in the background.
  const [loading, setLoading] = useState<boolean>(!loadSession());

  // Ref flag: true when auth state comes from DB (not real Firebase).
  // Prevents onAuthStateChanged(null) from wiping a valid DB session.
  const dbSessionActive = useRef<boolean>(Boolean(loadSession()));
  // ─────────────────────────────────────────────────────────────────────────

  const applyProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    setRole(profile.role);
    saveSession(profile);
  };

  const fetchUserProfile = async (token: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: UserProfile = await res.json();
        applyProfile(data);
        return data;
      }
      console.warn("Profile fetch failed:", await res.text());
      return null;
    } catch (err) {
      console.error("fetchUserProfile error:", err);
      return null;
    }
  };

  // ─── Firebase Auth state listener ─────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Real Firebase user — always wins
        dbSessionActive.current = false;
        setFirebaseUser(fbUser);
        try {
          const token = await fbUser.getIdToken();
          await fetchUserProfile(token);
        } catch (e) {
          console.error("Token/profile error:", e);
        }
        setLoading(false);
      } else {
        // No Firebase user. Only clear if no DB session is active.
        if (!dbSessionActive.current) {
          setFirebaseUser(null);
          setUserProfile(null);
          setRole(null);
          clearSession();
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email: string, pass: string): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      // Try Firebase first
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setFirebaseUser(cred.user);
      const token = await cred.user.getIdToken();
      const profile = await fetchUserProfile(token);
      setLoading(false);
      return profile;
    } catch (err: any) {
      const isConfigError =
        err?.code === "auth/configuration-not-found" ||
        err?.code === "auth/internal-error" ||
        err?.code === "auth/operation-not-allowed";

      if (isConfigError) {
        // Firebase Email/Password provider not enabled → verify via DB
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
        setFirebaseUser({ uid: profileData.firebase_uid, email: profileData.email } as any);
        applyProfile(profileData);
        return profileData;
      }

      setLoading(false);
      throw err;
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Signup – Doctor ──────────────────────────────────────────────────────
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
      setFirebaseUser(cred.user);
      isRealFirebase = true;
    } catch (fbErr: any) {
      const configErr =
        fbErr?.code === "auth/configuration-not-found" ||
        fbErr?.code === "auth/operation-not-allowed";
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
      if (!isRealFirebase) {
        dbSessionActive.current = true;
        setFirebaseUser({ uid: profileData.firebase_uid, email: profileData.email } as any);
      }
      applyProfile(profileData);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Signup – Patient ─────────────────────────────────────────────────────
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
      setFirebaseUser(cred.user);
      isRealFirebase = true;
    } catch (fbErr: any) {
      const configErr =
        fbErr?.code === "auth/configuration-not-found" ||
        fbErr?.code === "auth/operation-not-allowed";
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
      if (!isRealFirebase) {
        dbSessionActive.current = true;
        setFirebaseUser({ uid: profileData.firebase_uid, email: profileData.email } as any);
      }
      applyProfile(profileData);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    dbSessionActive.current = false;
    clearSession();
    try {
      await firebaseSignOut(auth);
    } catch {}
    setFirebaseUser(null);
    setUserProfile(null);
    setRole(null);
  };
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        role,
        loading,
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
