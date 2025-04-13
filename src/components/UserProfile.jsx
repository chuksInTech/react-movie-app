import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { removeFromWatchlist, removeFromFavorites, getUserData, updateUserPreferences } from "../appwrite";
import { ChevronDown, LogOut, Heart, CheckCircle, AlertCircle, BookmarkCheck, Settings, User as UserIcon } from 'lucide-react';
import Spinner from "./Spinner";
import { useAuth } from "./AuthContext.jsx";


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application.json',
        Authorization: `Bearer ${API_KEY}`
    }
}


const UserProfile = () => {

    const { currentUser, userData, setUserData, refreshUserData, logout: authLogout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [preferences, setPreferences] = useState({
        preferredGenres: [],
        adultContent: false
    });
    const [genres, setGenres] = useState([]);
    const [activeTab, setActiveTab] = useState('preferences');
    const [dropDownOpen, setDropDownOpen] = useState(false);
    const [showSaveMessage, setShowSaveMessage] = useState(false);
    const [saveMessageType, setSaveMessageType] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    const navigate = useNavigate();

    // Fetching movies from TMDB
    const fetchGenres = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
            if (!response.ok) {
                throw new Error('Failed to fetch genres');
            }
            const data = await response.json();
            setGenres(data.genres || []);
        } catch (error) {
            console.error("Error fetching genres", error);

        }

    };

    useEffect(() => {
        const initialProfile = async () => {

            try {
                setLoading(true);
                if (currentUser) {
                    const updatedData = await getUserData(currentUser.$id);
                    setUserData(updatedData);
                    setPreferences({
                        preferredGenres: userData.preferences?.preferredGenres || [],
                        adultContent: userData.preferences?.adultContent || false
                    });
                }

                await fetchGenres();

            } catch (error) {
                console.error("Error fetching user data", error);

            } finally {
                setLoading(false);
            }
        };

        initialProfile();
    }, [currentUser]);


    const handleLogout = async () => {
        try {
          await authLogout();
          sessionStorage.removeItem('movieFilterState'); // Clear saved state
          navigate('/login');
        } catch (error) {
          console.error("Error logging out", error);
        }
      };

    const handlePreferenceChange = (e) => {
        const { name, checked } = e.target;
        setPreferences(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleGenreToggle = (genreId) => {
        setPreferences(prev => {
            const genreExists = prev.preferredGenres.includes(genreId);

            if (genreExists) {
                return {
                    ...prev,
                    preferredGenres: prev.preferredGenres.filter(id => id !== genreId)
                };
            } else {
                return {
                    ...prev,
                    preferredGenres: [...prev.preferredGenres, genreId]

                };
            }
        });
    };

    const showFeedback = (msg, type) => {
        setSaveMessage(msg);
        setSaveMessageType(type);
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);
    }

    const handleSavePreferences = async () => {
        try {
           await updateUserPreferences(currentUser.$id, {
                preferredGenres: preferences.preferredGenres,
                adultContent: preferences.adultContent
            });

            // update the user data
            await refreshUserData();
            showFeedback("Changes saved successfully", "success"); 


            window.dispatchEvent(new Event('preferences-updated'));
        } catch (error) {
            console.error("Error saving preferences", error);
            showFeedback("Failed to save changes. Please try again.", "failure");

        }
    };

    const handleRemoveFromList = async (movieId, listType) => {
        try {
            if (listType === 'watchlist') {
                await removeFromWatchlist(currentUser.$id, movieId);

            } else if (listType === "favorites") {
                await removeFromFavorites(currentUser.$id, movieId);
            }

            // Refresh user data
            await refreshUserData();
        } catch (error) {
            console.error("Error removing from list", error);

        }
    };

    const getGenreName = (genreId) => {
        const genre = genres.find(g => g.id === genreId);
        return genre ? genre.name : '';
    };



    const renderProfileDropdown = () => {

        if (!userData) {
            return null; 
        }

        return (

            <div className="relative">
                <button
                    onClick={() => setDropDownOpen(!dropDownOpen)}
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 rounded-lg p-2 text-white focus:outline-none"
                >
                    <div className="bg-purple-600 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold">
                        {userData.name?.charAt(0).toUpperCase() || 'You'}
                    </div>
                    <span className="font-medium text-sm sm:text-base">{userData.name}</span>
                    <ChevronDown size={18} className={`transition-transform ${dropDownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropDownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                            <div className="px-4 py-2 border-b border-gray-700">
                                <p className="text-sm text-gray-400">Signed in as</p>
                                <p className="font-medium truncate">{userData.email}</p>
                            </div>
                            <button
                                onClick={() => { setActiveTab("profile"); setDropDownOpen(false); }}
                                className="flex items-center px-4 py-2 w-full text-sm text-left hover:bg-gray-700"
                            >
                                <UserIcon size={16} className="mr-2" />
                                Your Profile
                            </button>

                            <button
                                onClick={() => { setActiveTab("favorites"); setDropDownOpen(false); }}
                                className="flex items-center px-4 py-2 w-full text-sm text-left hover:bg-gray-700"
                            >
                                <Heart size={16} className="mr-2" />
                                Favorites
                            </button>

                            <button
                                onClick={() => { setActiveTab("watchlist"); setDropDownOpen(false); }}
                                className="flex items-center px-4 py-2 w-full text-sm text-left hover:bg-gray-700"
                            >
                                <BookmarkCheck size={16} className="mr-2" />
                                Watchlist
                            </button>

                            <button
                                onClick={() => { setActiveTab("preferences"); setDropDownOpen(false); }}
                                className="flex items-center px-4 py-2 w-full text-sm text-left hover:bg-gray-700"
                            >
                                <Settings size={16} className="mr-2" />
                                Preferences
                            </button>

                            <div className="border-t border-gray-700">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center px-4 py-2 w-full text-sm text-left hover:bg-gray-700"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        );
    };



    const renderTabContent = () => {


        switch (activeTab) {
            case "profile":
                return (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-4">Profile Information</h2>
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="bg-purple-600 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center text-base sm:text-lg md:text-xl font-bold">
                                    {userData.name?.charAt(0).toUpperCase() || 'You'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{userData.name}</h3>
                                    <p className="text-gray-400">{userData.email}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Account Created</h4>
                                <p>{new Date(userData.$createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                );



            case "favorites":
                return (
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-4">Your Favorites</h2>
                        {userData.favorites && userData.favorites.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {userData.favorites.map(movie => (
                                    <div key={movie.id} className="bg-gray-700 overflow-hidden shadow">
                                        <div className="relative">
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                alt={movie.title}
                                                className="w-full aspect-[2/3] object-contain"
                                            />
                                            <button
                                                onClick={() => handleRemoveFromList(movie.id.toString(), 'favorites')}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
                                                title="Remove from favorites"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold mb-1 truncate">{movie.title}</h3>
                                            <p className="text-gray-400 text-sm line-clamp-2">Added: {new Date(movie.added_at).toLocaleDateString()}</p>
                                            <button
                                                onClick={() => navigate(`/movie/${movie.id}`)}
                                                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}

                            </div>

                        ) : (
                            <div className="bg-gray-700 p-6 rounded-lg text-center">
                                <p className="text-gray-400 mb-4">You haven't added any movies to your favorites yet.</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
                                >
                                    Discover Movies
                                </button>
                            </div>
                        )}

                    </div>
                );



            case "watchlist":
                return (
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-4">Your Watchlist</h2>
                        {userData.watchlist && userData.watchlist.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {userData.watchlist.map(movie => (
                                    <div key={`${movie.id}-${movie.added_at}`} className="bg-gray-700 rounded-lg overflow-hidden shadow">
                                        <div className="relative">
                                            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                alt={movie.title}
                                                className="w-full aspect-[2/3] object-contain"
                                            />
                                            <button
                                                onClick={() => handleRemoveFromList(movie.id, "watchlist")}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                                                title="Remove from list"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg mb-1 truncate">{movie.title}</h3>
                                            <p className="text-sm text-gray-400 mb-2">Added: {new Date(movie.added_at).toLocaleDateString()}</p>
                                            <button
                                                onClick={() => navigate(`/movie/${movie.id}`)}
                                                className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-1.5 px-3 rounded"

                                            >
                                                Movie Details
                                            </button>
                                        </div>
                                    </div>

                                ))};
                            </div>
                        ) : (
                            <div className="bg-gray-700 p-6 rounded-lg text-center">
                                <p className="text-gray-400 mb-4">Your watchlist is empty</p>
                                <button
                                    onClick={() => navigate("/")}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
                                >
                                    Discover Movies
                                </button>

                            </div>
                        )}
                    </div>
                );



            case 'preferences':
            default:
                return (
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">

                        {showSaveMessage && (
                            <div className={` p-3 font-bold rounded-md text-sm z-20 ${saveMessageType === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white flex items-center max-w-xs md:max-w-sm lg:max-w-md mx-auto fixed top-5 left-1/2 transform -translate-x-1/2`}>
                                {saveMessageType === 'success' ? (
                                    <CheckCircle size={16} className="mr-2" />
                                ) : (
                                    <AlertCircle size={16} className="mr-2" />
                                )}
                                {saveMessage}
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base sm:text-lg md:text-xl font-bold">Your Preferences</h2>
                            <button
                                onClick={() => handleSavePreferences()}
                                className="bg-green-600 px-2 py-1.5 text-sm sm:px-3 sm:py-1.8 sm:text-base md:px-4 md:py-2 md:text-lg hover:bg-green-700 text-white font-bold rounded"
                            >
                                Save Changes
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3">Settings</h3>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="adultContent"
                                        checked={preferences.adultContent}
                                        onChange={handlePreferenceChange}
                                        className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span> Show adult content in search results</span>
                                </label>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3">Preferred Genres</h3>
                                <p className="text-sm text-gray-400 mb-3">Select the genres you're most interested in to improve your recommendations.</p>
                                <div className="flex flex-col sm:flex-row flex-wrap overflow-hidden gap-2">
                                    {genres.map(genre => (
                                        <button
                                            key={genre.id}
                                            onClick={() => handleGenreToggle(genre.id)}
                                            className={`bg-gray-800 text-white px-4 py-2 rounded-lg text-sm focus:outline-none transition-colors ${preferences.preferredGenres.includes(genre.id)
                                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                                : 'bg-gray-600 hover:bg-gray-700 text-gray-200'
                                                }`}
                                        >
                                            {genre.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {preferences.preferredGenres.length > 0 && (
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-3">Selected Genres</h3>
                                    <div className="space-y-1">
                                        {preferences.preferredGenres.map(genreId => (
                                            <div key={genreId} className="flex justify-between items-center py-1">
                                                <span>{getGenreName(genreId)}</span>
                                                <button
                                                    onClick={() => handleGenreToggle(genreId)}
                                                    className="text-red-400 hover:text-red-300"
                                                    title="Remove Genre"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                );
        }

    }

    if (loading) {
        return (
            <Spinner />
        )
    }


    return (
        <div className="min-h-screen bg-gray-900 text-white py-6 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <a href="/" className="text-xl font-bold text-purple-500">MovieFinder</a>
                    {renderProfileDropdown()}
                </div>
                <div className="mb-6">

                    <nav className="space-x-1 space-y-1.5">
                        <button
                            onClick={() => setActiveTab("preferences")}
                            className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'preferences' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Preferences
                        </button>

                        <button
                            onClick={() => setActiveTab("watchlist")}
                            className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'watchlist' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Watchlist
                        </button>

                        <button
                            onClick={() => setActiveTab("favorites")}
                            className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'favorites' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Favorites
                        </button>

                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'profile' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Profile
                        </button>
                    </nav>
                </div>

                {renderTabContent()}
            </div>
        </div>
    );

};
export default UserProfile
