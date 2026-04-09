import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminVerification = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectReasons, setRejectReasons] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/users",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json();
            if (data.success) {
                setDrivers(data.data.filter((u) => u.role === "driver"));
            }
        } catch (error) {
            toast.error("Failed to load drivers");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId, rejectReason, type, status) => {
        try {
            const token = localStorage.getItem("token");
            const payload = { type, status, rejectReason: status ? "" : (rejectReasons[`${userId}_${type}`] || "Incomplete documentation") };

            const response = await fetch(
                `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/users/documents/${userId}/verify`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();
            if (data.success) {
                toast.success(`Document ${status ? "verified" : "rejected"}`);
                fetchDrivers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Verification failed");
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-500">Scanning driver vault...</div>;

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
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Verifications</h2>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Fleet Compliance & Document Audit</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-3 shadow-sm dark:border-white/5 dark:bg-white/5">
                    <div className="h-2 w-2 rounded-full bg-[#FFD000] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Review Queue Active</span>
                </div>
            </header>

            <div className="mb-12">
                <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Driver Pipeline</h3>
                <p className="mt-2 text-sm font-bold text-gray-400 uppercase tracking-widest max-w-2xl">Validate service partner identity and certification for network activation.</p>
            </div>

            <div className="space-y-10">
                {drivers.length === 0 ? (
                    <div className="rounded-[3rem] border-2 border-dashed border-gray-100 p-32 text-center dark:border-white/5">
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Queue Processed</p>
                        <p className="mt-2 text-xs font-bold text-gray-500 tracking-widest italic uppercase">No active verification signals detected</p>
                    </div>
                ) : (
                    drivers.map((driver) => (
                        <div key={driver._id} className="group relative rounded-[3.5rem] border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-10 border-b border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-8">
                                    <div className="h-16 w-16 rounded-[1.5rem] bg-black text-white flex items-center justify-center text-2xl font-black italic shadow-xl dark:bg-[#FFD000] dark:text-black">
                                        {driver.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{driver.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 lowercase tracking-widest">{driver.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className="rounded-xl bg-gray-50 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:bg-white/5">DB_ID: {driver._id.slice(-6).toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8 p-10 md:grid-cols-3">
                                {["license", "insurance", "registration"].map((type) => {
                                    const doc = driver.documents?.[type];
                                    return (
                                        <div key={type} className="flex flex-col rounded-[2.5rem] border border-transparent bg-gray-50/50 p-8 transition-all hover:bg-white hover:shadow-xl dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5">
                                            <div className="flex items-center justify-between mb-8">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD000]">{type}</p>
                                                <div className={`h-2 w-2 rounded-full ${doc?.verified ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : (doc?.fileUrl ? 'bg-[#FFD000] animate-pulse shadow-[0_0_8px_rgba(255,208,0,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]')}`} />
                                            </div>

                                            {doc?.fileUrl ? (
                                                <div className="flex flex-1 flex-col gap-8">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:bg-black/20 dark:border-white/5">
                                                            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Ref Num</p>
                                                            <p className="text-xs font-black truncate">{doc.number || '---'}</p>
                                                        </div>
                                                        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:bg-black/20 dark:border-white/5">
                                                            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status</p>
                                                            <p className="text-xs font-black truncate">{doc.verified ? 'Verified' : 'Pending'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="group/img relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-black border border-gray-100 dark:border-white/5">
                                                        <img
                                                            src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${doc.fileUrl}`}
                                                            alt={type}
                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110 opacity-70"
                                                        />
                                                        <a
                                                            href={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${doc.fileUrl}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity group-hover/img:opacity-100"
                                                        >
                                                            <span className="rounded-2xl bg-[#FFD000] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black shadow-xl scale-75 group-hover/img:scale-100 transition-transform">Inspect Doc</span>
                                                        </a>
                                                    </div>

                                                    <div className="mt-auto space-y-6">
                                                        <textarea
                                                            placeholder="Log reason if rejecting..."
                                                            value={rejectReasons[`${driver._id}_${type}`] || ""}
                                                            onChange={(e) => setRejectReasons((prev) => ({ ...prev, [`${driver._id}_${type}`]: e.target.value }))}
                                                            className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-[10px] font-bold outline-none focus:ring-4 focus:ring-[#FFD000]/10 dark:bg-white/5 dark:border-white/5 dark:text-white"
                                                            rows="2"
                                                        />
                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={() => handleVerify(driver._id, rejectReasons, type, true)}
                                                                className="flex-1 rounded-2xl bg-black py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:scale-105 active:scale-95 transition-all dark:bg-[#FFD000] dark:text-black"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleVerify(driver._id, rejectReasons, type, false)}
                                                                className="flex-1 rounded-2xl border border-red-500 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-1 flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-gray-100 bg-gray-50/50 dark:bg-white/5 dark:border-white/10 min-h-[250px]">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400/50 italic">Awaiting document upload</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminVerification;
