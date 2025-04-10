import { Client, Databases, ID, Query, Account } from 'appwrite';

export const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
export const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(PROJECT_ID)

export const database = new Databases(client);
export const account = new Account(client);

export const createAccount = async (name, email, password) => {
    const cleanedEmail = email.trim().toLowerCase();
    try {
        const newAccount = await account.create(ID.unique(), cleanedEmail, password, name.trim());
        return newAccount;
    } catch (error) {
        console.error("Error creating account:", error);
        throw error;
    }
};

export const createUserDocument = async (userId, name, email) => {
    try {
        return await database.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            {
                userId: userId,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                watchlist: [],
                favorites: [],
                preferences: JSON.stringify({
                    preferredGenres: [],
                    adultContent: false
                })
            }
        );
    } catch (error) {
        console.error("Error creating user document:", error);
        throw error;
    }
};

export const getSession = async () => {
    try {
        return await account.getSession('current');
    } catch (error) {
        console.error("Error getting session", error);
        return null;
    }
};

export const login = async (email, password) => {
    try {
        const cleanedEmail = email.trim().toLowerCase();
        const session = await account.createEmailPasswordSession(cleanedEmail, password);
        await new Promise(resolve => setTimeout(resolve, 500)); // Session propagation delay
        return session;
    } catch (error) {
        console.error("Login error details:", error);
        throw error;
    }
};

export const googleLogin = async () => {
    try {
        account.createOAuth2Session(
            "google",
            `${window.location.origin}/auth-callback`,
            `${window.location.origin}/login`,
            ["profile", "email"]
        );
    } catch (error) {
        console.error("error logging in with Google", error);
        throw error;

    }
}

export const logout = async () => {
    try {
        await account.deleteSession("current");
    } catch (error) {
        console.error("error logging out", error);
        throw error;
    }

};

export const getCurrentUser = async () => {
    try {
        await getSession();
        return await account.get();
    } catch (error) {
        console.error("Error getting current user:", error);

    }
};

export const getUserData = async (userId) => {
    try {
        const userDoc = await database.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);

        const watchlist = userDoc.watchlist || [];
        const favorites = userDoc.favorites || [];

        const parsedUserDoc = {
            ...userDoc,
            preferences: JSON.parse(userDoc.preferences || '{"preferredGenres":[],"adultContent":false}'),
            watchlist: watchlist.map(item => typeof item === 'string' ? JSON.parse(item) : item),
            favorites: favorites.map(item => typeof item === 'string' ? JSON.parse(item) : item)
        };
        return parsedUserDoc
    } catch (error) {
        console.error("Error getting user data:", error);
        console.log("Fetched watchlist:", userDoc.watchlist);
        throw error;
    }
};

export const addToWatchlist = async (userId, movie) => {
    try {
        const userData = await getUserData(userId);
        const exists = userData.watchlist.some(item => item.id === movie.id.toString());
        const existingItem = userData.watchlist.map(item => JSON.stringify(item));

        if (!exists) {
            const watchlistItem = {
                id: movie.id.toString(),
                title: movie.title,
                poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                added_at: new Date().toISOString()
            };


            const updatedWatchlist = [
                ...existingItem,
                JSON.stringify(watchlistItem)
            ];

            await database.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userId,
                { watchlist: updatedWatchlist }
            );
        }
        const updatedUserData = await getUserData(userId);
        return updatedUserData;

    } catch (error) {
        console.error("Error adding to watchlist:", error);
        throw error;
    }
};

export const removeFromWatchlist = async (userId, movieId) => {
    try {
        const userData = await getUserData(userId);
        const filtered = userData.watchlist.filter(movie => movie.id !== movieId.toString()).map(item => JSON.stringify(item));

        return await database.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            { watchlist: filtered }
        );
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        throw error;
    }
};

export const addToFavorites = async (userId, movie) => {
    try {
        const userData = await getUserData(userId);
        // Check if movie already exists in favorites
        const existingItem = userData.favorites.map(item => JSON.stringify(item));
        const exists = userData.favorites.some(item => item.id === movie.id.toString());

        if (!exists) {
            const favoriteItem = {
                id: movie.id.toString(),
                title: movie.title,
                poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                added_at: new Date().toISOString()
            };

            const updatedFavorites = [
                ...existingItem,
                JSON.stringify(favoriteItem)
            ];

            await database.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userId,
                { favorites: updatedFavorites }
            );
        }
        const updatedUserData = await getUserData(userId);
        return updatedUserData;
    } catch (error) {
        console.error("Error adding to favorites:", error);
        throw error;
    }
};

export const removeFromFavorites = async (userId, movieId) => {
    try {
        const userData = await getUserData(userId);
        const filtered = userData.favorites.filter(movie => movie.id !== movieId.toString()).map(item => JSON.stringify(item));

        return await database.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            { favorites: filtered }
        );
    } catch (error) {
        console.error("Error removing from favorites:", error);
        throw error;
    }
};

export const updateUserPreferences = async (userId, newPreferences) => {
    try {
        await database.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            { preferences: JSON.stringify(newPreferences) } // Stringify before saving
        );
    } catch (error) {
        console.error("Error updating preferences:", error);
        throw error;
    }
};



export const sendPasswordRecovery = async (email) => {
    try {
        // The URL that the user will be redirected to after clicking the recovery link
        const redirectUrl = window.location.origin + '/reset-password';
        return await account.createRecovery(email, redirectUrl);
    } catch (error) {
        console.error("Error sending password recovery email", error);
        throw error;
    }
}

export const completePasswordRecovery = async (userId, secret, password, passwordAgain) => {
    try {
        return await account.updateRecovery(userId, secret, password, passwordAgain);
    } catch (error) {
        console.error("Error completing password recovery", error);
        throw error;
    }
}


export const updateSearchCount = async (searchTerm, movie) => {
    // use appwrite sdk to check if the search term exists in the database

    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal("searchTerm", searchTerm),
        ]);

        //    if it does, update the count
        if (result.documents.length > 0) {
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            })

            // if it does Notification, create a new document with the search term and count as 1
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }
    } catch (error) {
        console.error(error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ])

        return result.documents
    } catch (error) {
        console.error(error);
    }
}