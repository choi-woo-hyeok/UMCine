import { authApi } from "./auth-api";
import { apiClient } from "./api-client";
interface ApiResponse<T>{isSuccess:boolean;code:string;message:string;result:T;}
export interface Rating {ratingId:number;movieId:number;score:number;comment:string|null;createdAt:string;updatedAt:string;}
export const getMemberRatings = async (memberId:number)=>(await apiClient.get(`members/${memberId}/ratings`).json<Rating[]>());
export const createRating = (body:{movieId:number;score:number;comment?:string})=>authApi.post("ratings",{json:body}).json<ApiResponse<number>>();
export const updateRating = (ratingId:number,body:{score:number;comment?:string})=>authApi.patch(`ratings/${ratingId}`,{json:body}).json<ApiResponse<null>>();
export const deleteRating = (ratingId:number)=>authApi.delete(`ratings/${ratingId}`).json<ApiResponse<null>>();
