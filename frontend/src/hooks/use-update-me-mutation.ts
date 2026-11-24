import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMe } from "../api/members/update-me";
import type { MemberInfo } from "../api/members/me";
export function useUpdateMeMutation() {
 const client = useQueryClient();
 return useMutation({ mutationFn: updateMe, onSuccess: (response) => {
   client.setQueryData<MemberInfo>(["members", "me"], response.result);
 } });
}
