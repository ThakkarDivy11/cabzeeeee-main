import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TopUpModal from './TopUpModal';
import AddCardModal from './AddCardModal';

const ManagePaymentMethods = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSavedPaymentMethods = useCallback(async () => {
    setPaymentMethodsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payments/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSavedPaymentMethods(data.success ? data.data || [] : []);
    } catch (e) {
      setSavedPaymentMethods([]);
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        await fetchSavedPaymentMethods();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, [fetchSavedPaymentMethods]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleRemovePaymentMethod = async (pmId) => {
    if (!window.confirm('Remove this saved card?')) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payments/payment-methods/${pmId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Card removed');
        fetchSavedPaymentMethods();
      } else {
        toast.error(data.message || 'Failed to remove card');
      }
    } catch (e) {
      toast.error('Failed to remove card');
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#06060a]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400/20 border-t-yellow-400"></div>
        <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400">LOADING PAYMENT ASSETS...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-[#06060a] dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-white/5 dark:bg-black/20">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/rider')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">PASSENGER TERMINAL</span>
              <h1 className="text-xl font-black tracking-tight dark:text-white">DASHBOARD</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-center">
            <div className="flex items-center gap-3">
                <button className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm dark:bg-white/5 dark:border-white/10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="cz-bebas text-3xl tracking-widest uppercase">Mission Funds</h2>
            </div>
        </div>

        {/* Wallet Balance Card - CLEAN GLASS UI */}
        <div className="group relative mb-12 overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-xl shadow-gray-200/50 transition-all duration-300 hover:shadow-2xl dark:bg-neutral-900/40 dark:shadow-none dark:border dark:border-white/5 dark:hover:border-yellow-400/20">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-yellow-400/10 blur-3xl transition-all duration-500 group-hover:bg-yellow-400/20"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-yellow-600 dark:text-yellow-400/70">CabZee Operational Funds</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-light text-gray-300 dark:text-gray-600">₹</span>
              <h3 className="text-7xl font-black tracking-tighter text-gray-900 dark:text-white">
                {user?.walletBalance?.toFixed(2) || '0.00'}
              </h3>
            </div>
            
            <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:items-center">
                <button 
                  onClick={() => setShowTopUp(true)} 
                  className="flex items-center justify-center gap-3 rounded-2xl bg-[#FFD000] px-8 py-4 font-bold text-black shadow-lg shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.05] hover:shadow-yellow-400/40 active:scale-95"
                >
                  <span className="text-sm font-black tracking-widest uppercase">+ Refuel Wallet</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                
                <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 dark:bg-white/5 dark:text-white/20 sm:flex">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
            </div>
          </div>
        </div>

        {/* Saved Cards Header */}
        <div className="mb-8 border-b border-gray-100 pb-4 dark:border-white/5">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Secure Payment Methods</h4>
                <button
                    onClick={() => setShowAddCard(true)}
                    className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-yellow-600 transition-colors hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                >
                    <span>+ New Card</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                </button>
            </div>
        </div>

        {/* Saved Cards Grid */}
        {paymentMethodsLoading ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-3xl bg-white/50 backdrop-blur-sm dark:bg-white/[0.02]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-400/20 border-t-yellow-400"></div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Validating encrypted assets...</p>
          </div>
        ) : savedPaymentMethods.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center transition-all hover:border-yellow-400/30 dark:border-white/5 dark:bg-white/[0.01]">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">No registered assets</p>
            <button 
              onClick={() => setShowAddCard(true)} 
              className="mt-3 text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400"
            >
              Begin Setup →
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {savedPaymentMethods.map((card) => (
              <div key={card.id} className="group flex items-center gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:shadow-md hover:ring-yellow-400/30 dark:bg-neutral-900/40 dark:ring-white/5 dark:hover:bg-neutral-800/60">
                <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-[11px] font-black text-gray-400 ring-1 ring-gray-200 dark:bg-black/40 dark:text-yellow-400 dark:ring-white/10">
                  <span className="tracking-tighter">{(card.brand || 'CARD').toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold tracking-widest text-gray-900 dark:text-white">•••• •••• •••• {card.last4}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400/70">Secure Asset • Exp {card.exp_month}/{card.exp_year}</p>
                </div>
                <button
                  onClick={() => handleRemovePaymentMethod(card.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 hover:ring-1 hover:ring-red-200 dark:bg-white/5 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <TopUpModal
          isOpen={showTopUp}
          onClose={() => setShowTopUp(false)}
          onSuccess={fetchUserData}
          savedPaymentMethods={savedPaymentMethods}
        />

        <AddCardModal
          isOpen={showAddCard}
          onClose={() => setShowAddCard(false)}
          onAdded={fetchSavedPaymentMethods}
        />
      </main>
    </div>
  );
};

export default ManagePaymentMethods;
