import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_please_add_your_key');

const TopUpModal = ({ isOpen, onClose, onSuccess, savedPaymentMethods = [] }) => {
  const [amount, setAmount] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');

  const handleInitiateTopUp = async (e) => {
    e.preventDefault();
    if (!amount || amount < 50) {
      toast.error('Minimum top-up amount is Rs. 50');
      return;
    }

    if (process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY === 'pk_test_...' || !process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
      toast.error('Stripe Publishable Key is missing in frontend/.env');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(amount),
          paymentMethodId: selectedPaymentMethodId || undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        toast.error(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Top-up initiation failed:', error);
      toast.error('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm pointer-events-auto">
      <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#0b1120]/95 p-8 text-slate-200 shadow-2xl shadow-purple-500/20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-100">Top Up Wallet</h2>
          <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-white/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!clientSecret ? (
          <form onSubmit={handleInitiateTopUp} className="space-y-6">
            {savedPaymentMethods.length > 0 && (
              <div className="space-y-2">
                <label className="block text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Pay with saved card (optional)
                </label>
                <select
                  value={selectedPaymentMethodId}
                  onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400"
                >
                  <option value="">Use a new card</option>
                  {savedPaymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {(pm.brand || 'CARD').toUpperCase()} ending {pm.last4} (exp {pm.exp_month}/{pm.exp_year})
                    </option>
                  ))}
                </select>
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Selecting a saved card skips card entry
                </p>
              </div>
            )}

            <div>
              <label className="mb-3 block text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                Enter Amount (INR)
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-purple-300/60">Rs.</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-[2rem] border border-white/10 bg-white/5 py-8 pl-16 pr-6 text-center text-4xl font-black text-slate-100 transition-all outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40"
                  autoFocus
                  required
                  min="50"
                />
              </div>
              <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Minimum top-up: Rs. 50</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[500, 1000, 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-slate-200 transition-all hover:border-purple-400/40 hover:bg-purple-500/10 active:scale-95"
                >
                  +Rs.{val}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !amount}
              className="w-full rounded-[2rem] bg-gradient-to-r from-purple-500 to-indigo-500 py-5 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-purple-500/20 transition-all hover:from-purple-400 hover:to-indigo-400 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Proceed to Payment'}
            </button>
          </form>
        ) : (
          <div className="animate-in slide-in-from-right duration-500">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                amount={amount}
                paymentMethodId={selectedPaymentMethodId || undefined}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                }}
                onCancel={() => setClientSecret(null)}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default TopUpModal;
