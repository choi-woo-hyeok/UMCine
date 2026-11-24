import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getFavorites } from "../../api/favorites";
export function MyFavorites() {
 const query=useQuery({queryKey:["favorites","list"],queryFn:getFavorites});
 return <section className="border-t pt-8"><h2 className="mb-4 text-xl font-bold">내 즐겨찾기</h2>
 {query.isPending ? <p>불러오는 중...</p> : query.isError ? <p>즐겨찾기를 불러오지 못했어요.</p>
 : query.data.length === 0 ? <p>즐겨찾기한 영화가 없어요.</p> : <ul className="space-y-3">{query.data.map(f=><li key={f.favoriteId}><Link to="/movies/$movieId" params={{movieId:String(f.movieId)}} className="text-blue-600 underline">영화 #{f.movieId} 상세 보기</Link></li>)}</ul>}</section>;
}
