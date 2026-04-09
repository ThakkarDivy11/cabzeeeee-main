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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-md dark:bg-black/40 pointer-events-auto">
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl transition-all duration-300 dark:bg-neutral-900 dark:border dark:border-white/10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400/60">TRANSACTION GATEWAY</span>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">REFUEL WALLET</h2>
          </div>
          <button 
            onClick={onClose} 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-900 dark:bg-white/5 dark:text-white/30 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!clientSecret ? (
          <form onSubmit={handleInitiateTopUp} className="space-y-6">
            {savedPaymentMethods.length > 0 && (
              <div className="space-y-2">
                <label className="block text-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Select Billing Asset
                </label>
                <select
                  value={selectedPaymentMethodId}
                  onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                  className="w-full rounded-2xl border-gray-100 bg-gray-50 px-4 py-4 text-sm font-bold text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400/50 dark:border-white/5 dark:bg-black/40 dark:text-white"
                  style={{borderWidth: '1px'}}
                >
                  <option value="" className="text-gray-900 dark:bg-[#12121f]">NEW PAYMENT CARD</option>
                  {savedPaymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id} className="text-gray-900 dark:bg-[#12121f]">
                      {(pm.brand || 'CARD').toUpperCase()} • ENDING {pm.last4}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-4 block text-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                CREDIT AMOUNT (INR)
              </label>
              <div className="relative">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-light text-gray-300 dark:text-gray-700">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-[2rem] border-gray-100 bg-gray-50 py-10 pl-20 pr-8 text-center text-6xl font-black tracking-tighter text-gray-900 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400/50 dark:border-white/5 dark:bg-white/[0.03] dark:text-white dark:focus:bg-[#FFD000]/5"
                  style={{borderWidth: '1px'}}
                  autoFocus
                  required
                  min="50"
                />
              </div>
              <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Threshold: ₹50.00 Min</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[500, 1000, 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="rounded-2xl border border-gray-100 bg-white py-3 text-sm font-black tracking-widest text-gray-500 transition-all hover:border-yellow-400 hover:text-yellow-600 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-yellow-400/50 dark:hover:text-yellow-400"
                >
                  +{val}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !amount}
              className="group w-full rounded-[2.5rem] bg-[#FFD000] py-6 text-black transition-all duration-300 hover:scale-[1.05] hover:shadow-lg hover:shadow-yellow-400/30 active:scale-95 disabled:hover:scale-100 disabled:opacity-50"
            >
              <span className="text-sm font-black tracking-[0.2em] uppercase">
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </span>
            </button>
          </form>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Elements stripe={stripePromise} options={{ 
              clientSecret, 
              appearance: { 
                theme: 'stripe', 
                variables: { 
                  colorBackground: '#ffffff', 
                  colorText: '#1a1a1a', 
                  colorPrimary: '#FFD000',
                  borderRadius: '16px'
                } 
              } 
            }}>
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
