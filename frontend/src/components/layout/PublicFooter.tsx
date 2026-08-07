import Link from "next/link";
import { Stethoscope } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12 mb-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="text-white font-bold text-xl tracking-tight leading-tight">MediPilot AI</div>
              </div>
            </Link>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed mb-6">
              Intelligent Healthcare. Connected Care. MediPilot AI brings consultation, documentation, medication management, and patient care into one unified platform.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
              <li><a href="#why-medipilot" className="hover:text-blue-400 transition-colors">About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Account</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/signin" className="hover:text-blue-400 transition-colors">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-blue-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediPilot AI. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
