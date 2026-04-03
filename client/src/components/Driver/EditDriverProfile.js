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
        toast.success('Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/driver-profile');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-soft-white font-sans text-navy">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-navy/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/driver-profile')}
                className="mr-6 p-3 rounded-xl bg-navy/5 text-navy hover:bg-navy hover:text-soft-white transition-all duration-300 transform active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center group cursor-pointer" onClick={() => navigate('/driver')}>
                <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-navy/20">
                  <span className="text-soft-white font-black italic">C</span>
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Modify Registry</h1>
                  <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest mt-0.5">Operative Update</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-navy/5 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-sky-blue"></div>

          <div className="px-10 py-12 border-b border-navy/5 bg-navy/[0.01]">
            <h3 className="text-2xl font-black text-navy uppercase tracking-tighter mb-2">Registry Update</h3>
            <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] leading-relaxed">Update your operational credentials and identification protocols. Ensure all data is synchronized with your official documentation.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-10 py-12 space-y-10">
            {/* Avatar Uploader */}
            <div className="flex flex-col items-center pb-10 border-b border-navy/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-blue/[0.02] rounded-full -mr-16 -mt-16"></div>
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-sky-blue rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-navy flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                  {preview ? (
                    <img src={preview.startsWith('data:') || preview.startsWith('http') ? preview : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${preview}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-soft-white text-4xl font-black italic">{formData.name?.charAt(0).toUpperCase() || 'C'}</span>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-navy text-white p-3 rounded-2xl shadow-xl z-20 border-4 border-white cursor-pointer hover:bg-sky-blue transition-colors group-hover:rotate-12">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" name="profilePicture" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>
              <p className="mt-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Update Identification Phase</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="group">
                <label htmlFor="name" className="block text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] mb-3 ml-1">Official Operational Designation</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Victor Kholov"
                  className="block w-full px-6 py-5 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300 group-hover:border-navy/20"
                />
              </div>

              <div className="group">
                <label htmlFor="phone" className="block text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] mb-3 ml-1">Mobile Communication Protocol</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/30 font-bold">+91</span>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="123-456-7890"
                    className="block w-full pl-16 pr-6 py-5 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300 group-hover:border-navy/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 bg-navy text-soft-white py-5 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sky-blue shadow-2xl shadow-navy/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center group"
              >
                {updating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Synchronizing...
                  </span>
                ) : (
                  <>
                    Commit Registry Changes
                    <svg className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/driver-profile')}
                className="sm:w-1/3 py-5 px-8 border border-navy/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 hover:bg-navy/5 transition-all"
              >
                Abort Update
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditDriverProfile;
