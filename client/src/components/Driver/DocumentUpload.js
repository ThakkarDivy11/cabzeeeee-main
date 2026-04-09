import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DocumentUpload = () => {
    const [user, setUser] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.data);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const handleUpload = async (e, type) => {
        e.preventDefault();
        const formData = new FormData();
        const fileInput = e.target.elements.namedItem('document');
        const numberInput = e.target.elements.namedItem('number');
        const dateInput = e.target.elements.namedItem('expiryDate');

        if (!fileInput.files[0]) {
            return toast.error('Please select a file');
        }

        formData.append('document', fileInput.files[0]);
        formData.append('type', type);
        if (numberInput) formData.append('number', numberInput.value);
        if (dateInput) formData.append('expiryDate', dateInput.value);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/documents/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`${type} uploaded successfully`);
                fetchUserData();
                e.target.reset();
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (error) {
            toast.error('Error uploading document');
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (doc) => {
        if (!doc || !doc.fileUrl) return <span className="text-gray-400 text-[10px] font-bold uppercase">Not Uploaded</span>;
        if (doc.verified) return <span className="text-emerald-500 text-[10px] font-bold uppercase">Verified ✓</span>;
        return <span className="text-[#FFD000] text-[10px] font-bold uppercase">Pending Review</span>;
    };

    if (!user) return <div className="p-20 text-center font-bold text-gray-500">Loading vault...</div>;

    const docTypes = [
        { key: 'license', label: 'Driving License', placeholder: 'License Number' },
        { key: 'insurance', label: 'Vehicle Insurance', placeholder: 'Policy Number' },
        { key: 'registration', label: 'Vehicle Registration (RC)', placeholder: 'RC Number' }
    ];

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/driver-profile')}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Documents</h2>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Compliance & Verification</p>
                    </div>
                </div>
            </header>

            <div className="grid gap-10">
                {docTypes.map(({ key, label, placeholder }) => (
                    <div key={key} className="group relative rounded-[3rem] border border-gray-200 bg-white p-10 shadow-sm transition-all duration-500 hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 dark:bg-white/5 group-hover:bg-[#FFD000] group-hover:text-black transition-colors">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{label}</h3>
                                    <div className="mt-1 flex items-center gap-2">
                                        {getStatusBadge(user.documents?.[key])}
                                    </div>
                                </div>
                            </div>

                            {user.documents?.[key]?.fileUrl && (
                                <a
                                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.documents?.[key]?.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-xl bg-gray-50 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-100 transition-all dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                >
                                    Browse Current
                                </a>
                            )}
                        </div>

                        <form onSubmit={(e) => handleUpload(e, key)} className="grid gap-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">{placeholder}</p>
                                    <input
                                        type="text"
                                        name="number"
                                        defaultValue={user.documents?.[key]?.number || ''}
                                        placeholder={`Enter ${label.toLowerCase()} digits`}
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-white/5 dark:border-white/5 dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Expiry Date</p>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        defaultValue={user.documents?.[key]?.expiryDate ? new Date(user.documents?.[key]?.expiryDate).toISOString().split('T')[0] : ''}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-white/5 dark:border-white/5 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50 p-10 text-center dark:border-white/10 dark:bg-white/5">
                                <input
                                    type="file"
                                    name="document"
                                    accept="image/*,.pdf"
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                                <div className="mx-auto h-12 w-12 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm mb-4 dark:bg-white/5">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Upload Digital Copy</p>
                                <p className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">JPG, PNG or PDF (MAX 5MB)</p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="rounded-2xl bg-black px-12 py-5 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-neutral-800 disabled:opacity-50 dark:bg-[#FFD000] dark:text-black dark:hover:bg-[#ffe04d]"
                                >
                                    {uploading ? (
                                        <span className="flex items-center gap-3">
                                            <div className="h-4 w-4 border-2 border-white animate-spin rounded-full border-t-transparent dark:border-black dark:border-t-transparent" />
                                            Syncing...
                                        </span>
                                    ) : (
                                        'Submit for Verification'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentUpload;
