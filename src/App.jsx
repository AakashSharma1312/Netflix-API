import React, { useState, useEffect } from "react";
import "./App.css";

// 👉 Apna TMDB API key yahan daalo (https://www.themoviedb.org/settings/api se free milta hai)
const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

// Featured movies list
const MOVIE_TITLES = ["Ramayana", "Dhurandhar", "KGF", "RRR", "Animal"];

function MovieCard({ movie, onSelect }) {
  if (!movie) return null;
  const poster = movie.poster_path
    ? `${IMG_BASE}${movie.poster_path}`
    : "https://via.placeholder.com/300x450/1a1a1a/e50914?text=No+Poster";

  return (
    <div className="movie-card" onClick={() => onSelect(movie)}>
      <img src={poster} alt={movie.title} loading="lazy" />
      <div className="movie-card-overlay">
        <h3>{movie.title}</h3>
        <div className="movie-meta">
          <span className="rating">⭐ {movie.vote_average?.toFixed(1) ?? "N/A"}</span>
          <span className="year">
            {movie.release_date ? movie.release_date.slice(0, 4) : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function MovieModal({ movie, onClose }) {
  if (!movie) return null;
  const backdrop = movie.backdrop_path
    ? `${BACKDROP_BASE}${movie.backdrop_path}`
    : `${IMG_BASE}${movie.poster_path}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div
          className="modal-backdrop"
          style={{ backgroundImage: `url(${backdrop})` }}
        >
          <div className="modal-backdrop-fade" />
          <h2>{movie.title}</h2>
        </div>
        <div className="modal-body">
          <div className="modal-info">
            <span className="modal-rating">⭐ {movie.vote_average?.toFixed(1) ?? "N/A"}</span>
            <span>{movie.release_date}</span>
            <span>{movie.original_language?.toUpperCase()}</span>
          </div>
          <p className="modal-overview">
            {movie.overview || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [heroMovie, setHeroMovie] = useState(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const results = await Promise.all(
          MOVIE_TITLES.map(async (title) => {
            const res = await fetch(
              `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
                title
              )}&language=en-US`
            );
            const data = await res.json();
            return data.results && data.results.length > 0
              ? data.results[0]
              : { title, overview: "Details not found on TMDB." };
          })
        );
        setMovies(results);
        setHeroMovie(results[0]);
        setError(null);
      } catch (err) {
        setError("Movies load nahi ho paayi. API key check karo.");
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <h1 className="logo">MovieFlix</h1>
        <nav>
          <span className="active">Home</span>
          <span>TV Shows</span>
          <span>Movies</span>
          <span>My List</span>
        </nav>
      </header>

      {/* Hero Section */}
      {heroMovie && (
        <section
          className="hero"
          style={{
            backgroundImage: heroMovie.backdrop_path
              ? `url(${BACKDROP_BASE}${heroMovie.backdrop_path})`
              : "linear-gradient(135deg, #1a1a1a, #000)",
          }}
        >
          <div className="hero-fade" />
          <div className="hero-content">
            <h2>{heroMovie.title}</h2>
            <p>{heroMovie.overview?.slice(0, 160)}...</p>
            <div className="hero-buttons">
              <button className="btn-play">▶ Play</button>
              <button
                className="btn-info"
                onClick={() => setSelectedMovie(heroMovie)}
              >
                ⓘ More Info
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Movies Row */}
      <main className="content">
        <h2 className="row-title">Trending Now</h2>

        {loading && <p className="status-text">Loading movies...</p>}
        {error && <p className="status-text error">{error}</p>}

        <div className="movie-row">
          {movies.map((movie, idx) => (
            <MovieCard key={idx} movie={movie} onSelect={setSelectedMovie} />
          ))}
        </div>
      </main>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      <footer className="footer">
        <p>Built with React + TMDB API</p>
      </footer>
    </div>
  );
}