import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import { detailToMovie } from "../../utils/movies/tmdb-to-movie";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import { BookmarkButton } from "../../components/bookmark-button";
import { MovieRatings } from "../../components/movies/movie-ratings";

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const parsedMovieId = Number(movieId);
  const isValidId = Number.isInteger(parsedMovieId) && parsedMovieId > 0;
  const movieDetailQuery = useQuery({
    queryKey: ["movies", "detail", parsedMovieId],
    queryFn: () => getMovieDetail(parsedMovieId),
    enabled: isValidId,
    staleTime: 30 * 1000,
  });
  const movie = movieDetailQuery.data ? detailToMovie(movieDetailQuery.data) : null;

  if (isValidId && movieDetailQuery.isPending) {
    return <main role="status" className="mx-auto max-w-6xl px-6 py-20 text-center">영화 정보를 불러오는 중이에요.</main>;
  }

  if (!movie) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">{!isValidId ? "올바르지 않은 영화 번호예요." : movieDetailQuery.isError ? getMovieDetailErrorMessage(movieDetailQuery.error) : "영화를 찾을 수 없어요."}</h1>
        {isValidId && movieDetailQuery.isError && (
          <button type="button" onClick={() => void movieDetailQuery.refetch()} className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">다시 시도</button>
        )}

        <Link to="/" className="mt-6 inline-block text-blue-600">
          영화 목록으로 돌아가기
        </Link>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-white">
      {/* 배경 이미지 영역 */}
      <section className="relative h-80 overflow-hidden">
        {movie.backdropPath ? (
          <img src={movie.backdropPath} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-700" aria-label="이미지 없음" />
        )}

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 mx-auto flex max-w-6xl items-end px-6 pb-10">
          <div className="text-white">
            <Link to="/" className="mb-4 inline-block text-sm text-white/80">
              ← 영화 목록
            </Link>

            <h1 className="text-3xl font-bold">{movie.title}</h1>

            <p className="mt-2 text-sm text-white/80">{movie.originalTitle}</p>
          </div>
        </div>
      </section>

      {/* 영화 정보 영역 */}
      <section className="mx-auto flex max-w-6xl gap-10 px-6 py-10">
        {movie.posterPath ? (
          <img src={movie.posterPath} alt={`${movie.title} 포스터`} className="w-52 shrink-0 self-start rounded-lg object-cover" />
        ) : (
          <div className="flex h-72 w-52 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-sm text-gray-500">이미지 없음</div>
        )}

        <div className="flex-1">
          <h2 className="text-2xl font-bold">{movie.title}</h2>

          <p className="mt-2 text-gray-500">{movie.originalTitle}</p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-600">
            <span>{movie.releaseDate}</span>
            <span>·</span>
            <span>{movie.genres.join(" · ")}</span>
            <span>·</span>
            <span>{movie.runtime}</span>
          </div>

          <h2 className="mt-8 text-lg font-bold">{movie.tagline}</h2>

          <p className="mt-3 leading-7 text-gray-600">{movie.overview}</p>

          <div className="mt-6"><BookmarkButton movieId={movie.id} /></div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-6 pb-8"><MovieRatings movieId={movie.id}/></div>
      <p className="mx-auto max-w-6xl px-6 pb-8 text-center text-xs text-gray-500">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
    </main>
  );
}
