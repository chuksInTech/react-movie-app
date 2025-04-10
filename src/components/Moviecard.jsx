import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToWatchlist, addToFavorites } from '../appwrite';
import { Heart, Bookmark, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';


const Moviecard = ({ movie }) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [isInFavorites, setIsInFavorites] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showExistPrompt, setShowExistPrompt] = useState(false);

    const { currentUser, userData, refreshUserData, checkMovieInList } = useAuth();

    useEffect(() => {
        const checkUserStatus = async () => {
            try {

                const { inWatchlist, inFavorites } = checkMovieInList(movie.id);

                if (currentUser) {
                    setIsLoggedIn(true);
                    setUserId(currentUser.$id);

                    // Get user data to check lists
                    setIsInWatchlist(inWatchlist)
                    setIsInFavorites(inFavorites)
                }
            } catch (error) {
                console.error("Error checking user status", error);
            }
        };

        checkUserStatus();
    }, [movie.id, currentUser, userData]);

    const showFeedback = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
    };

    const handleWatchlistClick = async (e) => {
        e.stopPropagation();

        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 3000);
            return;
        };

        if (isInWatchlist) {
            setShowExistPrompt(true);
            setTimeout(() => setShowExistPrompt(false), 3000);
            return;
        };

        try {
            const updatedUserData = await addToWatchlist(userId, movie);

            if (updatedUserData) {
                setIsInWatchlist(true);
                showFeedback('Added to watchlist!', 'success');
                await refreshUserData();
            }

        } catch (error) {
            console.error("Error adding to watchlist", error);
            showFeedback("Failed to add to watchlist!", "failure");
        }
    };

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();

        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 3000);
            return;
        }

        if (isInFavorites) {
            setShowExistPrompt(true);
            setTimeout(() => setShowExistPrompt(false), 3000);
            return;
        };

        try {
            const updatedUserData = await addToFavorites(userId, movie);
            if (updatedUserData) {
                setIsInFavorites(true);
                showFeedback('Added to favorites!', 'success');
                await refreshUserData();
            }

        } catch (error) {
            console.error("Error adding to favorites:", error);
            showFeedback("Failed to add to favorites!", "failure");
        }
    };

    const getPosterUrl = (path) => {
        return path
            ? `https://image.tmdb.org/t/p/w500${path}`
            : '/placeholder-poster.jpg'; 
    };

    return (
        <li className='relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer trasition-transform hover:-translate-y-1 hover:shadow-xl'
            onClick={() => navigate(`/movie/${movie.id}`)}
        >
            <div className='relative'>
                <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    className='w-full aspect-[2/3] object-contain'
                    loading='lazy'
                />

                <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity'>
                    <div className='absolute bottom-0 p-4 w-full'>
                        <div className='flex justify-between items-center mb-2'>
                            <div className='bg-yellow-600 text-white text-sm font-bold px-2 py-1 rounded'>
                                {movie.vote_average?.toFixed(1) || 'N/A'}
                            </div>
                            <div className='flex space-x-2'>
                                <button
                                    onClick={handleWatchlistClick}
                                    className={`p-1.5 rounded-full ${isInWatchlist ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'}`}
                                    title={isInWatchlist ? 'Added to watchlist' : 'Add to watchlist'}
                                >
                                    < Bookmark size={16} />
                                </button>
                                <button
                                    onClick={handleFavoriteClick}
                                    className={`p-1.5 rounded-full ${isInFavorites ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'}`}
                                    title={isInFavorites ? "Added to favorites" : "Add to favorites"}
                                >
                                    <Heart size={16} />
                                </button>
                            </div>
                        </div>
                        <p className='text-white text-sm'>
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <h2 className="font-semibold text-lg truncate text-white">{movie.title}</h2>
                <p className="text-gray-400 text-sm line-clamp-2 h-10 mt-1">{movie.overview || 'No description available.'}</p>
            </div>

            {showLoginPrompt && (
                <div className="absolute top-1/2 left-1/2 bg-gray-900 text-white text-sm py-2 px-3 rounded-md shadow-lg flex items-center transform -translate-x-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="mr-2 text-yellow-500" />
                    Please log in to save movies
                </div>
            )}

            {showExistPrompt && (
                <div className="absolute top-1/2 left-1/2 bg-gray-900 text-white text-sm py-2 px-3 rounded-md shadow-lg flex items-center transform -translate-x-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="mr-2 text-yellow-500" />
                    Movie already exist!
                </div>
            )}

            {showMessage && (
                <div className={`absolute top-1/2 left-1/2 p-2 rounded-md text-sm ${messageType === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white flex items-center tranform -translate-x-1/2 -translate-y-1/2`}>
                    {messageType === 'success' ? (
                        <CheckCircle size={16} className="mr-2" />
                    ) : (
                        <AlertCircle size={16} className="mr-2" />
                    )}
                    {message}
                </div>
            )}
        </li>
    );

}
export default Moviecard

