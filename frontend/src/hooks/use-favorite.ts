import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, getFavoriteStatus, removeFavorite } from "../api/favorites";
import { useAuthStore } from "../stores/auth-store";
export function useFavorite(movieId:number) {
 const token=useAuthStore(s=>s.accessToken); const client=useQueryClient();
 const query=useQuery({queryKey:["favorites",movieId],queryFn:()=>getFavoriteStatus(movieId),enabled:!!token&&movieId>0});
 const mutation=useMutation({mutationFn:async (isFavorite:boolean)=>isFavorite?removeFavorite(movieId):addFavorite(movieId),onSuccess:async()=>{await client.invalidateQueries({queryKey:["favorites"]});}});
 return {isFavorite:query.data?.isFavorite??false, isLoading:query.isLoading,isPending:mutation.isPending,toggle:()=>mutation.mutate(query.data?.isFavorite??false)};
}
