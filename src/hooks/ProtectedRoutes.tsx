import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuthUser } from "./auth";
import type { IUser } from "../components/Auth/store";

type Props = {
  allowedRoles?: Array<IUser["role"]>;
};

export function ProtectedRoutes({ allowedRoles }: Props) {
  const { user, error, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (error || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}