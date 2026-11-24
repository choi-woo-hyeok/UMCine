import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MovieGrid from "../../components/movies/movie-grid";
import { getMovies } from "../../api/movies/get-movies";
import { listItemToMovie } from "../../utils/movies/tmdb-to-movie";
import { useFavoritesList } from "../../hooks/use-favorites-list";

export function MovieListPage() {
  const [page, setPage] = useState(1);
  const { ids: bookmarkedMovieIds, toggle: toggleBookmark } = useFavoritesList();

  const moviesQuery = useQuery({
    queryKey: ["movies", "list", { page }],
    queryFn: () => getMovies({ page }),
  });

  const movies = (moviesQuery.data?.results ?? []).map((item) => ({
    ...listItemToMovie(item),
    isBookmarked: bookmarkedMovieIds.includes(item.id),
  }));
  const totalPages = Math.min(moviesQuery.data?.total_pages ?? 0, 500);

  const handlePageChange = (nextPage: number) => {
    if (nextPage >= 1 && nextPage <= totalPages && nextPage !== page) {
      setPage(nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">영화 목록</h1>
      {moviesQuery.isPending ? (
        <p role="status" className="py-20 text-center text-gray-500">
          영화 목록을 불러오는 중이에요.
        </p>
      ) : moviesQuery.isError ? (
        <div className="py-20 text-center">
          <p role="alert" className="text-red-600">
            영화 목록을 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={() => void moviesQuery.refetch()}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
          >
            다시 시도
          </button>
        </div>
      ) : movies.length === 0 ? (
        <p className="py-20 text-center text-gray-500">표시할 영화가 없어요.</p>
      ) : (
        <>
          <MovieGrid movies={movies} onToggleBookmark={toggleBookmark} />
          <nav
            aria-label="영화 목록 페이지"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="rounded border px-3 py-2 disabled:opacity-40"
            >
              이전
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNumber = start + index;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  aria-current={pageNumber === page ? "page" : undefined}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`rounded border px-3 py-2 ${pageNumber === page ? "bg-gray-900 text-white" : "bg-white"}`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="rounded border px-3 py-2 disabled:opacity-40"
            >
              다음
            </button>
          </nav>
        </>
      )}
      <p className="mt-10 text-center text-xs text-gray-500">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </main>
  );
}
