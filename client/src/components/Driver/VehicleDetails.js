import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VehicleDetails = () => {
    // eslint-disable-next-line no-unused-vars
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        color: '',
        licensePlate: '',
        vehicleType: 'car'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    if (data.data.role !== 'driver') {
                        navigate('/login');
                        return;
                    }
                    setUser(data.data);
                    if (data.data.vehicleInfo) {
                        setFormData({
                            make: data.data.vehicleInfo.make || '',
                            model: data.data.vehicleInfo.model || '',
                            year: data.data.vehicleInfo.year || '',
                            color: data.data.vehicleInfo.color || '',
                            licensePlate: data.data.vehicleInfo.licensePlate || '',
                            vehicleType: data.data.vehicleInfo.vehicleType || 'car'
                        });
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to fetch vehicle data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    vehicleInfo: {
                        make: formData.make,
                        model: formData.model,
                        year: parseInt(formData.year) || undefined,
                        color: formData.color,
                        licensePlate: formData.licensePlate,
                        vehicleType: formData.vehicleType
                    }
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Vehicle updated');
                localStorage.setItem('user', JSON.stringify(data.data));
                navigate('/driver-profile');
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

    if (loading) return <div className="p-20 text-center font-bold text-gray-500 uppercase tracking-widest">Accessing vehicle log...</div>;

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/driver-profile')}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-400 dark:hover:bg-[rgba(255,255,255,0.10)]"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Vehicle Details</h2>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Manage your active fleet asset</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl">
                 <div className="rounded-[4rem] border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl overflow-hidden">
                    <div className="p-12 border-b border-gray-50 dark:border-white/5 bg-black dark:bg-[#FFD000]">
                        <h3 className="text-4xl font-black text-[#FFD000] dark:text-black tracking-tighter uppercase italic">Specifications</h3>
                        <p className="mt-2 text-xs font-bold text-gray-400 dark:text-black/50 uppercase tracking-widest">High-precision diagnostic data for network verification</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-12 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Manufacturer</label>
                                <input
                                    type="text"
                                    name="make"
                                    value={formData.make}
                                    onChange={handleChange}
                                    placeholder="e.g. Maruti Suzuki"
                                    required
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-black/20 dark:border-white/5 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Model Name</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder="e.g. Dzire 2024"
                                    required
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-black/20 dark:border-white/5 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Registration Year</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    placeholder="2024"
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-black/20 dark:border-white/5 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Vehicle Color</label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    placeholder="White"
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-black/20 dark:border-white/5 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Plate Number</label>
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={formData.licensePlate}
                                    onChange={handleChange}
                                    placeholder="MH-12-AB-1234"
                                    required
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-black/20 dark:border-white/5 dark:text-white uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Type</label>
                                <select
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-black/20 dark:border-white/5 dark:text-white"
                                >
                                    <option value="car">Car / Sedan</option>
                                    <option value="bike">Bike / Express</option>
                                    <option value="auto">Auto / Rickshaw</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/driver-profile')}
                                className="rounded-2xl border border-gray-200 bg-white px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.05)]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-2xl bg-black px-12 py-5 text-[10px] font-black uppercase tracking-[0.2em] force-light-text shadow-xl hover:scale-105 active:scale-95 transition-all dark:bg-[#FFD000] dark:text-black"
                            >
                                {saving ? 'Updating...' : 'Save Vehicle Info'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default VehicleDetails;
