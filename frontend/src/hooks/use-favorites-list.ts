import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { addFavorite, getFavorites, removeFavorite } from "../api/favorites";
import { useAuthStore } from "../stores/auth-store";
export function useFavoritesList() {
 const token = useAuthStore(s=>s.accessToken); const navigate=useNavigate();const client=useQueryClient();
 const query=useQuery({queryKey:["favorites","list"],queryFn:getFavorites,enabled:!!token});
 const ids = query.data?.map(f=>f.movieId)??[];
 const mutation=useMutation({mutationFn:async(movieId:number)=>ids.includes(movieId)?removeFavorite(movieId):addFavorite(movieId),onSuccess:async()=>{await client.invalidateQueries({queryKey:["favorites"]});}});
 function toggle(movieId:number){if(!token){void navigate({to:"/login"});return;}mutation.mutate(movieId);}
 return {ids,toggle};
}
