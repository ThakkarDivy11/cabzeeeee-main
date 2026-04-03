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

  if (loading) return <div className="flex min-h-screen items-center justify-center text-slate-300">Loading...</div>;

  return (
    <div className="app-shell">
      <header className="neon-header">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-3 sm:h-16">
            <button
              onClick={() => navigate('/rider')}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-all hover:bg-purple-500/10 hover:text-purple-200 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-base font-black tracking-tight text-slate-100 sm:text-xl">Payment Methods</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="neon-panel-strong relative mb-5 overflow-hidden rounded-3xl p-5 sm:mb-8 sm:p-6">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/5 -mr-10 -mt-10" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200/70">CabZee Wallet Balance</p>
              <h2 className="mt-1.5 text-3xl font-black tracking-tight text-slate-100 sm:text-4xl">Rs.{user?.walletBalance?.toFixed(2) || '0.00'}</h2>
              <button onClick={() => setShowTopUp(true)} className="neon-btn mt-3 inline-flex px-5 py-2">
                + Add Money
              </button>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <svg className="w-6 h-6 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>

        <TopUpModal
          isOpen={showTopUp}
          onClose={() => setShowTopUp(false)}
          onSuccess={fetchUserData}
          savedPaymentMethods={savedPaymentMethods}
        />

        <div className="space-y-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-black text-slate-100 sm:text-lg">Saved Cards</h3>
            <button
              onClick={() => setShowAddCard(true)}
              className="text-xs font-bold uppercase tracking-wider text-purple-300 hover:text-purple-200 sm:text-sm"
            >
              + Add Card
            </button>
          </div>

          {paymentMethodsLoading && (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 py-8 text-center">
              <p className="text-sm font-semibold text-slate-400">Loading saved cards...</p>
            </div>
          )}

          {!paymentMethodsLoading && savedPaymentMethods.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-400">No saved cards yet.</p>
              <button onClick={() => setShowAddCard(true)} className="mt-3 text-xs font-bold uppercase tracking-wider text-purple-300">
                Add your first card →
              </button>
            </div>
          )}

          {!paymentMethodsLoading && savedPaymentMethods.map((card) => (
            <div key={card.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 shadow-level-1">
              <div className="flex h-8 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-[10px] font-black text-slate-300">
                {(card.brand || 'Card').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-100">•••• •••• •••• {card.last4}</p>
                <p className="text-xs font-semibold text-slate-400">Expires {card.exp_month}/{card.exp_year}</p>
              </div>
              <button
                onClick={() => handleRemovePaymentMethod(card.id)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}

          <AddCardModal
            isOpen={showAddCard}
            onClose={() => setShowAddCard(false)}
            onAdded={fetchSavedPaymentMethods}
          />
        </div>
      </main>
    </div>
  );
};

export default ManagePaymentMethods;
