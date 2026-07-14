import type { NavigateFunction } from "react-router-dom";

export function redirectFromLogin(
  res: any,
  navigate: NavigateFunction
) {
  if (res.role === "super_admin") {
    navigate("/super-admin");
  } else if (res.role === "school_admin") {
    navigate("/school-admin");
  }
}