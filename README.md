MovieFinder.
A modern React application that helps users discover movies based on their preferences, manage watchlists, login to save movies, and track favorite films.

Features

Personalized Movie Discovery - Find movies based on your preferred genres
Advanced Search & Filtering - Search by title and filter by genre
User Authentication - Register, login, or use Google sign-in
Watchlist & Favorites - Save movies to watch later or mark as favorites
Trending Movies - See what's popular right now
User Preferences - Customize your movie browsing experience
Responsive Design - Works on all devices.

Tech Stack

Frontend: React, React Router
Authentication: Appwrite Auth
Database: Appwrite Database
API: TMDB (The Movie Database)
Styling: Tailwind CSS
State Management: React Context API
Environment Variables: Vite

![moviecard](https://github.com/user-attachments/assets/66b63c7d-5428-438d-af7b-835a48d13c19)
![moviecard2](https://github.com/user-attachments/assets/2962b378-50e1-4943-b895-fbc1209860d5)


Installation

Clone the repository
git clone https://github.com/chuksInTech/react-movie-app.git

Install dependencies
cd movie_search then, cd movie_app
npm install

Create a .env file in the root directory with your API keys
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
VITE_APPWRITE_USERS_COLLECTION_ID=your_users_collection

Set up Appwrite

Create an Appwrite project
Set up authentication (including Google OAuth if needed)
Create a database with the necessary collections (users, watchlist, favorites, preferences{preferredGenres[], adultcontents:false}

Start the development server
npm run dev

API Integration
This project uses The Movie Database (TMDB) API for movie data. You'll need to:

Register for an API key at TMDB
Add your API key to the environment variables

Authentication
The app uses Appwrite for authentication with multiple options:

Email and password registration/login
Google OAuth login
Password reset functionality

For any questions or suggestions, feel free to reach out:
GitHub: github.com/chuksInTech
Email: chyootch@gmail.com
Follow me on X to get updated on new projects: x.com/chuksInTech

Made with ❤️ by Chukwum Duru (chuksInTech)

