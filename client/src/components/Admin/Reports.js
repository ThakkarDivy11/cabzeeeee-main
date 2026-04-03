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
            toast.error('Please select both start and end dates');
        }
    };

    const clearDateFilter = () => {
        setDateRange({ startDate: '', endDate: '' });
        setLoading(true);
        setTimeout(() => fetchAllReports(), 100);
    };

    const exportToCSV = () => {
        if (!overview || !userStats || !rideStats || !revenueStats) {
            toast.error('No data to export');
            return;
        }

        const csvContent = [
            ['CabZee System Reports'],
            ['Generated on:', new Date().toLocaleString()],
            [''],
            ['OVERVIEW STATISTICS'],
            ['Total Users', overview.totalUsers],
            ['Total Rides', overview.totalRides],
            ['Completed Rides', overview.completedRides],
            ['Active Drivers', overview.activeDrivers],
            ['Total Revenue', `₹${overview.totalRevenue.toFixed(2)}`],
            [''],
            ['USER STATISTICS'],
            ['Total Users', userStats.totalUsers],
            ['Riders', userStats.usersByRole.riders],
            ['Drivers', userStats.usersByRole.drivers],
            ['Admins', userStats.usersByRole.admins],
            ['Verified Users', userStats.verifiedUsers],
            ['Unverified Users', userStats.unverifiedUsers],
            [''],
            ['RIDE STATISTICS'],
            ['Total Rides', rideStats.totalRides],
            ['Pending', rideStats.ridesByStatus.pending],
            ['Accepted', rideStats.ridesByStatus.accepted],
            ['Completed', rideStats.ridesByStatus.completed],
            ['Cancelled', rideStats.ridesByStatus.cancelled],
            ['Average Fare', `₹${rideStats.averageFare}`],
            ['Average Distance', `${rideStats.averageDistance} km`],
            [''],
            ['REVENUE STATISTICS'],
            ['Total Revenue', `₹${revenueStats.totalRevenue}`],
            ['Average Fare', `₹${revenueStats.averageFare}`],
            ['Completed Rides', revenueStats.completedRides]
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cabzee-reports-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Report exported successfully');
    };

    const exportToPDF = () => {
        if (!overview || !userStats || !rideStats || !revenueStats) {
            toast.error('No data to export');
            return;
        }

        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('CabZee System Reports', 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        let yPos = 40;

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Overview Statistics', 14, yPos);
        yPos += 5;
        
        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Total Users', overview.totalUsers],
                ['Total Rides', overview.totalRides],
                ['Completed Rides', overview.completedRides],
                ['Active Drivers', overview.activeDrivers],
                ['Total Revenue', `Rs. ${overview.totalRevenue.toFixed(2)}`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 31, 63] }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;

        doc.setFontSize(14);
        doc.text('User Statistics', 14, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Total Users', userStats.totalUsers],
                ['Riders', userStats.usersByRole.riders],
                ['Drivers', userStats.usersByRole.drivers],
                ['Admins', userStats.usersByRole.admins],
                ['Verified Users', userStats.verifiedUsers],
                ['Unverified Users', userStats.unverifiedUsers],
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 31, 63] }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Ride Statistics', 14, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Total Rides', rideStats.totalRides],
                ['Pending', rideStats.ridesByStatus.pending],
                ['Accepted', rideStats.ridesByStatus.accepted],
                ['Completed', rideStats.ridesByStatus.completed],
                ['Cancelled', rideStats.ridesByStatus.cancelled],
                ['Average Fare', `Rs. ${rideStats.averageFare}`],
                ['Average Distance', `${rideStats.averageDistance} km`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 31, 63] }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.text('Revenue Statistics', 14, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Total Revenue', `Rs. ${revenueStats.totalRevenue}`],
                ['Average Fare', `Rs. ${revenueStats.averageFare}`],
                ['Completed Rides', revenueStats.completedRides]
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 31, 63] }
        });

        doc.save(`cabzee-reports-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF exported successfully');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-600">Loading reports...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-soft-white font-sans text-navy selection:bg-sky-blue/20">
            {/* Intelligence Hub Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-navy/5 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/admin')}
                                className="mr-6 p-3 rounded-xl bg-navy/5 text-navy hover:bg-navy hover:text-soft-white transition-all duration-300 transform active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="flex items-center group cursor-pointer" onClick={() => navigate('/admin')}>
                                <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center mr-4 shadow-xl shadow-navy/20 transform group-hover:rotate-6 transition-all duration-300">
                                    <span className="text-soft-white text-xl font-black italic">A</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-black tracking-tighter text-navy uppercase leading-none italic">Intelligence Hub</h1>
                                    <p className="text-[10px] font-bold text-sky-blue uppercase tracking-[0.2em] mt-1">Strategic Analytics & Reporting</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 px-5 py-3 bg-navy text-soft-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-navy/20 hover:bg-sky-blue hover:shadow-sky-blue/20 transition-all active:scale-95 group"
                            >
                                <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Generate CSV
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-500 hover:shadow-red-500/20 transition-all active:scale-95 group"
                            >
                                <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Generate PDF
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                {/* Date Filter Command Center */}
                <div className="bg-white shadow-2xl rounded-[3rem] p-10 border border-navy/5 mb-16 relative overflow-hidden group/filter">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-navy/[0.02] rounded-full -mr-16 -mt-16 transition-transform group-hover/filter:scale-110"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="flex-1">
                            <h2 className="text-xl font-black text-navy uppercase tracking-tighter mb-2 italic flex items-center gap-3">
                                <div className="w-8 h-8 bg-sky-blue/10 rounded-lg flex items-center justify-center text-sky-blue">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                Temporal Scope
                            </h2>
                            <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] ml-11 italic">Define the reporting window for analytical extraction</p>
                        </div>

                        <div className="flex flex-wrap items-end gap-6 lg:gap-10">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-navy/20 uppercase tracking-widest ml-1">Activation Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={dateRange.startDate}
                                    onChange={handleDateChange}
                                    className="px-6 py-4 bg-soft-white border border-navy/5 rounded-2xl text-navy font-bold focus:ring-4 focus:ring-navy/5 outline-none transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-navy/20 uppercase tracking-widest ml-1">Termination Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={dateRange.endDate}
                                    onChange={handleDateChange}
                                    className="px-6 py-4 bg-soft-white border border-navy/5 rounded-2xl text-navy font-bold focus:ring-4 focus:ring-navy/5 outline-none transition-all shadow-inner"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={applyDateFilter}
                                    className="px-10 py-5 bg-navy text-soft-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-navy/10 hover:shadow-navy/20 transition-all active:scale-95"
                                >
                                    Sync Report
                                </button>
                                {(dateRange.startDate || dateRange.endDate) && (
                                    <button
                                        onClick={clearDateFilter}
                                        className="px-6 py-5 bg-navy/5 text-navy/40 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-navy hover:bg-navy/10 transition-all active:scale-95"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Overview Metrics */}
                {overview && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {[
                            { label: 'Network Citizens', value: overview.totalUsers, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', color: 'sky-blue' },
                            { label: 'Total Deployments', value: overview.totalRides, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'navy' },
                            { label: 'Active Personnel', value: overview.activeDrivers, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'sky-blue' },
                            { label: 'Gross Yield (INR)', value: `₹${overview.totalRevenue.toLocaleString()}`, icon: 'M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z', color: 'navy' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white shadow-2xl rounded-[3rem] p-10 border border-navy/5 relative overflow-hidden group/stat hover:scale-[1.02] transition-all duration-500">
                                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color === 'sky-blue' ? 'bg-sky-blue/[0.03]' : 'bg-navy/[0.03]'} rounded-full -mr-12 -mt-12 transition-transform group-hover/stat:scale-150 duration-700`}></div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`w-14 h-14 ${stat.color === 'sky-blue' ? 'bg-sky-blue/10 text-sky-blue' : 'bg-navy/10 text-navy'} rounded-2xl flex items-center justify-center shadow-inner`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon} />
                                        </svg>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-navy/20 uppercase tracking-[0.3em]">Metric ID: 00{idx + 1}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-navy tracking-[0.2em] uppercase mb-1">{stat.label}</p>
                                <p className="text-4xl font-black text-navy tracking-tighter italic leading-none">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tactical Deep-Dive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* User Matrix */}
                    {userStats && (
                        <div className="bg-white shadow-2xl rounded-[3.5rem] p-12 border border-navy/5 relative group/card flex flex-col">
                            <h3 className="text-xl font-black text-navy uppercase tracking-tighter mb-10 flex items-center gap-4 italic underline decoration-sky-blue decoration-4 underline-offset-8">
                                Population Matrix
                            </h3>
                            <div className="space-y-6 flex-1">
                                {[
                                    { label: 'Total Network Citizen Index', value: userStats.totalUsers, bold: true },
                                    { label: 'Authorized Client Core (Riders)', value: userStats.usersByRole.riders },
                                    { label: 'Operation Fulfillment Partners (Drivers)', value: userStats.usersByRole.drivers },
                                    { label: 'Validated Clearance Profiles', value: userStats.verifiedUsers, color: 'text-green-600' },
                                    { label: 'Restricted Status Profiles', value: userStats.unverifiedUsers, color: 'text-red-500' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-4 border-b border-navy/5 group/row hover:bg-soft-white/50 px-4 rounded-xl transition-all">
                                        <span className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] group-hover/row:text-navy transition-colors">{item.label}</span>
                                        <span className={`text-xl font-black ${item.color || 'text-navy'} tracking-tighter italic`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 pt-8 border-t border-navy/5 text-[9px] font-bold text-navy/20 uppercase tracking-widest italic flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-navy/10"></div>
                                Cross-platform identity synchronization active
                            </div>
                        </div>
                    )}

                    {/* Mission Logistics Matrix */}
                    {rideStats && (
                        <div className="bg-navy shadow-[0_40px_100px_-15px_rgba(0,31,63,0.3)] rounded-[3.5rem] p-12 border border-white/10 relative overflow-hidden group/ride">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full -mr-32 -mt-32 group-hover/ride:scale-110 duration-1000"></div>
                            <h3 className="text-xl font-black text-soft-white uppercase tracking-tighter mb-10 italic underline decoration-sky-blue decoration-4 underline-offset-8">
                                Mission Analytics
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Total Mission Cycle Deployments', value: rideStats.totalRides, border: 'border-white/10', color: 'text-soft-white' },
                                    { label: 'Successful Target Extractions (Completed)', value: rideStats.ridesByStatus.completed, border: 'border-white/10', color: 'text-green-400' },
                                    { label: 'Queued Deployment Operations (Pending)', value: rideStats.ridesByStatus.pending, border: 'border-white/10', color: 'text-yellow-400' },
                                    { label: 'Abort Protocol Triggers (Cancelled)', value: rideStats.ridesByStatus.cancelled, border: 'border-white/10', color: 'text-red-400' },
                                    { label: 'Mean Contract Yield Per Mission', value: `₹${rideStats.averageFare}`, border: 'border-white/0', color: 'text-sky-blue' }
                                ].map((item, idx) => (
                                    <div key={idx} className={`flex justify-between items-center py-4 border-b ${item.border} group/row hover:bg-white/5 px-4 rounded-xl transition-all`}>
                                        <span className="text-[10px] font-black text-soft-white/30 uppercase tracking-[0.2em] group-hover/row:text-soft-white transition-colors">{item.label}</span>
                                        <span className={`text-xl font-black ${item.color} tracking-tighter italic`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 pt-8 border-t border-white/5 text-[9px] font-bold text-soft-white/20 uppercase tracking-widest italic flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                Real-time mission telemetry intercept online
                            </div>
                        </div>
                    )}

                    {/* Fiscal Performance Matrix */}
                    {revenueStats && (
                        <div className="bg-white shadow-2xl rounded-[3.5rem] p-12 border border-navy/5 relative group/revenue flex flex-col">
                            <h3 className="text-xl font-black text-navy uppercase tracking-tighter mb-10 italic underline decoration-sky-blue decoration-4 underline-offset-8">
                                Fiscal Integrity
                            </h3>
                            <div className="space-y-6 flex-1">
                                {[
                                    { label: 'Gross Network Liquidity (INR)', value: `₹${revenueStats.totalRevenue.toLocaleString()}`, color: 'text-navy' },
                                    { label: 'Mean Transactional Value', value: `₹${revenueStats.averageFare.toLocaleString()}`, color: 'text-sky-blue' },
                                    { label: 'Settled Contract Volume', value: revenueStats.completedRides, color: 'text-navy' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-6 border-b border-navy/5 group/row hover:bg-soft-white/50 px-4 rounded-xl transition-all">
                                        <span className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] group-hover/row:text-navy transition-colors">{item.label}</span>
                                        <span className={`text-2xl font-black ${item.color} tracking-tighter italic leading-none`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Operative Efficiency Matrix */}
                    {driverStats && (
                        <div className="bg-navy shadow-[0_40px_100px_-15px_rgba(0,31,63,0.3)] rounded-[3.5rem] p-12 border border-white/10 relative group/driver">
                            <h3 className="text-xl font-black text-soft-white uppercase tracking-tighter mb-10 italic underline decoration-sky-blue decoration-4 underline-offset-8">
                                Operative Status
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Registered Network Operatives', value: driverStats.totalDrivers, color: 'text-soft-white' },
                                    { label: 'Live Radio Uplinked (Online)', value: driverStats.onlineDrivers, color: 'text-green-400' },
                                    { label: 'Verified Integrity Clearance', value: driverStats.verifiedDrivers, color: 'text-sky-blue' },
                                    { label: 'Mean Operative Merit Rating', value: `${driverStats.averageRating} ★`, color: 'text-yellow-400' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-6 border-b border-white/5 group/row hover:bg-white/5 px-4 rounded-xl transition-all">
                                        <span className="text-[10px] font-black text-soft-white/30 uppercase tracking-[0.2em] group-hover/row:text-soft-white transition-colors">{item.label}</span>
                                        <span className={`text-2xl font-black ${item.color} tracking-tighter italic leading-none`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Top-Tier Operative Index */}
                {driverStats && driverStats.topDrivers && driverStats.topDrivers.length > 0 && (
                    <div className="bg-white shadow-2xl rounded-[4rem] p-16 border border-navy/5 mt-16 relative overflow-hidden group/top">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-navy/[0.01] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover/top:scale-150"></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
                            <div>
                                <h2 className="text-3xl font-black text-navy uppercase tracking-tighter mb-3 italic">Alpha Operative Pool</h2>
                                <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.4em] ml-1">The 0.1% of network efficiency fulfillment partners</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-navy/5">
                                <thead className="bg-navy">
                                    <tr>
                                        <th className="px-10 py-8 text-left text-[10px] font-black text-soft-white/60 uppercase tracking-[0.3em] rounded-tl-[2rem]">Identity Profile</th>
                                        <th className="px-10 py-8 text-left text-[10px] font-black text-soft-white/60 uppercase tracking-[0.3em]">Communication Vector</th>
                                        <th className="px-10 py-8 text-left text-[10px] font-black text-soft-white/60 uppercase tracking-[0.3em]">Mission Volume</th>
                                        <th className="px-10 py-8 text-left text-[10px] font-black text-soft-white/60 uppercase tracking-[0.3em] rounded-tr-[2rem]">Performance Merit</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-navy/5">
                                    {driverStats.topDrivers.map((driver, index) => (
                                        <tr key={driver._id} className="hover:bg-soft-white transition-all duration-300 group/row">
                                            <td className="px-10 py-10 whitespace-nowrap">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-soft-white font-black italic shadow-xl group-hover/row:rotate-6 transition-transform">
                                                        {driver.name.charAt(0)}
                                                    </div>
                                                    <div className="text-lg font-black text-navy uppercase tracking-tighter leading-none">{driver.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-10 whitespace-nowrap text-sm font-bold text-navy/50 lowercase tracking-tight">{driver.email}</td>
                                            <td className="px-10 py-10 whitespace-nowrap text-2xl font-black text-navy tracking-tighter italic">{driver.totalRides}</td>
                                            <td className="px-10 py-10 whitespace-nowrap">
                                                <div className="px-6 py-2 bg-yellow-500/10 rounded-full inline-flex items-center gap-3 border border-yellow-500/20">
                                                    <span className="text-lg font-black text-yellow-600 italic leading-none">{driver.rating.toFixed(1)}</span>
                                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-20 flex justify-center pb-20">
                    <div className="bg-purple-500/30 backdrop-blur-sm px-10 py-5 rounded-full border border-purple-300/50 flex items-center space-x-6 shadow-lg shadow-purple-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-purple-200 rounded-full animate-pulse"></div>
                            <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                        </div>
                        <p className="text-[10px] font-black text-purple-100/90 uppercase tracking-[0.5em]">Reporting Subsystem: Active Data Ingestion established</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;
