import { useFavorite } from "../hooks/use-favorite";
import { useAuthStore } from "../stores/auth-store";
import { useNavigate } from "@tanstack/react-router";
interface BookmarkButtonProps {movieId:number;}
export function BookmarkButton({movieId}:BookmarkButtonProps) {
 const token=useAuthStore(s=>s.accessToken);const navigate=useNavigate();const favorite=useFavorite(movieId);
 return <button type="button" disabled={favorite.isPending} onClick={()=>{if(!token){void navigate({to:"/login"});return;}favorite.toggle();}}
 className={favorite.isFavorite?"rounded bg-blue-600 px-4 py-2 text-white":"rounded bg-gray-700 px-4 py-2 text-white"}>
 {favorite.isPending?"처리 중...":favorite.isFavorite?"북마크 해제":"북마크 추가"}</button>;
}
