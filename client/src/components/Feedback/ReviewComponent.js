import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ReviewComponent = () => {
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const rating = localStorage.getItem('tempRating') || 5;

    const handleSubmitReview = async () => {
        if (!review.trim()) {
            toast.error('Please write a short review');
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            localStorage.removeItem('tempRating');
            localStorage.removeItem('completedRide');
            toast.success('Thank you for your review!');
            navigate('/rider');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-gray-900 to-black p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-2">Write a Review</h2>
                    <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <p className="text-gray-400 text-sm">Mind sharing more about your experience?</p>
                </div>

                <div className="p-8">
                    <div className="mb-8">
                        <label className="block text-gray-700 font-bold mb-3 text-sm uppercase tracking-wide">
                            Your Comments
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Driver was professional, car was clean..."
                            rows="5"
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium"
                        />
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={handleSubmitReview}
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <span>Submit Review</span>
                            )}
                        </button>
                        <button
                            onClick={() => navigate('/rider')}
                            className="w-full text-gray-400 font-semibold py-2 hover:text-gray-600 transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewComponent;
