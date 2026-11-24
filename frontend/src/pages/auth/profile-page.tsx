import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getMe } from "../../api/members/me";
import { useUpdateMeMutation } from "../../hooks/use-update-me-mutation";
import { useAuthStore } from "../../stores/auth-store";
import { MyFavorites } from "../../components/auth/my-favorites";
export function ProfilePage() {
 const token = useAuthStore(s=>s.accessToken);
 const meQuery = useQuery({ queryKey:["members","me"], queryFn:getMe, enabled:!!token, staleTime:5*60*1000, retry:false });
 const updateMutation = useUpdateMeMutation(); const [nickname,setNickname]=useState("");
 useEffect(()=>{if(meQuery.data) setNickname(meQuery.data.nickname);},[meQuery.data]);
 const valid=nickname.trim().length>=2 && nickname.trim().length<=12;
 function handleSubmit(e:FormEvent<HTMLFormElement>){ e.preventDefault();if(valid && !updateMutation.isPending) updateMutation.mutate({nickname:nickname.trim()}); }
 return <main className="mx-auto max-w-5xl px-6 py-12"><h1 className="mb-8 text-3xl font-bold">내 정보</h1>
 {!token ? <p>로그인이 필요해요. <Link to="/login" className="text-blue-600 underline">로그인</Link></p>
 : meQuery.isPending ? <p>내 정보를 불러오는 중이에요.</p>
 : meQuery.isError ? <p role="alert">정보를 불러오지 못했어요. <button className="text-blue-600 underline" onClick={()=>void meQuery.refetch()}>다시 시도</button></p>
 : <><section className="mb-8 rounded-lg border p-6"><h2 className="mb-4 text-xl font-bold">기본 정보</h2>
 <p>이메일: {meQuery.data?.email}</p><p>닉네임: {meQuery.data?.nickname}</p><p>가입일: {meQuery.data?.createdAt ? new Date(meQuery.data.createdAt).toLocaleDateString("ko-KR") : "-"}</p></section>
 <form onSubmit={handleSubmit} className="mb-10 max-w-lg space-y-4"><label className="block font-semibold">닉네임 수정<input className="mt-2 w-full rounded-md border p-3" value={nickname} onChange={e=>setNickname(e.target.value)} minLength={2} maxLength={12}/></label>
 <button type="submit" disabled={!valid || updateMutation.isPending} className="rounded-md bg-blue-600 px-5 py-3 text-white disabled:opacity-40">{updateMutation.isPending?"저장 중...":"저장"}</button>
 {updateMutation.isSuccess && <p role="status" className="text-green-700">내 정보 수정에 성공했어요.</p>}
 {updateMutation.isError && <p role="alert" className="text-red-700">수정에 실패했어요. 서버 상태를 확인해 주세요.</p>}</form>
 <MyFavorites />
 </>}
 </main>;
}
