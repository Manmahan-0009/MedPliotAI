"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PatientSignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signup?role=patient");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Redirecting to Patient Sign Up...</p>
      </div>
    </div>
  );
}
