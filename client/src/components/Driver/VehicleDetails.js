import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VehicleDetails = () => {
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
        toast.success('Vehicle details updated successfully!');
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/driver-profile');
      } else {
        toast.error(data.message || 'Failed to update vehicle details');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

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
                <h1 className="text-xl font-black text-navy uppercase tracking-tighter">Vehicle Assets</h1>
                <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest leading-none mt-1">Registry Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-navy">
        <div className="bg-white shadow-2xl rounded-[2.5rem] border border-navy/5 overflow-hidden">
          <div className="px-10 py-10 bg-navy">
            <h2 className="text-3xl font-black text-soft-white tracking-tight mb-2">Technical Specifications</h2>
            <p className="text-soft-white/60 text-sm font-medium">Please provide accurate details for fleet verification.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-2">
                <label htmlFor="make" className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">
                  Manufacturer / Make
                </label>
                <input
                  type="text"
                  name="make"
                  id="make"
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="e.g., Maruti Suzuki"
                  required
                  className="w-full px-5 py-4 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="model" className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">
                  Model Designation
                </label>
                <input
                  type="text"
                  name="model"
                  id="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Dzire VXI"
                  required
                  className="w-full px-5 py-4 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="year" className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">
                  Model Year
                </label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g., 2024"
                  min="2010"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-5 py-4 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="color" className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">
                  Exterior Finish
                </label>
                <input
                  type="text"
                  name="color"
                  id="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., Arctic White"
                  className="w-full px-5 py-4 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="licensePlate" className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  placeholder="e.g., MH 12 AB 1234"
                  required
                  className="w-full px-5 py-4 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300 uppercase"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="vehicleType" className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">
                  Asset Category
                </label>
                <select
                  name="vehicleType"
                  id="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300 cursor-pointer appearance-none"
                >
                  <option value="car">Car (Premium Fleet)</option>
                  <option value="bike">Bike (Express Courier)</option>
                  <option value="auto">Auto (Urban Shuttle)</option>
                </select>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/driver-profile')}
                className="w-full sm:w-auto px-10 py-5 text-xs font-black uppercase tracking-widest text-navy bg-soft-white border border-navy/10 rounded-2xl hover:bg-navy/5 transition-all duration-300"
              >
                Dismiss
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-10 py-5 text-xs font-black uppercase tracking-widest text-soft-white bg-navy rounded-2xl shadow-2xl shadow-navy/20 hover:bg-navy-dark transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <div className="w-2 h-2 bg-soft-white rounded-full animate-pulse"></div>
                    Syncing Data...
                  </>
                ) : (
                  'Confirm & Register'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default VehicleDetails;
