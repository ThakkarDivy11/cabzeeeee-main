import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-[#06060a] dark:text-gray-100 relative overflow-hidden">
            {/* Clean Premium Grid Background — Subtle pattern for structural depth */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="cz-grid absolute inset-0 transition-opacity duration-500" />
            </div>
            
            <Sidebar
                isOpen={sidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
                user={user}
            />

            <Navbar
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                user={user}
            />

            {/* Content area with relative z-index to stay above background grid */}
            <main className="lg:pl-[220px] pt-16 pb-20 lg:pb-0 min-h-screen relative z-10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                    <Outlet />
                </div>
            </main>

            {/* Mobile bottom navigation — hidden on lg+ */}
            <MobileBottomNav />
        </div>
    );
};

export default Layout;
