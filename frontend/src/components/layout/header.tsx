import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "../../api/members/me";
import { useAuthStore } from "../../stores/auth-store";
export function Header() {
 const token=useAuthStore(s=>s.accessToken); const setToken=useAuthStore(s=>s.setAccessToken); const client=useQueryClient();
 const meQuery=useQuery({queryKey:["members","me"],queryFn:getMe,enabled:!!token,staleTime:5*60*1000,retry:false});
 const logout=()=>{setToken(null);client.clear();};
 return <header className="border-b border-gray-200 bg-white"><div className="mx-auto flex h-16 max-w-6xl items-center px-6">
 <Link to="/" className="text-xl font-bold text-gray-900 no-underline">▣ UMCine</Link>
 <nav className="ml-10 flex items-center gap-8"><Link to="/" className="text-sm text-gray-700">영화</Link>
 <Link to="/search" search={{}} className="text-sm text-gray-700">검색</Link>
 <Link to="/profile" className="text-sm text-gray-700">내 정보</Link></nav>
 <div className="ml-auto flex items-center gap-3"><Link to="/search" search={{}} className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200">⌕</Link>
 {!token ? <Link to="/login" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white">로그인</Link>
 : meQuery.isLoading ? <span className="h-9 w-24 animate-pulse rounded-lg bg-gray-200"/>
 : <><Link to="/profile" className="text-sm font-semibold text-blue-700">{meQuery.data?.nickname || "마이페이지"}</Link><button onClick={logout} className="rounded border px-3 py-2 text-sm">로그아웃</button></>}
 </div></div></header>;
}
