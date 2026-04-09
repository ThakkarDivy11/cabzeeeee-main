import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditDriverProfile = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        profilePicture: ''
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
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
                    setFormData({
                        name: data.data.name,
                        phone: data.data.phone,
                        profilePicture: data.data.profilePicture || ''
                    });
                    if (data.data.profilePicture) {
                        setPreview(data.data.profilePicture);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        if (e.target.name === 'profilePicture') {
            const file = e.target.files[0];
            if (file) {
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(file);
            }
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const token = localStorage.getItem('token');
            const uploadData = new FormData();
            uploadData.append('name', formData.name);
            uploadData.append('phone', formData.phone);
            if (selectedFile) {
                uploadData.append('profilePicture', selectedFile);
            }

            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Profile updated');
                localStorage.setItem('user', JSON.stringify(data.data));
                navigate('/driver-profile');
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Network error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Loading records...</div>;

    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
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
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Profile</h2>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Manage identity & communication</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl">
                <div className="rounded-[3.5rem] border border-gray-100 bg-white p-10 shadow-sm dark:border-[rgba(255,255,255,0.05)] dark:bg-neutral-900/40 dark:backdrop-blur-xl">
                    <div className="mb-12 border-b border-gray-50 pb-10 dark:border-[rgba(255,255,255,0.05)]">
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white lowercase">Bio & Verification</h3>
                         <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-relaxed">Update your operational name and contact protocols for the network registry.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-6 py-6 rounded-[2rem] bg-gray-50 dark:bg-[rgba(255,255,255,0.05)] border border-dashed border-gray-200 dark:border-[rgba(255,255,255,0.10)]">
                            <div className="group relative h-24 w-24">
                                <div className="h-full w-full overflow-hidden rounded-[1.5rem] border-4 border-white bg-black shadow-xl dark:border-neutral-800">
                                    {preview ? (
                                        <img 
                                            src={preview.startsWith('data:') || preview.startsWith('http') ? preview : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${preview}`} 
                                            alt="Profile" 
                                            className="h-full w-full object-cover transition-opacity group-hover:opacity-50" 
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-2xl font-black italic text-[#FFD000]">
                                            {formData.name?.charAt(0).toUpperCase() || 'D'}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-black force-light-text shadow-lg hover:scale-110 transition-all dark:bg-[#FFD000] dark:text-black">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    </svg>
                                    <input type="file" name="profilePicture" accept="image/*" className="hidden" onChange={handleChange} />
                                </label>
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Click icon to upload photo</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-black/20 dark:border-white/5 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">+91</span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 pl-16 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-black/20 dark:border-white/5 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={updating}
                                className="flex-1 rounded-2xl bg-black py-5 text-[10px] font-black uppercase tracking-[0.2em] force-light-text shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 dark:bg-[#FFD000] dark:text-black"
                            >
                                {updating ? 'Syncing...' : 'Save Profile Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/driver-profile')}
                                className="rounded-2xl border border-gray-200 bg-white px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.05)]"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditDriverProfile;
