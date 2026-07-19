import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuthUser } from "./auth";
import type { IUser } from "../components/Auth/store";

type Props = {
  allowedRoles?: Array<IUser["role"]>;
};

export function ProtectedRoutes({ allowedRoles }: Props) {
  const { user, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  // Agar cached user hai to content dikhate raho, chahe background revalidate
  // transiently fail ho (Render cold start, timeout, network blip). Pehle kisi bhi
  // error pe turant login bhej dete the — isi se kaam ke beech unauthorized aa jaata
  // tha aur refresh karne pe (server warm) theek ho jaata tha.
  if (user) {
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/auth/login" replace />;
    }
    return <Outlet />;
  }

  // Koi cached user nahi (pehli load pe genuinely unauthenticated) — login pe bhejo.
  return <Navigate to="/auth/login" replace />;
}