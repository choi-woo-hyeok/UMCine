import type { Movie } from "../../types/movie";
import type { TmdbMovieListItem, TmdbMovieDetail } from "../../api/movies/models";
import { getTmdbPosterUrl, getTmdbBackdropUrl } from "./tmdb-image";

export function listItemToMovie(item: TmdbMovieListItem): Movie {
  return {
    id: item.id,
    title: item.title,
    originalTitle: item.original_title,
    releaseDate: item.release_date,
    posterPath: getTmdbPosterUrl(item.poster_path) ?? "",
    backdropPath: getTmdbBackdropUrl(item.backdrop_path) ?? "",
    genres: [],
    runtime: "",
    tagline: "",
    overview: item.overview,
    isBookmarked: false,
  };
}

export function detailToMovie(item: TmdbMovieDetail): Movie {
  const runtime = item.runtime;
  return {
    id: item.id,
    title: item.title,
    originalTitle: item.original_title,
    releaseDate: item.release_date,
    posterPath: getTmdbPosterUrl(item.poster_path) ?? "",
    backdropPath: getTmdbBackdropUrl(item.backdrop_path) ?? "",
    genres: item.genres.map((genre) => genre.name),
    runtime: runtime == null ? "상영 시간 정보가 없어요." : `${Math.floor(runtime / 60)}시간 ${runtime % 60}분`,
    tagline: item.tagline,
    overview: item.overview,
    isBookmarked: false,
  };
}
