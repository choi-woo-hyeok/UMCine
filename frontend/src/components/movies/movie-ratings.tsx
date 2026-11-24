import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { getMe } from "../../api/members/me";
import { createRating, deleteRating, getMemberRatings, updateRating } from "../../api/ratings";
import { useAuthStore } from "../../stores/auth-store";
export function MovieRatings({movieId}:{movieId:number}) {
 const token=useAuthStore(s=>s.accessToken);const navigate=useNavigate();const qc=useQueryClient();
 const me=useQuery({queryKey:["members","me"],queryFn:getMe,enabled:!!token,retry:false});
 const ratings=useQuery({queryKey:["ratings",me.data?.memberId],queryFn:()=>getMemberRatings(me.data!.memberId),enabled:!!me.data?.memberId});
 const mine=ratings.data?.find(r=>r.movieId===movieId);
 const [score,setScore]=useState(5);const [comment,setComment]=useState("");
 const mutation=useMutation({mutationFn:async(action:"save"|"delete")=>{
 if(action==="delete"&&mine)return deleteRating(mine.ratingId);
 if(mine)return updateRating(mine.ratingId,{score,comment});
 return createRating({movieId,score,comment});
 },onSuccess:async()=>{await qc.invalidateQueries({queryKey:["ratings"]});}});
 function submit(e:FormEvent){e.preventDefault(); if(!token){void navigate({to:"/login"});return;}mutation.mutate("save");}
 return <section className="mt-8 rounded-lg border p-6"><h2 className="mb-3 text-xl font-bold">내 평점</h2>
 {!token?<button onClick={()=>void navigate({to:"/login"})} className="text-blue-600 underline">로그인하고 평점 남기기</button>
 : <><p className="mb-3">{mine?`현재 저장된 평점: ${mine.score}점` : "이 영화에 아직 평점을 남기지 않았어요."}</p>
 <form onSubmit={submit} className="space-y-3"><label className="block">별점 <select value={score} onChange={e=>setScore(Number(e.target.value))} className="rounded border p-2">{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}점</option>)}</select></label>
 <textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength={500} placeholder="후기 (선택)" className="block w-full rounded border p-3" />
 <button disabled={mutation.isPending} className="rounded bg-blue-600 px-4 py-2 text-white">{mutation.isPending?"처리 중...":mine?"평점 수정":"평점 등록"}</button>
 {mine&&<button type="button" disabled={mutation.isPending} onClick={()=>mutation.mutate("delete")} className="ml-2 rounded border px-4 py-2">평점 삭제</button>}</form>
 {ratings.isError&&<p role="alert" className="text-red-600">평점 조회에 실패했어요.</p>}
 {mutation.isError&&<p role="alert" className="text-red-600">요청에 실패했어요. 서버 응답을 확인해 주세요.</p>}</>}
 </section>;
}
