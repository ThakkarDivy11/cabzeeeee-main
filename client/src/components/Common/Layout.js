import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="min-h-screen bg-[#020617]">
            <Sidebar
                isOpen={sidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
                user={user}
            />

            <Navbar
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                user={user}
            />

            {/* pt-16 = navbar height, pb-20 lg:pb-0 = space for mobile bottom nav */}
            <main className="lg:pl-[220px] pt-16 pb-20 lg:pb-0 min-h-screen transition-all duration-300 bg-[#020617]">
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
