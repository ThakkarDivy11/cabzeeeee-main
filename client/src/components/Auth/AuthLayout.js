import React from 'react';
import { Outlet } from 'react-router-dom';
import AetherBackground from '../ui/AetherBackground';
import ThemeToggle from '../Common/ThemeToggle';

const AuthLayout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center py-12 px-4 sm:px-8 bg-white text-black dark:bg-black dark:text-white">
      <AetherBackground />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex flex-col items-center gap-3 z-10 w-full max-w-md opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-purple-500/20 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20">
          <span className="text-3xl font-black leading-none text-black dark:text-white tracking-widest">CZ</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white mb-1">CabZee</h1>
          <p className="text-sm font-medium text-black dark:text-gray-300">Fast, reliable rides at your fingertips</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-white border border-[#e5e5e5] rounded-2xl shadow-lg relative z-10 hover:scale-[1.01] transition-transform duration-300 opacity-0 animate-[fadeIn_0.6s_ease-out_0.1s_forwards] dark:bg-white/10 dark:backdrop-blur-lg dark:border-white/20 dark:shadow-2xl dark:shadow-purple-500/20">
        <div className="px-8 py-8">
          <Outlet />
        </div>
      </div>

      <p className="mt-8 text-xs font-semibold text-black dark:text-gray-400 z-10 opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]">
        © 2026 CabZee. All rights reserved.
      </p>
    </div>
  );
};

export default AuthLayout;

