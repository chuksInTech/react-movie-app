import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';
import { getPreferredGenresDisplayName } from "../utility.js";

const GenreFilter = ({ genres, selectedGenre, isUsingPreferredGenres, onGenreChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    console.log("GenreFilter props:", {
      selectedGenre,
      isUsingPreferredGenres,
      hasPreferences: !!(userData?.preferences?.preferredGenres?.length)
    });
  }, [selectedGenre, isUsingPreferredGenres, userData]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonText = () => {
    if (isUsingPreferredGenres) {
      return getPreferredGenresDisplayName(userData, genres);
    } else if (selectedGenre) {
      return genres.find(g => g.id.toString() === selectedGenre.toString())?.name || "Select Genre";
    } else {
      return "All genres";
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${isUsingPreferredGenres ? "bg-[rgba(206,206,251,0.3)]" : "bg-[rgba(206,206,251,0.1)]"} focus:outline-none focus:ring-2 focus:ring-[rgba(206,206,251,0.5)] text-white px-4 py-2 rounded-lg`}
        aria-label={`Current genre: ${buttonText()}`}
      >
        {buttonText()}
        <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
          <button
            onClick={() => {
              onGenreChange("");
              setIsOpen(false);
            }}
            className="block w-full px-4 py-2 text-left text-white hover:bg-[rgba(206,206,251,0.5)] rounded-t-lg"
          >
            All genres
          </button>

          {currentUser && userData?.preferences?.preferredGenres?.length > 0 && (
            <button
              onClick={() => {
                // Set to preferred genres mode
                onGenreChange("preferred");
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-white hover:bg-[rgba(206,206,251,0.5)]"
            >
              My Preferred Genres
            </button>
          )}

          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => {
                onGenreChange(genre.id.toString());
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-white hover:bg-[rgba(206,206,251,0.5)]"
            >
              {genre.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreFilter;