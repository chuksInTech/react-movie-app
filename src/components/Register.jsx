import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from "./AuthContext.jsx";
import Spinner from './Spinner.jsx';


// Password generator function
const generateStrongPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    const length = 16;
    let password = "";
    
    // Ensure at least one character from each category
    password += chars[Math.floor(Math.random() * 26)]; 
    password += chars[26 + Math.floor(Math.random() * 26)]; 
    password += chars[52 + Math.floor(Math.random() * 10)]; 
    password += chars[62 + Math.floor(Math.random() * 10)]; 
    
    for (let i = 4; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

const Register = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedPassword, setSuggestedPassword] = useState('');
    const passwordRef = useRef(null);  
    const [suggestionVisible, setSuggestionVisible] = useState(false);
    const suggestionTimer = useRef(null);

    const navigate = useNavigate()
    const { signup } = useAuth();

    const handlePasswordFocus = () => {
        clearTimeout(suggestionTimer.current);
        setSuggestionVisible(true);
        setSuggestedPassword(generateStrongPassword());
    };

    const handlePasswordBlur = () => {
        // Delay hiding to allow for button clicks
        suggestionTimer.current = setTimeout(() => {
          setSuggestionVisible(false);
        }, 200);
      };

    const useSuggestedPassword = () => {
        setPassword(suggestedPassword);
        setConfirmPassword(suggestedPassword);
        setSuggestionVisible(false);
        clearTimeout(suggestionTimer.current);
    };

    const handleRegister = async (e) => {
        console.log("Register button clicked");
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Basic email validation
        const cleanEmail = email.trim().toLowerCase();
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
            setError("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        if (!email || !password || !name || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match. Please check the password and try again")
            setIsLoading(false);
            return;
        }

        if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(.{8,})$/.test(password)) {
            setError("Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true)
            setError("");
            await signup(name, cleanEmail, password);
            console.log("Account created successfully. Navigating to home.");
            navigate("/");
        } catch (err) {
            console.error("Error creating account", err);
            if (err.message.includes("already exists")) {
                setError("An account with this email already exist. Please log in.");
            } else {
                setError("Registration failed. Please try again.")
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-900'>
            <div className='bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md'>
                <h2 className='text-2xl font-bold text-white mb-6 text-center'>Create an Account</h2>

                {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

                <form 
                onSubmit={handleRegister} 
                method='POST'
                autoComplete='on'
                className='space-y-4'>
                    <div>
                        <label htmlFor='name' className='block text-sm font-medium text-gray-300 mb-1'>Full Name</label>
                        <input
                            id='name'
                            type='text'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete='name'
                            className='w-full bg-gray-700 text-white border border-gray-600 rounded p-2'
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className='block text-sm font-medium text-gray-300 mb-1'>Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete='email'
                            className='w-full bg-gray-700 text-white border border-gray-600 rounded p-2'
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm-email" className='block text-sm font-medium text-gray-300 mb-1'>
                            Confirm Email
                        </label>
                        <input
                            type="email"
                            id="confirm-email"
                            autoComplete='email'
                            onChange={(e) => {
                                if (e.target.value !== email) {
                                    setError("Emails do not match");
                                }
                            }}
                            className='w-full bg-gray-700 text-white border border-gray-600 rounded p-2'
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className='block text-sm font-medium text-gray-300 mb-1'>Password</label>
                        <input
                            ref={passwordRef}
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={handlePasswordFocus}
                            onBlur={handlePasswordBlur}
                            className='w-full bg-gray-700 text-white border border-gray-600 rounded p-2'
                            required
                            minLength={8}
                            autoComplete='new-password'
                        />

                        {suggestionVisible && (
                            <div 
                            className='pointer-events-auto z-10 top-full left-0 right-0 mt-2 bg-gray-700 p-4 rounded-lg shadow-xl'
                            onMouseEnter={() => clearTimeout(suggestionTimer.current)}
                            onMouseLeave={() => setSuggestionVisible(false)}
                            >
                                <div className='flex items-center justify-between mb-2'>
                                    <span className='text-sm text-green-400'>Suggested Password</span>
                                    <button
                                    type='button'
                                    onClick={() => useSuggestedPassword()}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="!pointer-events-auto text-blue-400 hover:text-blue-300 text-sm"

                                    >
                                        Refresh
                                    </button>
                                </div>
                                <div className='flex items-center justify-between'>
                                <code className="text-sm text-white">{suggestedPassword}</code>
                                <button
                                type='button'
                                onClick={useSuggestedPassword}
                                 className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                                >
                                    Use This
                                </button>
                                </div>
                                <p className="mt-2 text-xs text-gray-400">
                                <span className="block">Use strong password. You don't have remember it, it'll saved securely in your google account.</span>
                                </p>
                            </div>
                        )}
                           
                    </div>

                    <div>
                        <label htmlFor="confirm password" className='block text-sm font-medium text-gray-300 mb-1'>Confirm Password</label>
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
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner size="sm" /> : "Register"}
                    </button>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-gray-400'>
                        Already have an account?{" "}
                        <a href="/login" className='text-purple-400 hover:text-purple-300'> Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register