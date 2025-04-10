import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { useAuth } from './AuthContext.jsx';
import Spinner from './Spinner.jsx';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();


    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
          }
        setIsLoading(true);
        setError("");

        try {
            setError('');
            setIsLoading(true);
            await login(email, password);
            navigate("/");
        } catch (error) {
            console.error("Error logging in", error);
            setError("Error logging in. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate("/");
        } catch (error) {
            console.error("Error logging in with Google", error);
            setError("Failed to login with Google. Please try again.");

        }
    }
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6 text-center"> Log In</h2>

                {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleLogin} className='space-y-4'>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input type="email"
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                            required
                        />
                    </div>

                    <div className="text-right mb-2">
                        <a href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        type='submit'
                        disabled={isLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                    >
                        {isLoading ? <Spinner size="sm"/> : "Log In"}

                    </button>

                </form>
                <div className='mt-4 text-center'>
                    <p className='text-gray-400'>OR</p>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className='mt-2 w-full bg-white text-gray-800 font-bold py-2 px-4 rounded flex items-center justify-center'
                    >
                        <FcGoogle className='mr-2 text-xl' />
                        Continue with Google
                    </button>
                </div>

                <div className='mt-6 text-center'>
                    <p className='text-gray-400'>Don't have an account? {' '}
                        <a href="/register" className='text-purple-400 hover:text-purple-300'>Register</a>
                    </p>
                </div>

            </div>

        </div>
    )
}

export default Login