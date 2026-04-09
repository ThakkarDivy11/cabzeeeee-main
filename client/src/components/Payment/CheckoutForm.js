import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const CheckoutForm = ({ clientSecret, amount, onSuccess, onCancel, paymentMethodId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const result = paymentMethodId
      ? await stripe.confirmCardPayment(clientSecret, { payment_method: paymentMethodId })
      : await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Wallet Top-up',
          },
        },
      });

    if (result.error) {
      toast.error(result.error.message);
      setProcessing(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        try {
          const res = await fetch(`${apiUrl}/api/payments/confirm-wallet-topup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ paymentIntentId: result.paymentIntent.id })
          });
          const data = await res.json();
          if (data.success) {
            toast.success('Payment successful! Wallet balance updated.');
          } else {
            toast.error(data.message || 'Payment confirmed, but wallet update failed.');
          }
        } catch (e) {
          toast.error('Payment succeeded, but could not confirm instantly.');
        } finally {
          onSuccess();
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!paymentMethodId && (
        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50 transition-all focus-within:ring-2 focus-within:ring-yellow-400/30 dark:border-white/5 dark:bg-black/40">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1a1a1a',
                letterSpacing: '0.02em',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
              invalid: {
                color: '#ef4444',
              },
            },
          }} />
        </div>
      )}

      {paymentMethodId && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400/60">AUTHORIZED DEBIT</span>
            <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">Confirm Charge: <span className="text-lg font-black tracking-tight">₹{amount}</span></p>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="group w-full rounded-[2.5rem] bg-[#FFD000] py-5 text-black transition-all duration-300 hover:scale-[1.05] hover:shadow-lg hover:shadow-yellow-400/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {processing ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black"></div>
              <span className="text-sm font-black tracking-widest uppercase">Authorizing...</span>
            </>
          ) : (
            <span className="text-sm font-black tracking-widest uppercase">Pay ₹{amount}</span>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="w-full py-2 text-xs font-black tracking-widest text-gray-400 hover:text-gray-900 transition-colors uppercase dark:hover:text-white"
        >
          Cancel Operation
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
