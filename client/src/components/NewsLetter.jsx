import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const NewsLetter = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email');
            return;
        }

        try {
            setLoading(true);
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/subscriber/subscribe`,
                { email }
            );
            
            if (data.success) {
                toast.success(data.message);
                setEmail('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-2 mt-24 pb-14">
            <h1 className="md:text-4xl text-2xl font-semibold">Never Miss a Deal!</h1>
            <p className="md:text-lg text-gray-500/70 pb-8">
                Subscribe to get the latest offers, new arrivals, and exclusive discounts
            </p>
            <form onSubmit={handleSubmit} className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12">
                <input
                    className="border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
                    type="email"
                    placeholder="Enter your email id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    className="md:px-12 px-8 h-full text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer rounded-md rounded-l-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
            </form>
        </div>
    )
}

export default NewsLetter