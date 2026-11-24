import { authApi } from "./auth-api";
interface ApiResponse<T> { isSuccess:boolean;code:string;message:string;result:T; }
export interface Favorite {favoriteId:number;movieId:number;createdAt:string;}
export const getFavorites = async () => (await authApi.get("favorites").json<ApiResponse<Favorite[]>>()).result;
export const getFavoriteStatus = async (movieId:number) => (await authApi.get(`favorites/${movieId}`).json<ApiResponse<{isFavorite:boolean}>>()).result;
export const addFavorite = (movieId:number) => authApi.post("favorites",{json:{movieId}}).json<ApiResponse<Favorite>>();
export const removeFavorite = (movieId:number) => authApi.delete(`favorites/${movieId}`).json<ApiResponse<null>>();
