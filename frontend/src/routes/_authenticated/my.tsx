import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "../../pages/auth/profile-page";
export const Route = createFileRoute("/_authenticated/my")({component:ProfilePage});
