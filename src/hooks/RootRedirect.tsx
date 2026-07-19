import { Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuthUser } from "./auth";

// Root ("/") landing. Auth resolve hone tak loader, phir logged-out ko login pe
// aur logged-in ko uske role ke dashboard pe bhej deta hai.
export function RootRedirect() {
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

  const dashboardByRole: Record<string, string> = {
    super_admin: "/super_admin/dashboard",
    school_admin: "/school_admin/dashboard",
  };

  return <Navigate to={dashboardByRole[user.role] ?? "/auth/login"} replace />;
}
