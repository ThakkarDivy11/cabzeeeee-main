import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RatingComponent = () => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const navigate = useNavigate();

    const handleRatingSubmit = () => {
        if (rating === 0) {
            toast.error('Please select a rating before continuing');
            return;
        }

        // Store rating temp
        localStorage.setItem('tempRating', rating);
        navigate('/review-ride');
    };

    const labels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:p-12">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">How was your ride?</h1>
                <p className="text-gray-500 mb-10">Your feedback helps us improve the experience for everyone.</p>

                {/* Star Selection */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform active:scale-90"
                        >
                            <svg
                                className={`w-14 h-14 transition-all duration-200 ${star <= (hover || rating) ? 'text-yellow-400 scale-110 drop-shadow-md' : 'text-gray-200'
                                    }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </button>
                    ))}
                </div>

                <div className="h-8 mb-12">
                    {rating > 0 && (
                        <span className="text-xl font-bold text-gray-900 bg-gray-50 px-4 py-1 rounded-full border border-gray-100 animate-pulse">
                            {labels[rating]}
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleRatingSubmit}
                        className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-20"
                        disabled={rating === 0}
                    >
                        Continue
                    </button>
                    <button
                        onClick={() => navigate('/rider')}
                        className="w-full text-gray-400 font-semibold py-2 hover:text-gray-600 transition-colors"
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingComponent;
