import type { NavigateFunction } from "react-router-dom";

export function redirectFromLogin(
  res: any,
  navigate: NavigateFunction
) {
 const role = res.data.role
  if (role === "super_admin") {
    navigate("/super_admin/dashboard");
  } else if (role === "school_admin") {
    navigate("/school_admin/dashboard");
  } else if (role === "teacher") {
    navigate("/teacher/dashboard");
  }
}