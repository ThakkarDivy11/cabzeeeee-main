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
        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#111827',
                '::placeholder': {
                  color: '#9CA3AF',
                },
              },
              invalid: {
                color: '#EF4444',
              },
            },
          }} />
        </div>
      )}

      <div className="flex flex-col space-y-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          {processing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <span>Pay ₹{amount}</span>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
