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
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#E2E8F0',
                '::placeholder': { color: '#64748B' }
              },
              invalid: { color: '#EF4444' }
            }
          }}
        />
      </div>

      <div className="flex flex-col space-y-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 py-4 font-bold text-white transition-all hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50"
        >
          {processing ? 'Saving...' : 'Save Card'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 font-bold text-slate-200 transition-all hover:bg-white/10"
        >
          Cancel
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm pointer-events-auto">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1120]/95 p-8 text-slate-200 shadow-2xl shadow-purple-500/20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-100">Add Card</h2>
          <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-white/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="py-10 text-center font-semibold text-slate-400">Preparing secure card form...</div>
        )}

        {!loading && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <AddCardInner clientSecret={clientSecret} onClose={onClose} onAdded={onAdded} />
          </Elements>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AddCardModal;
