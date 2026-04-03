import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentOptions = () => {
    const [selectedMethod, setSelectedMethod] = useState('cash');
    const [rideDetails, setRideDetails] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
        }

        const ride = localStorage.getItem('completedRide');
        if (ride) {
            setRideDetails(JSON.parse(ride));
        } else {
            // For demo purposes
            setRideDetails({
                _id: '123',
                fare: 250,
                driver: { name: 'Rajesh Kumar' }
            });
        }
    }, [navigate]);

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            toast.success('Payment successful!');
            navigate('/payment-success');
        }, 2000);
    };

    const methods = [
        { id: 'cash', name: 'Cash', icon: '💵', desc: 'Pay after the ride' },
        { id: 'card', name: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
        { id: 'wallet', name: 'CabZee Wallet', icon: '👛', desc: 'Balance: ₹500.00' },
        { id: 'upi', name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' }
    ];

    if (!rideDetails) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">Payment Options</h2>
                    <p className="mt-2 text-sm text-gray-600">Choose how you'd like to pay for your ride</p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="bg-black p-6 text-white text-center">
                        <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Amount to Pay</p>
                        <h3 className="text-4xl font-bold mt-1">₹{rideDetails.fare}</h3>
                    </div>

                    <div className="p-6 space-y-4">
                        {methods.map((method) => (
                            <div
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`relative group cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${selectedMethod === method.id
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-100 bg-white hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`text-2xl w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedMethod === method.id ? 'bg-black text-white' : 'bg-gray-100'
                                        }`}>
                                        {method.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold ${selectedMethod === method.id ? 'text-black' : 'text-gray-900'}`}>
                                            {method.name}
                                        </p>
                                        <p className="text-xs text-gray-500">{method.desc}</p>
                                    </div>
                                    {selectedMethod === method.id && (
                                        <div className="bg-black rounded-full p-1 text-white">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-3"
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>Pay ₹{rideDetails.fare}</span>
                            )}
                        </button>
                    </div>
                </div>

                <p className="text-center mt-6 text-xs text-gray-400">
                    Your payment information is encrypted and secure.
                </p>
            </div>
        </div>
    );
};

export default PaymentOptions;
