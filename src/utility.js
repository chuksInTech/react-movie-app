  // Generate display name for user's preferred genres
  export const getPreferredGenresDisplayName = (userData, genres) => {
    if (!userData?.preferences?.preferredGenres?.length) return "Preferred Genres";

    const preferredGenreNames = userData.preferences.preferredGenres
      .map(id => genres.find(g => g.id === parseInt(id))?.name)
      .filter(Boolean);

    if (preferredGenreNames.length === 1) {
      return preferredGenreNames[0];
    } else if (preferredGenreNames.length > 1) {
      return "Multiple Genres";
    } else {
      return 'preferred-genres';
    }
  };