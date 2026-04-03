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
                toast.success('Settings updated successfully');
                setSettings(data.data);
            } else {
                toast.error(data.message || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-600">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-soft-white font-sans text-navy selection:bg-sky-blue/20">
            {/* Strategic Command Header */}
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
                                    <span className="text-soft-white text-xl font-black italic">S</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-black tracking-tighter text-navy uppercase leading-none italic">System Vault</h1>
                                    <p className="text-[10px] font-bold text-sky-blue uppercase tracking-[0.2em] mt-1">Foundational Configurations</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex flex-col items-end mr-4">
                                <p className="text-[9px] font-black text-navy/20 uppercase tracking-widest mb-0.5">Security Protocol</p>
                                <p className="text-[10px] font-black text-navy uppercase">AES-256 Synchronized</p>
                            </div>
                            <div className="w-12 h-12 bg-soft-white rounded-xl border border-navy/5 flex items-center justify-center shadow-inner">
                                <svg className="w-6 h-6 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="mb-20">
                    <h2 className="text-6xl font-black text-navy tracking-tighter mb-4 uppercase italic">Global Parameters</h2>
                    <div className="flex items-center space-x-6">
                        <div className="h-1.5 w-24 bg-sky-blue rounded-full"></div>
                        <p className="text-sm font-bold text-navy/40 uppercase tracking-[0.4em] italic leading-relaxed">System-wide operational thresholds & algorithmic models</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12 mb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Identity & Support Vault */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-12">
                            <div className="bg-white shadow-2xl rounded-[3.5rem] p-12 border border-navy/5 relative overflow-hidden group/card shadow-navy/5">
                                <div className="absolute -top-12 -right-12 w-48 h-48 bg-navy/[0.02] rounded-full group-hover/card:scale-110 transition-transform duration-700"></div>
                                <h3 className="text-lg font-black text-navy uppercase tracking-tighter mb-10 flex items-center gap-4 italic">
                                    <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-soft-white shadow-lg shadow-navy/20">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    Core Identity
                                </h3>
                                <div className="space-y-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] ml-2">App Operational Alias</label>
                                        <input
                                            type="text"
                                            name="appName"
                                            value={settings.appName}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-5 bg-soft-white border border-navy/5 rounded-[1.5rem] text-navy font-black italic focus:ring-4 focus:ring-navy/5 border-transparent focus:border-navy outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] ml-2">Global Support Endpoint</label>
                                        <input
                                            type="email"
                                            name="supportEmail"
                                            value={settings.supportEmail}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-5 bg-soft-white border border-navy/5 rounded-[1.5rem] text-navy font-black italic focus:ring-4 focus:ring-navy/5 border-transparent focus:border-navy outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] ml-2">Direct Intelligence Line</label>
                                        <input
                                            type="tel"
                                            name="supportPhone"
                                            value={settings.supportPhone}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-5 bg-soft-white border border-navy/5 rounded-[1.5rem] text-navy font-black italic focus:ring-4 focus:ring-navy/5 border-transparent focus:border-navy outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fiscal Controls Vault */}
                        <div className="lg:col-span-12 xl:col-span-7">
                            <div className="bg-navy shadow-[0_40px_100px_-15px_rgba(0,31,63,0.3)] rounded-[4rem] p-12 border border-white/10 relative overflow-hidden group/vault h-full flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full -mr-32 -mt-32 group-hover/vault:translate-x-8 transition-transform duration-1000"></div>

                                <div>
                                    <h3 className="text-lg font-black text-soft-white uppercase tracking-tighter mb-12 flex items-center gap-4 italic">
                                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-soft-white border border-white/20 shadow-xl">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        Yield Optimization
                                    </h3>

                                    <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-inner mb-12">
                                        <p className="text-[10px] font-black text-soft-white/40 uppercase tracking-[0.3em] mb-6">Partner Retention Ratio (PRR)</p>
                                        <div className="flex items-center gap-10">
                                            <div className="text-7xl font-black text-soft-white tracking-tighter italic select-none">{settings.driverCommissionPercentage}<span className="text-2xl text-sky-blue ml-2">%</span></div>
                                            <div className="flex-1">
                                                <input
                                                    type="range"
                                                    name="driverCommissionPercentage"
                                                    value={settings.driverCommissionPercentage}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className="w-full accent-sky-blue h-2 bg-white/10 rounded-full appearance-none cursor-pointer group-hover/vault:h-3 transition-all"
                                                />
                                                <div className="flex justify-between mt-4">
                                                    <span className="text-[8px] font-black text-soft-white/20 uppercase tracking-widest">Minimal Retention</span>
                                                    <span className="text-[8px] font-black text-soft-white/20 uppercase tracking-widest">Full Disbursement</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-soft-white/30 uppercase tracking-[0.2em] ml-2">Communication Array</p>
                                        <div className="flex flex-col gap-4">
                                            <label className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all duration-300">
                                                <span className="text-[10px] font-black text-soft-white uppercase tracking-widest">Email Uplink</span>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        name="enableEmailNotifications"
                                                        checked={settings.enableEmailNotifications}
                                                        onChange={handleInputChange}
                                                        className="peer hidden"
                                                    />
                                                    <div className="w-12 h-6 bg-white/10 rounded-full border border-white/10 peer-checked:bg-sky-blue transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-3.5 after:h-3.5 after:rounded-full after:transition-all peer-checked:after:translate-x-6"></div>
                                                </div>
                                            </label>
                                            <label className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all duration-300">
                                                <span className="text-[10px] font-black text-soft-white uppercase tracking-widest">SMS Gateway</span>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        name="enableSmsNotifications"
                                                        checked={settings.enableSmsNotifications}
                                                        onChange={handleInputChange}
                                                        className="peer hidden"
                                                    />
                                                    <div className="w-12 h-6 bg-white/10 rounded-full border border-white/10 peer-checked:bg-sky-blue transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-3.5 after:h-3.5 after:rounded-full after:transition-all peer-checked:after:translate-x-6"></div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex items-end text-right">
                                        <p className="text-[9px] font-bold text-soft-white/20 leading-relaxed italic">Global encryption protocols active. All transactional split updates are broadcasted via secure RPC tunnels.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Algorithmic Fare Vault */}
                    <div className="bg-white shadow-2xl rounded-[4rem] p-16 border border-navy/5 relative group/pricing overflow-hidden mt-12">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-sky-blue to-transparent opacity-30"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-16">
                            <div>
                                <h3 className="text-2xl font-black text-navy uppercase tracking-tighter mb-3 italic flex items-center gap-4">
                                    <div className="p-3 bg-sky-blue/10 rounded-2xl text-sky-blue shadow-inner">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    Dynamic Rate Array
                                </h3>
                                <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.3em] ml-16">Real-time computational variables for fare projection</p>
                            </div>

                            <div className="flex items-center gap-4 px-6 py-3 bg-navy rounded-2xl shadow-xl shadow-navy/10">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[9px] font-black text-soft-white uppercase tracking-widest">Active Calculator linked</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {[
                                { label: 'Activation Fare', name: 'baseFare', desc: 'Initial drop flag rate' },
                                { label: 'Distance Vector', name: 'perKmRate', desc: 'Yield per KM deployed' },
                                { label: 'Temporal Vector', name: 'perMinuteRate', desc: 'Cost per active minute' },
                                { label: 'Violation Levy', name: 'cancellationFee', desc: 'Abort protocol penalty' }
                            ].map((item, idx) => (
                                <div key={idx} className="group/input space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] group-hover/input:text-sky-blue transition-colors">{item.label}</label>
                                        <span className="text-[8px] font-black text-navy/10 uppercase tracking-widest">VAR_{idx + 1}</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name={item.name}
                                            value={settings[item.name]}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            className="w-full pl-14 pr-8 py-6 bg-soft-white border-2 border-transparent focus:border-navy/10 rounded-3xl text-2xl font-black text-navy outline-none transition-all shadow-inner group-hover/input:shadow-lg italic"
                                        />
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-sky-blue italic select-none">₹</div>
                                    </div>
                                    <p className="text-[9px] font-bold text-navy/20 uppercase tracking-widest text-right pr-4 italic">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-12">
                        <div className="flex items-center gap-4 group cursor-help">
                            <div className="w-10 h-10 rounded-full bg-soft-white border border-navy/5 flex items-center justify-center text-navy/20 group-hover:bg-navy group-hover:text-soft-white transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest">Operational Policy</p>
                                <p className="text-[10px] font-bold text-navy/60 italic">Updates are permanent and global upon commitment.</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="relative px-12 py-6 bg-navy text-soft-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-navy/40 hover:bg-sky-blue hover:shadow-sky-blue/30 transition-all active:scale-[0.98] disabled:opacity-50 group hover:-translate-y-1"
                        >
                            {saving ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 bg-soft-white rounded-full animate-ping"></div>
                                    Committing Protocol...
                                </div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    Commit Global Sync
                                    <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:rotate-45 transition-transform">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-20 flex justify-center pb-20">
                    <div className="bg-white/50 backdrop-blur-sm px-10 py-5 rounded-full border border-navy/5 flex items-center space-x-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-navy rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-sky-blue rounded-full animate-pulse delay-75"></div>
                            <div className="w-3 h-3 bg-navy/20 rounded-full animate-pulse delay-150"></div>
                        </div>
                        <p className="text-[10px] font-black text-navy/40 uppercase tracking-[0.5em]">System Pulse Optimized: Foundational Core Online</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SystemSettings;
