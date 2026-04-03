import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar, user, title }) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const roleLabel = user?.role === 'driver' ? 'Driver Portal' : user?.role === 'admin' ? 'Admin Console' : 'Passenger Terminal';

    return (
        <header
            className="h-16 fixed top-0 left-0 right-0 z-30 lg:pl-[220px] transition-all duration-300"
            style={{
                background: 'rgba(10, 10, 15, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* Purple progress indicator bar */}
            <div
                className="absolute top-0 left-0 h-[2px]"
                style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #7C3AED, rgba(124,58,237,0.2) 60%, transparent)',
                }}
            />

            <div className="h-full px-4 sm:px-6 flex items-center justify-between">
                {/* Left: hamburger + page context */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-xl focus:outline-none transition-colors"
                        style={{ color: 'rgba(240,237,232,0.45)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#F0EDE8'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,237,232,0.45)'; e.currentTarget.style.background = 'transparent'; }}
                        aria-label="Open sidebar"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>
                    <div className="hidden sm:block">
                        <p
                            className="text-[10px] font-bold uppercase tracking-[0.15em] leading-none"
                            style={{ color: '#A78BFA' }}
                        >
                            {roleLabel}
                        </p>
                        <h1
                            className="text-base font-bold leading-snug mt-0.5"
                            style={{ fontFamily: 'Syne, sans-serif', color: '#F0EDE8' }}
                        >
                            {title || 'Dashboard'}
                        </h1>
                    </div>
                </div>

                {/* Right: user avatar + dropdown */}
                <div className="flex items-center gap-3">
                    {/* User name — md+ */}
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-semibold leading-tight" style={{ color: '#F0EDE8' }}>{user?.name}</span>
                        <span className="text-xs capitalize leading-tight" style={{ color: 'rgba(240,237,232,0.30)' }}>{user?.role}</span>
                    </div>

                    {/* Avatar button */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(d => !d)}
                            className="flex items-center focus:outline-none group"
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                        >
                            <div
                                className="h-9 w-9 rounded-full flex items-center justify-center overflow-hidden shadow-sm transition-transform duration-150 group-hover:scale-105 group-active:scale-95"
                                style={{
                                    background: 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)',
                                    border: '2px solid rgba(124,58,237,0.30)',
                                }}
                            >
                                {user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="font-bold text-sm" style={{ color: '#0A0A0F' }}>{user?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </button>

                        {/* Dropdown */}
                        {dropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10 cursor-default"
                                    onClick={() => setDropdownOpen(false)}
                                />
                                <div
                                    className="absolute right-0 top-full mt-2 w-44 py-1 z-20"
                                    style={{
                                        background: 'rgba(22,22,31,0.95)',
                                        backdropFilter: 'blur(16px)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '12px',
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                                        animation: 'springPop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
                                    }}
                                >
                                    <button
                                        onClick={() => { setDropdownOpen(false); navigate(user?.role === 'driver' ? '/driver-profile' : '/user-profile'); }}
                                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors"
                                        style={{ color: 'rgba(240,237,232,0.60)' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#F0EDE8'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,237,232,0.60)'; e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        My Profile
                                    </button>
                                    <div style={{ margin: '4px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors"
                                        style={{ color: '#EF4444' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
