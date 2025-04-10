import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { database, DATABASE_ID, USERS_COLLECTION_ID, getUserData, getCurrentUser } from '../appwrite';
import { useAuth } from './AuthContext';
import Spinner from './Spinner';

const AuthCallback = () => {
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();
    const { setCurrentUser, setUserData } = useAuth();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                setLoading(true);
                
                // Verify user session
                const user = await getCurrentUser();
                if (!user) throw new Error('No active session found');

                setCurrentUser(user);

                try {
                    const data = await getUserData(user.$id);
                    setUserData(data);
                } catch (error) {
                    // Create new user document if not found
                    if (error.code === 404) {
                        const newUserData = {
                            userId: user.$id,
                            name: user.name || 'New User',
                            email: user.email,
                            watchlist: [],
                            favorites: [],
                            preferences: JSON.stringify({
                                preferredGenres: [],
                                adultContent: false
                            })
                        };

                        await database.createDocument(
                            DATABASE_ID,
                            USERS_COLLECTION_ID,
                            user.$id,
                            newUserData
                        );

                        const createdData = await getUserData(user.$id);
                        setUserData(createdData);
                    } else {
                        throw error;
                    }
                }

                navigate("/");
            } catch (error) {
                console.error("Authentication error:", error);
                setError(error.message || "Authentication failed");
                navigate("/login", { state: { error: error.message } });
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [navigate, setUserData, setCurrentUser]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                {loading ? (
                    <div className="flex flex-col items-center">
                        <Spinner size="lg" />
                        <p className="mt-4 text-white">Verifying authentication...</p>
                    </div>
                ) : error ? (
                    <>
                        <h2 className="text-2xl font-bold text-red-400 mb-4">
                            Authentication Error
                        </h2>
                        <p className="text-gray-300">{error}</p>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default AuthCallback;