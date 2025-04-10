import React, { useState } from 'react'
import { sendPasswordRecovery } from '../appwrite.js';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");
        console.log("Sending password reset email to", email);

        try {
            await sendPasswordRecovery(email.trim().toLowerCase());
            setMessage('Password reset email sent. Please check your inbox.');
        } catch (error) {
            console.error("Error sending password reset email", error);
            setError("Error sending password reset email. Please check the email and try again.");

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-900'>
            <div className='bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md'>
                <h2 className='text-2xl font-bold text-white mb-6 text-center'>Reset Password</h2>

                {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
                {message && <div className="bg-green-500 text-white p-3 rounded mb-4">{message}</div>}

                <form onSubmit={handleResetPassword} className='space-y-4'>
                    <div>
                        <label htmlFor="email" className='block text-sm font-medium text-gray-300 mb-1'>Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full bg-gray-700 text-white border border-gray-600 rounded p-2'
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className='w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-gray-400'>
                        Remember your password?{" "}
                        <a href="/login" className='text-purple-400 hover:text-purple-300'>Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
};



export default ForgotPassword