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
      // We need a route to get ALL drivers, not just online ones.
      // Re-using /api/users for now (filtered by role=driver on client if needed, but better to filter on server)
      const response = await fetch(
        (process.env.REACT_APP_API_URL || "http://localhost:5000") +
        "/api/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        const driverList = data.data.filter((u) => u.role === "driver");
        setDrivers(driverList);
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

      const payload = { type, status, rejectReason };

      if (!status) {
        payload.rejectReason =
          rejectReasons[`${userId}_${type}`] || "Not specified";
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/users/documents/${userId}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
      toast.error("Action failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-soft-white font-sans text-navy">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-navy/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin')}
                className="mr-6 p-2 rounded-xl bg-soft-white border border-navy/5 text-navy/40 hover:text-navy hover:shadow-md transition-all active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-black text-navy uppercase tracking-tighter">Verification Hub</h1>
                <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest leading-none mt-1">Fleet Compliance & KYC</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-navy tracking-tight mb-3">Partner Pipeline</h2>
          <div className="flex items-center space-x-3">
            <div className="h-1.5 w-12 bg-sky-blue rounded-full"></div>
            <p className="text-sm font-bold text-navy/40 uppercase tracking-[0.2em]">Validate driver credentials and assets</p>
          </div>
        </div>

        <div className="grid gap-10">
          {drivers.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] text-center border border-navy/5 shadow-xl">
              <div className="w-20 h-20 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-navy uppercase tracking-tighter">Queue Empty</h3>
              <p className="text-sm text-navy/30 font-bold uppercase tracking-widest mt-2">All partner documents are currently processed.</p>
            </div>
          ) : (
            drivers.map((driver) => (
              <div key={driver._id} className="bg-white p-10 rounded-[3rem] shadow-2xl border border-navy/5 overflow-hidden group hover:scale-[1.005] transition-all duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-navy/5">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center text-soft-white shadow-xl shadow-navy/20">
                      <span className="text-2xl font-black">{driver.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">{driver.name}</h3>
                      <p className="text-xs font-bold text-navy/40 uppercase tracking-widest mt-1">{driver.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-5 py-2 bg-soft-white text-navy border border-navy/5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Partner ID: {driver._id.slice(-6)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {["license", "insurance", "registration"].map((type) => {
                    const doc = driver.documents?.[type];
                    return (
                      <div key={type} className="flex flex-col h-full bg-soft-white/50 border border-navy/5 rounded-[2.5rem] p-8 relative hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-navy/40">
                            {type}
                          </h4>
                          {doc?.verified ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                            </div>
                          ) : doc?.fileUrl ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-blue/10 text-sky-blue rounded-full border border-sky-blue/20">
                              <div className="w-1.5 h-1.5 bg-sky-blue rounded-full animate-ping"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Audit</span>
                            </div>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-400 rounded-full border border-gray-200 text-[10px] font-black uppercase tracking-widest">Missing</span>
                          )}
                        </div>

                        {doc?.fileUrl ? (
                          <div className="flex-1 flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-2xl border border-navy/5 shadow-sm">
                                <p className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-1">Serial Num</p>
                                <p className="text-sm font-black text-navy truncate">{doc.number || "UNSPECIFIED"}</p>
                              </div>
                              <div className="bg-white p-4 rounded-2xl border border-navy/5 shadow-sm">
                                <p className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-1">Validity</p>
                                <p className="text-sm font-black text-navy truncate">
                                  {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "EXPIRED"}
                                </p>
                              </div>
                            </div>

                            <div className="relative group/doc rounded-3xl overflow-hidden shadow-2xl shadow-navy/10 border-4 border-white">
                              {doc.fileUrl.toLowerCase().endsWith(".pdf") ? (
                                <div className="w-full h-48 bg-navy/5 flex flex-col items-center justify-center gap-3">
                                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-red-500 border border-red-50">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <span className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em]">Portable Document Format</span>
                                </div>
                              ) : (
                                <div className="w-full h-48 bg-navy/5 overflow-hidden">
                                  <img
                                    src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${doc.fileUrl}`}
                                    alt={type}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/doc:scale-110"
                                  />
                                </div>
                              )}
                              <a
                                href={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${doc.fileUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 bg-navy/40 opacity-0 group-hover/doc:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                              >
                                <span className="bg-white text-navy text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl shadow-2xl transform translate-y-4 group-hover/doc:translate-y-0 transition-transform">Enlarge Artifact ↗</span>
                              </a>
                            </div>

                            <div className="pt-6 mt-auto border-t border-navy/5 flex flex-col gap-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleVerify(driver._id, rejectReasons, type, true)}
                                  className="flex-1 bg-navy text-soft-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy-dark shadow-xl shadow-navy/20 transition-all active:scale-95"
                                >
                                  Pass
                                </button>
                                <button
                                  onClick={() => handleVerify(driver._id, rejectReasons, type, false)}
                                  className="flex-1 bg-red-600 text-soft-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-200 transition-all active:scale-95"
                                >
                                  Fail
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Violation details (if failed)..."
                                value={rejectReasons[`${driver._id}_${type}`] || ""}
                                onChange={(e) => setRejectReasons((prev) => ({ ...prev, [`${driver._id}_${type}`]: e.target.value }))}
                                className="w-full px-5 py-3 text-[10px] font-bold bg-white border border-navy/5 rounded-xl text-navy placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 transition-all"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center bg-navy/[0.02] rounded-3xl border border-dashed border-navy/10 min-h-[200px]">
                            <p className="text-[10px] text-navy/20 font-black uppercase tracking-widest">Awaiting Artifact</p>
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
      </main>
    </div>
  );
};

export default AdminVerification;
