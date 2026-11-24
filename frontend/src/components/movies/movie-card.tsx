import { Link } from "@tanstack/react-router";
import type { Movie } from "../../types/movie";
import { cn } from "../../utils/cn";

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (movieId: number) => void;
}

function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
  return (
    <article className="movie-card">
      <div className="relative">
        <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }}>
          {movie.posterPath ? (
            <img className="aspect-[2/3] w-full rounded-lg object-cover" src={movie.posterPath} alt={movie.title} />
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-gray-200 text-sm text-gray-500">이미지 없음</div>
          )}
        </Link>

        <button
          className={cn(
            "absolute right-2 top-2 rounded-full p-2 text-white",
            movie.isBookmarked ? "bg-blue-600" : "bg-black/60",
          )}
          onClick={() => onToggleBookmark(movie.id)}
          aria-pressed={movie.isBookmarked}
        >
          <img
            className="h-5 w-5"
            src={
              movie.isBookmarked
                ? "/icons/movie-icons/bookmark.svg"
                : "/icons/movie-icons/bookmark-outline.svg"
            }
            alt="북마크"
          />
        </button>
      </div>

      <h2 className="mt-2 truncate text-base font-semibold">{movie.title}</h2>

      <p className="mt-1 text-sm text-gray-400">{movie.releaseDate}</p>
    </article>
  );
}

export default MovieCard;
