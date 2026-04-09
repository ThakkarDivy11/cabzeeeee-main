import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [rideStats, setRideStats] = useState(null);
    const [revenueStats, setRevenueStats] = useState(null);
    const [driverStats, setDriverStats] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllReports = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin-login');
                return;
            }

            const queryParams = dateRange.startDate && dateRange.endDate
                ? `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
                : '';

            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const headers = { 'Authorization': `Bearer ${token}` };

            const [overviewRes, usersRes, ridesRes, revenueRes, driversRes] = await Promise.all([
                fetch(`${baseUrl}/api/reports/overview`, { headers }),
                fetch(`${baseUrl}/api/reports/users${queryParams}`, { headers }),
                fetch(`${baseUrl}/api/reports/rides${queryParams}`, { headers }),
                fetch(`${baseUrl}/api/reports/revenue${queryParams}`, { headers }),
                fetch(`${baseUrl}/api/reports/drivers`, { headers })
            ]);

            const [overviewData, usersData, ridesData, revenueData, driversData] = await Promise.all([
                overviewRes.json(),
                usersRes.json(),
                ridesRes.json(),
                revenueRes.json(),
                driversRes.json()
            ]);

            if (overviewData.success) setOverview(overviewData.data);
            if (usersData.success) setUserStats(usersData.data);
            if (ridesData.success) setRideStats(ridesData.data);
            if (revenueData.success) setRevenueStats(revenueData.data);
            if (driversData.success) setDriverStats(driversData.data);

        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        setDateRange(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const applyDateFilter = () => {
        if (dateRange.startDate && dateRange.endDate) {
            setLoading(true);
            fetchAllReports();
        } else {
            toast.error('Select both dates');
        }
    };

    const clearDateFilter = () => {
        setDateRange({ startDate: '', endDate: '' });
        setLoading(true);
        setTimeout(() => fetchAllReports(), 100);
    };

    const exportToCSV = () => {
        if (!overview || !userStats || !rideStats || !revenueStats) {
            toast.error('No data found');
            return;
        }

        const csvContent = [
            ['CabZee Platform Reports'],
            ['Generated on:', new Date().toLocaleString()],
            [''],
            ['SUMMARY'],
            ['Total Users', overview.totalUsers],
            ['Total Rides', overview.totalRides],
            ['Active Drivers', overview.activeDrivers],
            ['Total Revenue', `INR ${overview.totalRevenue.toFixed(2)}`],
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cabzee-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('CSV Exported');
    };

    const exportToPDF = () => {
        if (!overview || !userStats || !rideStats || !revenueStats) {
            toast.error('No data found');
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('CabZee Performance Report', 14, 25);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

        autoTable(doc, {
            startY: 45,
            head: [['Overview Metric', 'Value']],
            body: [
                ['Total Platform Users', overview.totalUsers],
                ['Total Trips Fulfilled', overview.totalRides],
                ['Active Service Partners', overview.activeDrivers],
                ['Gross Revenue', `INR ${overview.totalRevenue.toFixed(2)}`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0] }
        });

        doc.save(`cabzee-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF Exported');
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-500">Loading analytics engine...</div>;

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-100 transition-all dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics</h2>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Platform Performance Intelligence</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={exportToCSV}
                        className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm transition-all hover:bg-gray-50 dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="rounded-xl bg-black px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:bg-neutral-800 transition-all dark:bg-[#FFD000] dark:text-black dark:hover:bg-[#ffe04d]"
                    >
                        Generate PDF
                    </button>
                </div>
            </header>

            {/* Filter Section */}
            <div className="rounded-[3rem] border border-gray-100 bg-white p-10 shadow-sm dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white lowercase mb-2">Reporting Parameters</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adjust scope for localized data aggregation</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="space-y-2">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Start Date</p>
                            <input
                                type="date"
                                name="startDate"
                                value={dateRange.startDate}
                                onChange={handleDateChange}
                                className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-white/5 dark:border-white/5 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">End Date</p>
                            <input
                                type="date"
                                name="endDate"
                                value={dateRange.endDate}
                                onChange={handleDateChange}
                                className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-white/5 dark:border-white/5 dark:text-white"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={applyDateFilter}
                                className="rounded-xl bg-black px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all dark:bg-[#FFD000] dark:text-black"
                            >
                                Apply Scope
                            </button>
                            {(dateRange.startDate || dateRange.endDate) && (
                                <button
                                    onClick={clearDateFilter}
                                    className="rounded-xl border border-gray-200 bg-white px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:bg-white/5 dark:border-white/5"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview Grid */}
            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: 'Platform Users', value: overview.totalUsers, accent: 'text-gray-900 dark:text-white' },
                        { label: 'Total Trips', value: overview.totalRides, accent: 'text-gray-900 dark:text-white' },
                        { label: 'Active Drivers', value: overview.activeDrivers, accent: 'text-[#FFD000]' },
                        { label: 'Gross Revenue', value: `₹${Math.round(overview.totalRevenue).toLocaleString()}`, accent: 'text-emerald-500' }
                    ].map((stat, idx) => (
                        <div key={idx} className="rounded-[2.5rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-neutral-900/40">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                             <p className={`text-4xl font-black tracking-tighter ${stat.accent}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* User Deep-dive */}
                {userStats && (
                    <div className="rounded-[3.5rem] border border-gray-200 bg-white p-12 shadow-sm dark:border-white/5 dark:bg-neutral-900/40">
                        <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white lowercase mb-10">User Overview</h3>
                        <div className="space-y-8">
                            <div className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Registered</span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{userStats.totalUsers}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Riders</span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{userStats.usersByRole.riders}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Drivers</span>
                                <span className="text-2xl font-black text-[#FFD000]">{userStats.usersByRole.drivers}</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Accounts</span>
                                <span className="text-2xl font-black text-emerald-500">{userStats.verifiedUsers}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ride Deep-dive */}
                {rideStats && (
                    <div className="rounded-[3.5rem] bg-black p-12 text-white shadow-2xl shadow-black/20 dark:bg-[#111]">
                        <h3 className="text-2xl font-bold tracking-tight lowercase mb-10 text-[#FFD000]">Trip Analytics</h3>
                        <div className="space-y-8">
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Completed Trips</span>
                                <span className="text-2xl font-black text-white">{rideStats.ridesByStatus.completed}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cancelled Deployments</span>
                                <span className="text-2xl font-black text-red-500">{rideStats.ridesByStatus.cancelled}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Average Fare Revenue</span>
                                <span className="text-2xl font-black text-[#FFD000]">₹{rideStats.averageFare}</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mean Trip Distance</span>
                                <span className="text-2xl font-black text-white">{rideStats.averageDistance} KM</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Top Drivers */}
            {driverStats && driverStats.topDrivers && (
                <div className="rounded-[4rem] border border-gray-200 bg-white p-16 shadow-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic mb-12">Performance Leaders</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-black">
                                <tr className="border-b border-gray-100 dark:border-white/5">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Identity</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Trips</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {driverStats.topDrivers.map((driver, idx) => (
                                    <tr key={driver._id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center text-sm font-bold text-white dark:bg-[#FFD000] dark:text-black">
                                                    {driver.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate">{driver.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 lowercase">{driver.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic">
                                            {driver.totalRides}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="inline-flex items-center gap-3 rounded-full bg-[#FFD000]/10 px-5 py-2 border border-[#FFD000]/20">
                                                <span className="text-lg font-black text-[#FFD000] italic leading-none">{driver.rating.toFixed(1)}</span>
                                                <span className="text-[#FFD000] text-sm leading-none">★</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
