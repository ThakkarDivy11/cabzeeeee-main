import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ toggleSidebar, user, title }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const roleLabel =
    user?.role === 'driver' ? 'Driver Portal' : user?.role === 'admin' ? 'Admin Console' : 'Passenger Terminal';

  const profilePath = user?.role === 'driver' ? '/driver-profile' : '/user-profile';

  return (
    <header className="h-16 fixed top-0 left-0 right-0 z-30 lg:pl-[220px] transition-all duration-300 cz-glass border-b border-[var(--border)] shadow-sm backdrop-blur text-[var(--text)]">
      <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-yellow-500/80 via-yellow-500/20 to-transparent" />

      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl transition-all duration-300 text-[var(--text)] hover:bg-white/5 active:scale-95"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          <div className="hidden sm:block min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none text-yellow-600 dark:text-yellow-500/80">
              {roleLabel}
            </p>
            <h1 className="text-xl cz-bebas tracking-wider leading-snug mt-0.5 truncate text-[var(--text)]">
              {title || 'Dashboard'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-sm font-semibold text-black dark:text-white">{user?.name}</span>
            <span className="text-xs capitalize text-black dark:text-gray-400">{user?.role}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((d) => !d)}
              className="flex items-center focus:outline-none group"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <div className="h-9 w-9 rounded-full flex items-center justify-center overflow-hidden shadow-sm transition-transform duration-150 group-hover:scale-105 group-active:scale-95 bg-gradient-to-br from-purple-600 to-purple-700 border-2 border-purple-500/30">
                {user?.profilePicture ? (
                  <img
                    src={
                      user.profilePicture.startsWith('http')
                        ? user.profilePicture
                        : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`
                    }
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-sm text-black">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10 cursor-default" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 py-1 z-20 rounded-xl border border-[#e5e5e5] bg-white shadow-lg overflow-hidden dark:border-white/10 dark:bg-[#111827]/85 dark:backdrop-blur">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(profilePath);
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </button>

                  <div className="my-1 border-t border-[#e5e5e5] dark:border-white/10" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-red-600 hover:bg-red-500/10"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

