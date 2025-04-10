import React, {useEffect, useState} from 'react';
import { useParams } from "react-router-dom";
import Spinner from "./Spinner.jsx";

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cast, setCast] = useState([]);
    const [crew, setCrew] = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'https://api.themoviedb.org/3';
    const API_OPTIONS = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
      },
    };

    useEffect(() => {
        const fetchMovieDetails = async () => {

            if (!id) {
                setError("No movie ID provided");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {

                const movieUrl = `${API_BASE_URL}/movie/${id}`;
                console.log("Fetching from URL:", movieUrl);
                // Fetch basic movie details
                const movieResponse = await fetch(
                    `${API_BASE_URL}/movie/${id}`,
                    API_OPTIONS
                );
                
                if (!movieResponse.ok) {
                    throw new Error(`Failed to fetch movie: ${movieResponse.status}`);
                }
                
                const movieData = await movieResponse.json();
                setMovie(movieData);

                // Fetch credits separately
                const creditsResponse = await fetch(
                    `${API_BASE_URL}/movie/${id}/credits`,
                    API_OPTIONS
                );
                
                if (!creditsResponse.ok) {
                    throw new Error(`Failed to fetch credits: ${creditsResponse.status}`);
                }
                
                const creditsData = await creditsResponse.json();
                setCast(creditsData.cast?.slice(0, 20) || []);
                setCrew(creditsData.crew || []);

                // Fetch trailer
                const videoResponse = await fetch(
                    `${API_BASE_URL}/movie/${id}/videos`,
                    API_OPTIONS
                );
                
                if (videoResponse.ok) {
                    const videoData = await videoResponse.json();
                    const trailer = videoData.results?.find(
                        (video) => video.type === "Trailer" && video.site === "YouTube"
                    );
                    setTrailer(trailer || null);
                }

                // Fetch similar movies
                const similarResponse = await fetch(
                    `${API_BASE_URL}/movie/${id}/similar`,
                    API_OPTIONS
                );
                
                if (similarResponse.ok) {
                    const similarData = await similarResponse.json();
                    setSimilarMovies(similarData.results?.slice(0, 12) || []);
                }
            } catch (error) {
                console.error("Error fetching movie details", error);
                setError("Failed to load movie details");
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    if (loading) return <Spinner />;
    if (error) return <div className="text-white p-8">{error}</div>;
    if (!movie) return <div className="text-white p-8">Movie not found</div>;

    // Find director separately using the crew state
    const director = crew.find(person => person.job === 'Director')?.name || 'N/A';

    return (
        <div className='text-white p-8 mx-w-6x1 mx-auto'>
            <div className='flex flex-col md:flex-row gap-8'>
                {/* movie poster */}
                <div className='w-full md:w-1/3'>
                    <img 
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className='w-full rounded-lg shadow-lg'
                    />
                </div>

                {/* movie info */}
                <div className='w-full md:w-2/3'>
                    <h1 className='text-4xl font-bold mb-4'>{movie.title}</h1>
                    <p className="text-lg mb-4">{movie.overview}</p>

                    {/* movie details */}
                    <div className='grid grid-cols-2 gap-4 mb-6'>
                        <div>
                            <h3 className='font-bold'>Release Date</h3>
                            <p>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                            <h3 className='font-bold'>Rating</h3>
                            <p>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} / 10</p>
                        </div>
                        <div>
                            <h3 className='font-bold'>Director</h3>
                            <p>{director}</p>
                        </div>
                        <div>
                            <h3 className='font-bold'>Genres</h3>
                            <p>{movie.genres?.map(genre => genre.name).join(', ') || 'N/A'}</p>
                        </div>
                    </div>

                    {/* trailer */}
                    {trailer && (
                        <div className='mb-8'>
                            <h2 className='text-2xl font-bold mb-4'>Trailer</h2>
                            <div className='aspect-video'>
                                <iframe
                                    className='w-full h-full rounded-lg' 
                                    src={`https://www.youtube.com/embed/${trailer.key}`}
                                    title={`${movie.title} trailer`}
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* cast */}
            {cast.length > 0 && (
                <div className='mt-8'>
                    <h2 className='text-2xl font-bold mb-4'>Top Cast</h2>
                    <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                        {cast.map((person) => (
                            <div key={person.id} className='text-center'>
                                <img 
                                    src={
                                        person.profile_path
                                        ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                                        : '/placeholder-avatar.png'
                                    } 
                                    alt={person.name}
                                    className='w-full rounded-lg mb-2'
                                />
                                <p className="font-bold">{person.name}</p>
                                <p className="text-sm text-gray-400">{person.character}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* similar movies */}
            {similarMovies.length > 0 && (
                <div className='mt-8'>
                    <h2 className="text-2xl font-bold mb-4">Similar Movies</h2>
                    <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
                        {similarMovies.map((movie) => (
                            <div
                                key={movie.id}
                                className='cursor-pointer'
                                onClick={() => window.location.href=`/movie/${movie.id}`}
                            >
                                <img
                                    src={
                                        movie.poster_path 
                                        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` 
                                        : '/placeholder-poster.png'
                                    }
                                    alt={movie.title}
                                    className='w-full rounded-lg mb-2'
                                />
                                <p className='font-bold text-sm'>{movie.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetails;