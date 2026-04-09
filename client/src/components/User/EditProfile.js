import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditProfile = () => {
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
        navigate('/user-profile');
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#06060a] font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <div className="cz-grid fixed inset-0 z-0 pointer-events-none opacity-20" />
      {/* Premium Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-200 dark:border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 relative z-10">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-6 p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Edit Identity</h1>
                <p className="text-[10px] font-bold text-[#FFD000] uppercase tracking-widest leading-none mt-1">Profile Synchronization</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-neutral-900/40 shadow-2xl rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden backdrop-blur-xl">
          <div className="px-8 py-10 bg-[#FFD000] dark:bg-[#FFD000] sm:px-12 flex flex-col items-start gap-2">
            <h2 className="text-3xl font-black text-black tracking-tight uppercase leading-none">Modify Credentials</h2>
            <p className="text-black/70 text-sm font-bold tracking-wide uppercase">Update your digital presence and contact details.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-12">
            <div className="flex flex-col items-center gap-6 pb-12 border-b border-gray-100 dark:border-white/5">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-[6px] border-white dark:border-neutral-800 shadow-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center transition-all duration-500 group-hover:scale-105">
                  {preview ? (
                    <img src={preview.startsWith('data:') || preview.startsWith('http') ? preview : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${preview}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="h-16 w-16 text-gray-300 dark:text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 cursor-pointer bg-black dark:bg-white p-3.5 rounded-full shadow-xl text-[#FFD000] dark:text-black hover:bg-neutral-800 dark:hover:bg-gray-200 transition-all active:scale-90 border-4 border-white dark:border-neutral-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    name="profilePicture"
                    id="profilePicture"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleChange}
                  />
                </label>
              </div>
              <p className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-[0.2em]">Update Profile Avatar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-[0.2em] ml-2">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your legal name"
                  required
                  className="w-full px-6 py-4 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold placeholder:text-gray-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FFD000]/30 focus:border-[#FFD000] transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-[0.2em] ml-2">
                  Secure Mobile Access
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                  required
                  className="w-full px-6 py-4 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold placeholder:text-gray-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FFD000]/30 focus:border-[#FFD000] transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-10">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-10 py-5 text-xs font-black uppercase tracking-[0.2em] text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white rounded-2xl transition-all duration-300"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto px-12 py-5 text-xs font-black uppercase tracking-[0.2em] bg-[#FFD000] text-black rounded-2xl shadow-[0_0_20px_rgba(255,208,0,0.3)] hover:shadow-[0_0_30px_rgba(255,208,0,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {updating ? (
                  <>
                    <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                    Syncing
                  </>
                ) : (
                  'Push Updates'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;

