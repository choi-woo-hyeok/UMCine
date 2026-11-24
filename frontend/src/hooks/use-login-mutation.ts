import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { login } from "../api/auth/login";
import { useAuthStore } from "../stores/auth-store";
export function useLoginMutation() {
 const client = useQueryClient(); const navigate = useNavigate(); const setToken = useAuthStore(s => s.setAccessToken);
 return useMutation({ mutationFn: login, onSuccess: async (response) => {
   if (!response.isSuccess) throw new Error(response.message);
   setToken(response.result.accessToken);
   await client.invalidateQueries({queryKey:["members","me"]});
   await navigate({to:"/"});
 }, });
}
