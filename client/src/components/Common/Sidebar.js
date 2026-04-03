import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

/* ── Icon paths for navigation items ── */
const getIconPath = (name) => {
  switch (name) {
    case 'home':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
    case 'map':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />;
    case 'clock':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
    case 'credit-card':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />;
    case 'user':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
    case 'bell':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />;
    case 'currency-rupee':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />;
    case 'truck':
      return <>
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </>;
    case 'document':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
    case 'users':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />;
    case 'shield':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;
    case 'settings':
      return <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>;
    case 'chart':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
    default:
      return null;
  }
};

const Sidebar = ({ isOpen, closeSidebar, user }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const riderLinks = [
    { name: 'Dashboard',        path: '/rider',           icon: 'home' },
    { name: 'Book a Ride',      path: '/book-ride-live',  icon: 'map' },
    { name: 'My Trips',         path: '/ride-history',    icon: 'clock' },
    { name: 'Payment Methods',  path: '/payment-methods', icon: 'credit-card' },
    { name: 'Profile',          path: '/user-profile',    icon: 'user' },
  ];

  const driverLinks = [
    { name: 'Dashboard',         path: '/driver',                 icon: 'home' },
    { name: 'Incoming Requests', path: '/incoming-ride-request',  icon: 'bell' },
    { name: 'My Trips',          path: '/driver-ride-history',    icon: 'clock' },
    { name: 'Earnings',          path: '/driver-earnings',        icon: 'currency-rupee' },
    { name: 'Vehicle Details',   path: '/vehicle-details',        icon: 'truck' },
    { name: 'Documents',         path: '/driver/documents',       icon: 'document' },
    { name: 'Profile',           path: '/driver-profile',         icon: 'user' },
  ];

  const adminLinks = [
    { name: 'Dashboard',           path: '/admin',               icon: 'home' },
    { name: 'All Users',           path: '/admin/users',         icon: 'users' },
    { name: 'Driver Verification', path: '/admin/verification',  icon: 'shield' },
    { name: 'System Settings',     path: '/admin/settings',      icon: 'settings' },
    { name: 'Reports',             path: '/admin/reports',       icon: 'chart' },
  ];

  const links = user?.role === 'driver' ? driverLinks : user?.role === 'admin' ? adminLinks : riderLinks;

  const sidebarWidth = collapsed ? '72px' : '220px';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm lg:hidden dark:bg-black/60"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-[#e5e5e5] text-black flex flex-col dark:bg-black/40 dark:border-white/10 dark:text-white dark:backdrop-blur
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: sidebarWidth,
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* Brand + collapse toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#e5e5e5] flex-shrink-0 dark:border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-700/50 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-purple">
              <span className="text-black font-black text-sm leading-none dark:text-white">CZ</span>
            </div>
            {!collapsed && (
              <span
                className="font-black text-black text-base tracking-tight font-outfit leading-none dark:text-white"
                style={{ transition: 'opacity 0.15s ease', whiteSpace: 'nowrap' }}
              >
                CabZee
              </span>
            )}
          </div>
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-black/60 hover:text-black hover:bg-black/5 transition-colors flex-shrink-0 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className="w-4 h-4"
              style={{
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 1024) closeSidebar();
              }}
              title={collapsed ? link.name : undefined}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-purple-500/10 text-black border-l-[3px] border-purple-600 pl-[calc(0.75rem-3px)] shadow-sm dark:bg-purple-500/20 dark:text-purple-200 dark:border-purple-400'
                  : 'text-black hover:bg-black/5 border-l-[3px] border-transparent pl-[calc(0.75rem-3px)] dark:text-gray-300 dark:hover:bg-white/10'
                }
              `}
            >
              <svg
                className="w-5 h-5 flex-shrink-0 transition-transform duration-150 group-hover:scale-105"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {getIconPath(link.icon)}
              </svg>
              {!collapsed && (
                <span style={{ whiteSpace: 'nowrap', transition: 'opacity 0.15s ease' }}>
                  {link.name}
                </span>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <span
                  className="
                    absolute left-full ml-3 px-2.5 py-1 bg-white border border-[#e5e5e5] rounded-lg text-xs text-black
                    opacity-0 group-hover:opacity-100 pointer-events-none
                    whitespace-nowrap z-10 shadow-level-2
                    dark:bg-[#111827] dark:border-white/10 dark:text-white
                  "
                  style={{ transition: 'opacity 0.15s ease' }}
                >
                  {link.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="flex-shrink-0 p-3 border-t border-[#e5e5e5] dark:border-white/10">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-purple-600/80 border border-purple-500/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate leading-tight dark:text-white">{user?.name}</p>
                <p className="text-xs text-black capitalize leading-tight dark:text-gray-400">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-black/60 hover:text-danger hover:bg-danger/10 transition-colors flex-shrink-0 dark:text-white/60"
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-8 h-8 rounded-full bg-purple-600/80 border border-purple-500/30 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-soft-white/30 hover:text-danger hover:bg-danger/10 transition-colors"
                title="Sign out"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
