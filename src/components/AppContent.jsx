import { useDebounce } from 'use-debounce';
import React, { useEffect, useState } from 'react';
import { AuthProvider } from './AuthContext.jsx';
import Search from './search.jsx';
import Spinner from './Spinner.jsx';
import Moviecard from './Moviecard.jsx';
import GenreFilter from './GenreFilter.jsx';
import SortOptions from './SortOptions.jsx';
import { useNavigate } from "react-router-dom";
import { updateSearchCount, getTrendingMovies } from '../appwrite.js';
import { getPreferredGenresDisplayName } from "../utility.js";
import NavBar from './NavBar.jsx';
import { useAuth } from './AuthContext.jsx';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
    },
}

const AppContent = () => {
    const navigate = useNavigate()

    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState("");
    const [movieList, setMovieList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const { currentUser, userData } = useAuth();

    const [genres, setGenres] = useState([]);
    const [sortBy, setSortBy] = useState();
    const [selectedGenre, setSelectedGenre] = useState("");
    const [isUsingPreferredGenres, setIsUsingPreferredGenres] = useState(false);

    const [debouncedSearchTerm] = useDebounce(searchTerm, 1000);

    // Initialize component state
    useEffect(() => {
        const initializeComponent = async () => {
            // Load saved filter state if it exists
            const savedFilterState = sessionStorage.getItem('movieFilterState');
            if (savedFilterState) {
                try {
                    const { isUsingPrefs, genreSelection } = JSON.parse(savedFilterState);
                    setIsUsingPreferredGenres(isUsingPrefs);
                    setSelectedGenre(genreSelection);
                } catch (e) {
                    console.error("Error parsing saved filter state", e);
                }
            // Otherwise set default state based on user preferences
            } else if (currentUser && userData?.preferences?.preferredGenres?.length > 0) {
                setIsUsingPreferredGenres(true);
                setSelectedGenre("");
            }

            // Fetch genres if needed
            if (genres.length === 0) {
                await fetchGenres();
            }
        };

        initializeComponent();

    }, [currentUser, userData]);

    useEffect(() => {
        if (genres.length > 0) {  // Only fetch if genres are loaded
            fetchMovies(debouncedSearchTerm);
        }
    }, [isUsingPreferredGenres, selectedGenre, debouncedSearchTerm, sortBy, genres]);

    useEffect(() => {
        if (currentUser) {
            sessionStorage.setItem('movieFilterState', JSON.stringify({
                isUsingPrefs: isUsingPreferredGenres,
                genreSelection: selectedGenre
            }));
        }
    }, [isUsingPreferredGenres, selectedGenre, currentUser]);
    
    useEffect(() => {
        if (currentUser && userData?.preferences?.preferredGenres?.length > 0 && !selectedGenre) {
          setIsUsingPreferredGenres(true);
          setSelectedGenre(""); // Explicitly clear any selected genre
        }
      }, [userData, currentUser, selectedGenre]);

    const fetchGenres = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
            if (!response.ok) {
                throw new Error("Failed to fetch genre");
            }
            const data = await response.json();
            setGenres(data.genres || []);

        } catch (error) {
            console.error("Error fetching genres", error);
        }
    };


    useEffect(() => {
        // Listen for preference updates from other components
        const handlePreferenceUpdate = () => {
            if (currentUser) {
              setIsUsingPreferredGenres(true);
              setSelectedGenre(""); // Reset any manual genre selection
              fetchMovies(debouncedSearchTerm);
            }
          };

        window.addEventListener('preferences-updated', handlePreferenceUpdate);

        return () => {
            window.removeEventListener('preferences-updated', handlePreferenceUpdate);
        };
    }, [currentUser, selectedGenre, debouncedSearchTerm]);

    const fetchMovies = async (query = "") => {

        setLoading(true);
        setErrorMessage("");
        try {
            let endpoint = new URL(`${API_BASE_URL}/${query ? "search/movie" : "discover/movie"}`);

            // add querry parameters
            const params = new URLSearchParams();

            if (query) {
                params.append("query", query)
            }

            params.append("sort_by", sortBy || "popularity.desc");

            if (isUsingPreferredGenres && currentUser && userData?.preferences?.preferredGenres?.length > 0) {
                const preferredGenres = userData.preferences.preferredGenres.join(',');
                params.append("with_genres", preferredGenres);
            }
            else if (selectedGenre) {
                params.append("with_genres", selectedGenre);
            } else {
                console.log("No genre filter - showing all genres:", selectedGenre);
            }

            // Apply adult content preference if user is logged in
            if (currentUser && userData?.preferences?.adultContent !== undefined) {
                params.append("include_adult", userData.preferences.adultContent);
            }


            //  Append the parameters to the end point
            endpoint.search = params.toString();

            const response = await fetch(endpoint.toString(), API_OPTIONS);

            if (!response.ok) {
                throw new Error("failed to fetch movies");
            }

            const data = await response.json();

            if (!data.results) {
                setErrorMessage("Error fetching movies")
                setMovieList([]);
                return;
            }
            setMovieList(data.results || []);

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.error("error fetching ,movies: ", error);
            setErrorMessage("Error fetching movies, please try again later");
        } finally {
            setLoading(false);
        }
    };

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            console.log("Trending movies from Appwrite:", movies);
            setTrendingMovies(movies)
        } catch (error) {
            console.error("Error fetching trending movies", error);
        }
    };

    //  handle genre here change
    const handleGenreChange = (genreId) => {
        if (genreId === "preferred") {
            setSelectedGenre("");
            setIsUsingPreferredGenres(true);
        } else {
            setSelectedGenre(genreId);
            setIsUsingPreferredGenres(false);
        }
    };

    // handle sort by change
    const handleSortChange = (sortOptions) => {
        setSortBy(sortOptions);
    };

    // Add an effect to load user preferences when the user logs in
    useEffect(() => {
        if (!selectedGenre) {
            fetchMovies(debouncedSearchTerm);
        }
    }, [userData]);

    useEffect(() => {
        fetchGenres();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            await fetchMovies(debouncedSearchTerm);
        };
        fetchData();
    }, [debouncedSearchTerm, selectedGenre, sortBy]);

    useEffect(() => {
        const fetchTrendingMovies = async () => {
            await loadTrendingMovies();
        };
        fetchTrendingMovies();
    }, []);

    return (
        <AuthProvider>
            <main>
                <div className="pattern">
                    <div className="wrapper">
                        <NavBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                        <header>
                            <img src="./hero.png" alt="" />
                            <h1
                                className='mb-10'
                            >Find <span className='text-gradient'>Movies</span> you will enjoy without the hassle</h1>

                            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                            <h1 className="text-white">{searchTerm}</h1>

                        </header>

                        <h3 className="sm:text-xs md:text-sm lg:text-base py-2 px-4 sm:px-4 text-gray-500 italic tracking-wide mb-1 mt-8 text-center sm:text-left">
                            Select the genres you're most interested in to improve your recommendations.
                        </h3>

                        {/* filter and search controls */}
                        <div className='filter-controls' >

                            <GenreFilter genres={genres}
                                selectedGenre={selectedGenre}
                                onGenreChange={handleGenreChange}
                                isUsingPreferredGenres={isUsingPreferredGenres}
                            />

                            <SortOptions
                                onSortChange={handleSortChange}
                                selectedSort={sortBy}
                            />

                        </div>

                        {trendingMovies.length > 0 && (
                            <section className="trending">
                                <h2>Trending Movies</h2>
                                <ul>
                                    {trendingMovies.map((movie, index) => (
                                        <li key={`trending-${movie.$id || index}`}
                                            onClick={() => navigate(`/movie/${movie.movie_id}`)}
                                            className="cursor-pointer"
                                        >
                                            <p>
                                                {index + 1}
                                            </p>
                                            <img src={movie.poster_url} alt={movie.title} />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section className="all-movies">
                            <h2 className='mt-5 mb-3 p-2'>
                                {selectedGenre ?
                                    `${genres.find(g => g.id.toString() === selectedGenre)?.name || ''} Movies` :
                                    isUsingPreferredGenres && userData?.preferences?.preferredGenres?.length > 0 ?
                                        `Your Preferred ${getPreferredGenresDisplayName(userData, genres)} Movies` :
                                        searchTerm ? `Search results for "${searchTerm}"` : "All Movies"}
                            </h2>

                            {loading ? (
                                <Spinner />
                            ) : errorMessage ? (
                                <p className='text-red-500'>{errorMessage}</p>
                            ) : movieList.length === 0 ? (
                                <p className='text-white text-center mt-10'> No movies found. Try adjusting your filter</p>
                            ) : (

                                <ul>
                                    {movieList.map((movie) => (
                                        <Moviecard key={`movie-${movie.id}`} movie={movie} />
                                    ))}

                                </ul>
                            )}

                        </section>

                    </div>
                </div>
            </main>
        </AuthProvider>
    )
};

export default AppContent