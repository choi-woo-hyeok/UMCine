import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useLoginMutation } from "../../hooks/use-login-mutation";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function LoginPage() {
 const [email,setEmail] = useState(""); const [password,setPassword] = useState("");
 const loginMutation = useLoginMutation(); const valid = EMAIL_REGEX.test(email.trim()) && password.length > 0;
 function handleSubmit(e:FormEvent<HTMLFormElement>) { e.preventDefault(); if(valid && !loginMutation.isPending) loginMutation.mutate({email:email.trim(),password}); }
 return <main className="mx-auto max-w-md px-6 py-16"><h1 className="mb-7 text-3xl font-bold">로그인</h1>
 <form onSubmit={handleSubmit} className="space-y-5">
 <label className="block text-sm font-semibold">이메일<input className="mt-2 w-full rounded-md border p-3" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
 <label className="block text-sm font-semibold">비밀번호<input className="mt-2 w-full rounded-md border p-3" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
 <button type="submit" disabled={!valid || loginMutation.isPending} className="w-full rounded-md bg-blue-600 py-3 font-semibold text-white disabled:opacity-50">{loginMutation.isPending ? "로그인 중..." : "로그인"}</button>
 {loginMutation.isError && <p role="alert" className="text-sm text-red-600">로그인에 실패했어요. 이메일과 비밀번호 또는 서버 상태를 확인해 주세요.</p>}
 <p className="text-sm">계정이 없나요? <Link to="/signup" className="text-blue-600 underline">회원가입</Link></p>
 </form></main>;
}
