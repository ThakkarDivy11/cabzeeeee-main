import React from 'react';
import { Outlet } from 'react-router-dom';
import AetherBackground from '../ui/AetherBackground';

const AuthLayout = () => {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center py-12 px-4 sm:px-8 bg-black font-sans"
    >
      <AetherBackground />

      {/* Header Logo Section */}
      <div className="mb-8 flex flex-col items-center gap-3 z-10 w-full max-w-md opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-purple-500/20 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20">
          <span className="text-3xl font-black leading-none text-white tracking-widest">
            CZ
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            CabZee
          </h1>
          <p className="text-sm font-medium text-gray-300">
            Fast, reliable rides at your fingertips
          </p>
        </div>
      </div>

      {/* Main Auth Card Container */}
      <div
        className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl shadow-purple-500/20 relative z-10 hover:scale-[1.01] transition-transform duration-300 opacity-0 animate-[fadeIn_0.6s_ease-out_0.1s_forwards]"
      >
        <div className="px-8 py-8">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs font-semibold text-gray-500 z-10 opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]">
        © 2025 CabZee. All rights reserved.
      </p>

    </div>
  );
};

export default AuthLayout;
