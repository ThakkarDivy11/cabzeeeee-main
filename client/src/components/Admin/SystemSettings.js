import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        appName: '',
        supportEmail: '',
        supportPhone: '',
        baseFare: 0,
        perKmRate: 0,
        perMinuteRate: 0,
        cancellationFee: 0,
        driverCommissionPercentage: 0,
        enableEmailNotifications: true,
        enableSmsNotifications: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin-login');
                return;
            }

            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setSettings(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch settings');
                if (response.status === 401 || response.status === 403) navigate('/admin-login');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Settings updated');
                setSettings(data.data);
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-500">Loading system vault...</div>;

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Configurations</h2>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Manage foundational platform variables</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-3 shadow-sm dark:border-white/5 dark:bg-white/5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Settings Protocol Active</span>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* App Info */}
                    <div className="rounded-[4rem] border border-gray-200 bg-white p-12 shadow-sm dark:border-white/5 dark:bg-neutral-900/40">
                        <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white lowercase mb-10">Identity & Contact</h3>
                        <div className="grid gap-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Platform Alias</p>
                                <input
                                    type="text"
                                    name="appName"
                                    value={settings.appName}
                                    onChange={handleInputChange}
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-white/5 dark:border-white/5 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Global Support Email</p>
                                <input
                                    type="email"
                                    name="supportEmail"
                                    value={settings.supportEmail}
                                    onChange={handleInputChange}
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-white/5 dark:border-white/5 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Direct Support Line</p>
                                <input
                                    type="tel"
                                    name="supportPhone"
                                    value={settings.supportPhone}
                                    onChange={handleInputChange}
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-white/5 dark:border-white/5 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Revenue & Commission */}
                    <div className="rounded-[4rem] bg-black p-12 text-white shadow-2xl shadow-black/20 dark:bg-[#111]">
                        <h3 className="text-2xl font-bold tracking-tight text-[#FFD000] lowercase mb-12">Revenue Distribution</h3>
                        
                        <div className="rounded-[2.5rem] bg-white/5 p-8 border border-white/5 mb-10 shadow-inner">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Driver Commission Ratio</p>
                            <div className="flex items-center gap-10">
                                <div className="text-6xl font-black text-[#FFD000] tracking-tighter italic">{settings.driverCommissionPercentage}<span className="text-2xl ml-1">%</span></div>
                                <input
                                    type="range"
                                    name="driverCommissionPercentage"
                                    value={settings.driverCommissionPercentage}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    className="h-2 flex-1 appearance-none rounded-full bg-white/10 accent-[#FFD000]"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Notifications Gateways</p>
                            <label className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-6 cursor-pointer hover:bg-white/10 transition-all">
                                <span className="text-sm font-bold">Email Notifications</span>
                                <input
                                    type="checkbox"
                                    name="enableEmailNotifications"
                                    checked={settings.enableEmailNotifications}
                                    onChange={handleInputChange}
                                    className="h-6 w-11 appearance-none rounded-full bg-white/10 transition-all checked:bg-[#FFD000] cursor-pointer"
                                />
                            </label>
                            <label className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-6 cursor-pointer hover:bg-white/10 transition-all">
                                <span className="text-sm font-bold">SMS Base Gateway</span>
                                <input
                                    type="checkbox"
                                    name="enableSmsNotifications"
                                    checked={settings.enableSmsNotifications}
                                    onChange={handleInputChange}
                                    className="h-6 w-11 appearance-none rounded-full bg-white/10 transition-all checked:bg-[#FFD000] cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Economics Grid */}
                <div className="rounded-[4rem] border border-gray-200 bg-white p-16 shadow-sm dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic mb-12">Pricing Algorithm</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[
                            { label: 'Base Fare', name: 'baseFare', desc: 'Initial flag drop' },
                            { label: 'Distance Rate', name: 'perKmRate', desc: 'Per kilometer' },
                            { label: 'Time Rate', name: 'perMinuteRate', desc: 'Per active minute' },
                            { label: 'Cancel Fee', name: 'cancellationFee', desc: 'Abort penalty' }
                        ].map((item, idx) => (
                            <div key={idx} className="space-y-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{item.label}</p>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-[#FFD000] italic">₹</span>
                                    <input
                                        type="number"
                                        name={item.name}
                                        value={settings[item.name]}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        className="w-full rounded-[2rem] border-2 border-transparent bg-gray-50 p-6 pl-12 text-2xl font-black text-gray-900 focus:border-[#FFD000]/20 focus:outline-none dark:bg-white/5 dark:text-white"
                                    />
                                </div>
                                <p className="text-right text-[8px] font-bold text-gray-300 uppercase italic pr-4">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-10 rounded-[3rem] dark:bg-white/5">
                    <div className="flex items-center gap-6">
                         <div className="h-12 w-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 dark:border-white/10">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                         </div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px]">Changes applied globally and in real-time across the platform.</p>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-3xl bg-black px-16 py-6 text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all hover:scale-105 active:scale-95 dark:bg-[#FFD000] dark:text-black"
                    >
                        {saving ? (
                            <span className="flex items-center gap-4">
                                <div className="h-4 w-4 border-2 border-white animate-spin rounded-full border-t-transparent dark:border-black dark:border-t-transparent" />
                                Synchronizing...
                            </span>
                        ) : (
                            'Save All Configurations'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SystemSettings;
