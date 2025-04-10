import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { completePasswordRecovery } from '../appwrite';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // getting url params
    const urlParams = new URLSearchParams(location.search);
    const userId = urlParams.get('userId');
    const secret = urlParams.get('secret');

    useEffect(() => {
        if (!userId || !secret) {
            setError('Invalid or expired reset link. Please request a new one.');
            
        }
    }, [userId, secret]);
        
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match. Please check the password and try again.');
            setIsLoading(false);
            return;
        }

        if (!userId || !secret) {
            setError('Invalid or expired reset link. Please request a new one.');
            setIsLoading(false);
            return;
            
        }

        try {
            await completePasswordRecovery(userId, secret, password, confirmPassword);
            setMessage('Password reset successfully!');
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }
            , 2000);

        } catch (error) {
            console.error('Error resetting password', error);
            setError('Error resetting password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }


  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-900'>
    <div className='bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md'>
        <h2 className='text-2xl font-bold text-white mb-6 text-center'>Create New Password</h2>

        {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
        {message && <div className="bg-green-500 text-white p-3 rounded mb-4">{message}</div>}

        <form onSubmit={handleResetPassword} className='space-y-4'>
            <div>
                <label htmlFor="password" className='block text-sm font-medium text-gray-300 mb-1'>New Password</label>
                <input 
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full bg-gray-700 text-white border border-gray-600 rounded p-2'
                    required
                    minLength={8} 
                />
            </div>

            <div>
                <label htmlFor="confirm-password" className='block text-sm font-medium text-gray-300 mb-1'>Confirm New Password</label>
                <input 
                    type="password" 
                    value={confirmPassword}
                    id="confirm-password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='w-full bg-gray-700 text-white border border-gray-600 rounded p-2'
                    required 
                />
            </div>

            <button
                type="submit"
                className='w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                disabled={isLoading || !userId || !secret}
            >
                {isLoading ? "Resetting..." : "Reset Password"}
            </button>
        </form>
    </div>
</div>
  );
}

export default ResetPassword;