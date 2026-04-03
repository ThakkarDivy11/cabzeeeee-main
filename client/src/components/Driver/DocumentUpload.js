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
        if (!doc || !doc.fileUrl) return <span className="text-gray-500">Not Uploaded</span>;
        if (doc.verified) return <span className="text-green-600 font-bold">Verified ✅</span>;
        return <span className="text-yellow-600 font-bold">Pending Verification ⏳</span>;
    };

    if (!user) return <div>Loading...</div>;

    const docTypes = [
        { key: 'license', label: 'Driving License', placeholder: 'License Number' },
        { key: 'insurance', label: 'Vehicle Insurance', placeholder: 'Policy Number' },
        { key: 'registration', label: 'Vehicle Registration (RC)', placeholder: 'RC Number' }
    ];

    return (
        <div className="min-h-screen bg-soft-white font-sans text-navy">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-navy/5 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/driver-profile')}
                                className="mr-6 p-2 rounded-xl bg-soft-white border border-navy/5 text-navy/40 hover:text-navy hover:shadow-md transition-all active:scale-95"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-black text-navy uppercase tracking-tighter">Document Vault</h1>
                                <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest leading-none mt-1">Compliance & Verification</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-navy">
                <div className="mb-12">
                    <h2 className="text-4xl font-black text-navy tracking-tight mb-3">Verification Pipeline</h2>
                    <div className="flex items-center space-x-3">
                        <div className="h-1.5 w-12 bg-sky-blue rounded-full"></div>
                        <p className="text-sm font-bold text-navy/40 uppercase tracking-[0.2em]">Secure document upload and management</p>
                    </div>
                </div>

                <div className="grid gap-10">
                    {docTypes.map(({ key, label, placeholder }) => (
                        <div key={key} className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-navy/5 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-navy/5">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-soft-white transition-all duration-300">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-navy mb-1">{label}</h3>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(user.documents?.[key])}
                                        </div>
                                    </div>
                                </div>

                                {user.documents?.[key]?.fileUrl && (
                                    <a
                                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.documents?.[key]?.fileUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-soft-white text-navy font-bold text-xs uppercase tracking-widest border border-navy/5 rounded-xl hover:bg-navy hover:text-soft-white transition-all shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View Current
                                    </a>
                                )}
                            </div>

                            <form onSubmit={(e) => handleUpload(e, key)} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">{placeholder}</label>
                                        <input
                                            type="text"
                                            name="number"
                                            defaultValue={user.documents?.[key]?.number || ''}
                                            placeholder={`Enter unique ${label.toLowerCase()} number`}
                                            className="w-full px-5 py-4 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">Document Expiration</label>
                                        <input
                                            type="date"
                                            name="expiryDate"
                                            defaultValue={user.documents?.[key]?.expiryDate ? new Date(user.documents?.[key]?.expiryDate).toISOString().split('T')[0] : ''}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-5 py-4 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300 cursor-pointer"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="bg-soft-white p-8 rounded-3xl border border-navy/5 flex flex-col items-center justify-center gap-4 relative">
                                    <input
                                        type="file"
                                        name="document"
                                        accept="image/*,.pdf"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-navy shadow-sm border border-navy/5">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-navy/40">Drop document or click to browse</p>
                                    <p className="text-[10px] text-navy/20 font-bold uppercase tracking-widest">Image or PDF (Max 5MB)</p>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-10 py-5 bg-navy text-soft-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-navy/20 hover:bg-navy-dark transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center gap-3"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-2 h-2 bg-soft-white rounded-full animate-pulse"></div>
                                                Uploading Artifact...
                                            </>
                                        ) : (
                                            'Secure Upload'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default DocumentUpload;
