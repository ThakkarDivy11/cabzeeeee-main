import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            {/* Success Animation Container */}
            <div className="mb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Payment Successful!
            </h1>
            <p className="text-gray-600 text-lg mb-10 max-w-sm mx-auto">
                Your payment has been processed successfully. Thank you for riding with CabZee!
            </p>

            {/* Ride Summary Card */}
            <div className="w-full max-w-sm mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                    <span className="text-gray-500 font-medium tracking-wide">Transaction ID</span>
                    <span className="text-gray-900 font-bold">#CZ-592810</span>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Date</span>
                        <span className="text-gray-900 font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="text-gray-900 font-medium">Cash</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                        <span className="text-gray-900 font-bold text-xl">Amount Paid</span>
                        <span className="text-black font-extrabold text-xl">₹250.00</span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-sm space-y-4">
                <button
                    onClick={() => navigate('/rate-ride')}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                >
                    Rate your Driver
                </button>
                <button
                    onClick={() => navigate('/rider')}
                    className="w-full bg-white text-gray-700 py-4 rounded-xl font-bold text-lg border-2 border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
