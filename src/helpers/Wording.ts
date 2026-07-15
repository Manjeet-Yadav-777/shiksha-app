export const capitalize = (str: string | undefined) => {
  if (typeof str === "undefined") {
    return;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export type IRole =
  | "super_admin"
  | "school_admin"
  | "teacher"
  | "student"
  | "parent";

export function getRole(role: IRole) {
  switch (role) {
    case "school_admin":
      return "Super Admin";
    case "parent":
      return "Parent";
    case "student":
      return "Student";
    case "teacher":
      return "Teacher";
    case "super_admin":
      return "Super Admin";
    default:
      return "Invalid Role"
  }
}
