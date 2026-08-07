"use client";

import Link from "next/link";
import { Stethoscope, Menu, X } from "lucide-react";
import { useState } from "react";

export function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="text-slate-900 font-bold text-xl tracking-tight leading-tight">MediPilot AI</div>
            <div className="text-slate-500 text-[11px] font-bold tracking-widest uppercase">Connected Care</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Home</Link>
          <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">How It Works</a>
          <a href="#why-medipilot" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">About</a>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/signin" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link href="/signup" className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-lg px-4 py-6 flex flex-col gap-4">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-slate-700 p-2 hover:bg-slate-50 rounded-lg">Home</Link>
          <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-slate-700 p-2 hover:bg-slate-50 rounded-lg">Features</a>
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-slate-700 p-2 hover:bg-slate-50 rounded-lg">How It Works</a>
          
          <div className="h-px bg-slate-200 my-2"></div>
          
          <Link href="/signin" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-slate-700 p-2 hover:bg-slate-50 rounded-lg">
            Sign In
          </Link>
          <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="text-base font-bold bg-blue-600 text-white p-3 text-center rounded-xl">
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
}
