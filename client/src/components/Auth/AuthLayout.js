import React from 'react';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '../Common/ThemeToggle';

const AuthLayout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center py-12 px-4 sm:px-8 bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 cz-dm">
      {/* Premium Background — Source: LandingPage Style */}
      <div className="cz-noise" />
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.4
        }} />
        <div className="cz-orb" style={{ width: '400px', height: '400px', background: 'var(--accent)', top: '-100px', left: '-100px', opacity: 'var(--orb-opacity, 0.12)' }} />
        <div className="cz-orb" style={{ width: '300px', height: '300px', background: 'var(--teal)', bottom: '-50px', right: '-50px', opacity: 'var(--orb-opacity, 0.08)' }} />
      </div>

      {/* Theme Toggle Position */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <div className="mb-10 flex flex-col items-center gap-2 z-10 w-full max-w-md opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden relative group dark:bg-white/5 dark:border-white/10 light:bg-black/5 light:border-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent group-hover:opacity-100 transition-opacity" />
          <span className="text-4xl cz-bebas leading-none text-[var(--text)] relative z-10 text-shadow-glow">CZ</span>
        </div>
        <div className="text-center mt-4">
          <h1 className="text-5xl cz-bebas tracking-wider text-[var(--text)] mb-1 drop-shadow-[0_0_15px_rgba(255,208,0,0.3)]">CABZEE</h1>
          <div className="flex items-center gap-2 justify-center">
             <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-yellow-500/50" />
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-600 dark:text-yellow-500/80">Premium Mobility</p>
             <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-yellow-500/50" />
          </div>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md cz-glass rounded-3xl relative z-10 hover:scale-[1.005] transition-transform duration-500 opacity-0 animate-[fadeIn_0.6s_ease-out_0.1s_forwards]">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        
        <div className="px-8 py-10">
          <Outlet />
        </div>
      </div>

      <div className="mt-12 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] z-10 opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]">
        © 2026 CabZee · Secure Encryption Enabled
      </div>
    </div>
  );
};

export default AuthLayout;

