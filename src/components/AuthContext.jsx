import React, { createContext, useContext, useState, useEffect } from 'react';
import { DATABASE_ID, USERS_COLLECTION_ID } from '../appwrite.js';
import { getCurrentUser, getUserData, createUserDocument, createAccount, googleLogin, login as appwriteLogin, logout as appwriteLogout } from '../appwrite.js';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on initial load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                const user = await getCurrentUser();

                if (user) {
                    setCurrentUser(user);
                    const data = await getUserData(user.$id);

                    if (typeof data.preferences === "string") {
                        data.preferences = JSON.parse(data.preferences);
                        
                    }
                    setUserData(data);
                }
            } catch (err) {
                console.error("Auth check error:", err);
                setError("Failed to authenticate");
                setCurrentUser(null);
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Signup function
    const signup = async (name, email, password) => {
        try {
            setLoading(true);
            console.log("Creating account for:", email);
            const user = await createAccount(name, email, password);
            
            console.log("Logging in with new credentials");
            await appwriteLogin(email, password);
            
            console.log("Creating user document");
            await createUserDocument(user.$id, name, email);
            
            const currentUser = await getCurrentUser();
            setCurrentUser(currentUser);
            
            const userData = await getUserData(currentUser.$id);
            setUserData(userData);
            
            return currentUser;
        } catch (err) {
            console.error("Signup error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            setLoading(true);
            await appwriteLogin(email, password);
            const user = await getCurrentUser();
            setCurrentUser(user);

            const data = await getUserData(user.$id);
            setUserData(data);

            return user;
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Failed to login");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        try {
            setLoading(true);
            await googleLogin();

            await new Promise((resolve) => setTimeout(resolve, 2000));

            const user = await getCurrentUser();

            if (!user) throw new Error("Google login failed");

            try {
                const existingUser = await getUserData(user.$id);
                setUserData(existingUser);
            } catch (error) {
                if (error.code === 404) {
                    await database.createDocument( DATABASE_ID, USERS_COLLECTION_ID, user.$id, {
                        userId: user.$id,
                        name: user.name,
                        email: user.email,
                        watchlist: [],
                        favorites: [],
                        preferences: JSON.stringify({
                            preferredGenres: [],
                            adultContent: false
                        })
                    });

                    
                } 
                
            }

            const data = await getUserData(user.$id);
            setUserData(data);
            setCurrentUser(user);

        } catch (error) {
            console.error("Google login error:", error);
            setError(error.message || "Google login failed");
            throw error;
        } finally {
            setLoading(false);
        }
    };


    // Logout function
    const logout = async () => {
        try {
            setLoading(true);
            await appwriteLogout();
            setCurrentUser(null);
            setUserData(null);
        } catch (err) {
            console.error("Logout error:", err);
            setError(err.message || "Failed to logout");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const refreshUserData = async () => {
        try {
            const updatedData = await getUserData(currentUser.$id); 
          if (!updatedData) throw new Error("User not found");
      
          setUserData(updatedData);
          return updatedData; 
      
        } catch (error) {
          console.error("Error refreshing user data:", error);
          setUserData(null);
          throw error;
        }
      };
    

    const checkMovieInList = (movieId) => {
        return {
            inWatchlist: userData?.watchlist?.some(item => item.id === movieId.toString()),
            inFavorites: userData?.favorites?.some(item => item.id === movieId.toString())
        }
    };

    const value = {
        currentUser,
        userData,
        loading,
        error,
        signup,
        login,
        logout,
        refreshUserData,
        setCurrentUser,
        setUserData,
        loginWithGoogle,
        checkMovieInList
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;