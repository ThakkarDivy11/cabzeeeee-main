import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_please_add_your_key');

const AddCardInner = ({ clientSecret, onClose, onAdded }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: 'CabZee User' }
        }
      });

      if (result.error) {
        toast.error(result.error.message || 'Failed to save card');
        return;
      }

      if (result.setupIntent?.status === 'succeeded') {
        toast.success('Card saved');
        onAdded();
        onClose();
      } else {
        toast.error('Card setup not completed');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-white/5 dark:bg-black/40">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1a1a1a',
                letterSpacing: '0.05em',
                '::placeholder': { color: '#a0a0a0' }
              },
              invalid: { color: '#ef4444' }
            }
          }}
          className="dark:![&_.Input]:text-white"
        />
        {/* Force dark mode styles via helper class if needed, but Stripe appearance is better */}
      </div>

      <div className="flex flex-col space-y-4">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="group w-full rounded-2xl bg-[#FFD000] py-4 text-black transition-all duration-300 hover:scale-[1.05] hover:shadow-lg hover:shadow-yellow-400/30 active:scale-95 disabled:opacity-50"
        >
          <span className="text-sm font-black tracking-widest uppercase">
            {processing ? 'SYNCING...' : 'Link Secure Asset'}
          </span>
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="w-full rounded-2xl border border-gray-100 bg-white py-3 text-xs font-bold tracking-widest text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white/30 dark:hover:bg-white/10 dark:hover:text-white"
        >
          CANCEL SETUP
        </button>
      </div>
    </form>
  );
};

const AddCardModal = ({ isOpen, onClose, onAdded }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setLoading(false);
      return;
    }

    const run = async () => {
      if (process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY === 'pk_test_...' || !process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
        toast.error('Stripe Publishable Key is missing in frontend/.env');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/payments/create-setup-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) setClientSecret(data.clientSecret);
        else toast.error(data.message || 'Failed to initiate card setup');
      } catch (e) {
        toast.error('Network error. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-md dark:bg-black/40 pointer-events-auto">
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl transition-all duration-300 dark:bg-neutral-900 dark:border dark:border-white/10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400/60">IDENTITY VERIFICATION</span>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">LINK CARD</h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-900 dark:bg-white/5 dark:text-white/30 dark:hover:bg-white/10 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400/20 border-t-yellow-400"></div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Establishing secure tunnel...</p>
          </div>
        )}

        {!loading && clientSecret && (
          <Elements stripe={stripePromise} options={{ 
            clientSecret,
            appearance: { 
              theme: 'none', // Custom appearance
              variables: { 
                colorPrimary: '#FFD000',
                colorBackground: '#f9fafb',
                colorText: '#1f2937',
              } 
            } 
          }}>
            <AddCardInner clientSecret={clientSecret} onClose={onClose} onAdded={onAdded} />
          </Elements>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AddCardModal;
