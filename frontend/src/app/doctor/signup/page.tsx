"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DoctorSignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signup?role=doctor");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Redirecting to Doctor Sign Up...</p>
      </div>
    </div>
  );
}
