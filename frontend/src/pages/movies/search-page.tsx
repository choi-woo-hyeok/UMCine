import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type SubmitEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "../../api/movies/search-movies";
import { listItemToMovie } from "../../utils/movies/tmdb-to-movie";
import { useFavoritesList } from "../../hooks/use-favorites-list";
import { cn } from "../../utils/cn";

export function SearchPage() {
  const { query } = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });
  const [searchText, setSearchText] = useState(query ?? "");
  const { ids: bookmarkedMovieIds, toggle: toggleBookmark } = useFavoritesList();

  useEffect(() => {
    setSearchText(query ?? "");
  }, [query]);

  const normalizedQuery = query?.trim() ?? "";

  const searchQuery = useQuery({
    queryKey: ["movies", "search", { query: normalizedQuery }],
    queryFn: () => searchMovies({ query: normalizedQuery }),
    enabled: normalizedQuery.length > 0,
  });
  const searchResults = (searchQuery.data?.results ?? []).map(listItemToMovie);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = searchText.trim();

    navigate({
      search: nextQuery ? { query: nextQuery } : {},
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      {!normalizedQuery ? (
        <div className="mx-auto mt-32 max-w-2xl text-center">
          <h1 className="mb-8 text-2xl font-bold">어떤 영화를 찾고 있나요?</h1>

          <form
            onSubmit={handleSubmit}
            className="flex overflow-hidden rounded-lg border border-gray-300 bg-white"
          >
            <input
              aria-label="검색어"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="영화 제목을 검색해 주세요."
              className="flex-1 px-4 py-3 outline-none"
            />

            <button
              type="submit"
              className="m-1 rounded-md bg-black px-5 text-sm font-semibold text-white"
            >
              검색
            </button>
          </form>
        </div>
      ) : (
        <>
          <h1 className="mb-6 text-3xl font-bold">영화 검색</h1>

          <form
            onSubmit={handleSubmit}
            className="mb-8 flex overflow-hidden rounded-lg border border-gray-300 bg-white"
          >
            <input
              aria-label="검색어"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="flex-1 px-4 py-3 outline-none"
            />

            <button
              type="submit"
              className="m-1 rounded-md bg-black px-5 text-sm font-semibold text-white"
            >
              검색
            </button>
          </form>

          <h2 className="text-xl font-bold">‘{query}’ 검색 결과</h2>

          <p className="mb-8 mt-2 text-sm text-gray-500">
            영화 {searchResults.length}편
          </p>

          {searchQuery.isLoading ? (
            <p role="status" className="py-20 text-center text-gray-500">검색 결과를 불러오는 중이에요.</p>
          ) : searchQuery.isError ? (
            <div className="py-20 text-center">
              <p role="alert" className="text-red-600">검색 결과를 불러오지 못했어요.</p>
              <button type="button" onClick={() => void searchQuery.refetch()} className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">다시 시도</button>
            </div>
          ) : searchResults.length === 0 ? (
            <p className="py-20 text-center text-gray-500">
              검색 결과가 없어요.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
              {searchResults.map((movie) => {
                const isBookmarked = bookmarkedMovieIds.includes(movie.id);

                return (
                  <li
                    key={movie.id}
                    className="relative flex gap-5 border-b border-gray-200 pb-6"
                  >
                    {movie.posterPath ? (
                      <img src={movie.posterPath} alt={`${movie.title} 포스터`} className="h-40 w-28 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-40 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-500">이미지 없음</div>
                    )}

                    <div className="min-w-0 pr-12">
                      <h3 className="font-bold">{movie.title}</h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {movie.originalTitle}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {movie.releaseDate}
                      </p>

                      <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                        {movie.overview}
                      </p>

                      <Link
                        to="/movies/$movieId"
                        params={{ movieId: String(movie.id) }}
                        className="mt-3 inline-block text-sm font-semibold text-blue-600"
                      >
                        상세 보기 →
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(movie.id)}
                      aria-pressed={isBookmarked}
                      className={cn(
                        "absolute right-2 top-2 rounded-full p-2",
                        isBookmarked ? "bg-blue-600" : "bg-black/60",
                      )}
                    >
                      <img
                        className="h-5 w-5"
                        src={
                          isBookmarked
                            ? "/icons/movie-icons/bookmark.svg"
                            : "/icons/movie-icons/bookmark-outline.svg"
                        }
                        alt="북마크"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
      <p className="mt-10 text-center text-xs text-gray-500">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
    </main>
  );
}
