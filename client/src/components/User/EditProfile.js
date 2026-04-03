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
    <div className="min-h-screen bg-soft-white font-sans text-navy">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-navy/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-6 p-2 rounded-xl bg-soft-white border border-navy/5 text-navy/40 hover:text-navy hover:shadow-md transition-all active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-black text-navy uppercase tracking-tighter">Edit Identity</h1>
                <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest leading-none mt-1">Profile Synchronization</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-[3rem] border border-navy/5 overflow-hidden">
          <div className="px-12 py-10 bg-navy">
            <h2 className="text-3xl font-black text-soft-white tracking-tight mb-2">Modify Credentials</h2>
            <p className="text-soft-white/60 text-sm font-medium">Update your digital presence and contact details.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-12 space-y-12">
            <div className="flex flex-col items-center gap-6 pb-12 border-b border-navy/5">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-[6px] border-soft-white shadow-2xl bg-navy/5 flex items-center justify-center transition-all duration-500 group-hover:scale-105">
                  {preview ? (
                    <img src={preview.startsWith('data:') || preview.startsWith('http') ? preview : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${preview}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="h-16 w-16 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 cursor-pointer bg-sky-blue p-4 rounded-2xl shadow-xl text-soft-white hover:bg-navy transition-all active:scale-90 border-4 border-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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
              <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Update Profile Avatar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">
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
                  className="w-full px-6 py-5 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">
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
                  className="w-full px-6 py-5 border border-navy/10 rounded-2xl bg-soft-white text-navy font-bold placeholder:text-navy/20 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-10">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-10 py-5 text-xs font-black uppercase tracking-widest text-navy bg-soft-white border border-navy/10 rounded-2xl hover:bg-navy/5 transition-all duration-300"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto px-12 py-5 text-xs font-black uppercase tracking-widest text-soft-white bg-navy rounded-2xl shadow-2xl shadow-navy/20 hover:bg-navy-dark transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
              >
                {updating ? (
                  <>
                    <div className="w-2 h-2 bg-soft-white rounded-full animate-pulse"></div>
                    Syncing...
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

