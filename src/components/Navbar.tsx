import { Inline } from "../libs/basic/Layout";
import { NavLink } from "../utils/Link";
import {
  IconBooks,
  IconLogout,
  IconSchool,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { useAuthUser } from "../hooks/auth";
import { DropdownMenu } from "../libs/basic/DropDown";
import { useNavigate } from "react-router-dom";
import { xhr } from "../libs/XHR/xhr";

export function Navbar() {
  const { user } = useAuthUser();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const settingOptions = {
    school_admin: [
      {
        label: (
          <Inline align={"center"} gap={"xs"}>
            <IconUser size={16} /> Profile
          </Inline>
        ),
        onClick: () => navigate("/admin/profile"),
      },
      {
        label: (
          <Inline align={"center"} gap={"xs"}>
            <IconSchool size={16} /> Classes
          </Inline>
        ),
        onClick: () => navigate("/admin/classes"),
      },
      {
        label: (
          <Inline align={"center"} gap={"xs"}>
            <IconBooks size={16} /> Subjects
          </Inline>
        ),
        onClick: () => navigate("/admin/subjects"),
      },
      {
        label: (
          <Inline c={"red"} align={"center"} gap={"xs"}>
            <IconLogout size={16} /> Logout
          </Inline>
        ),
        onClick: async () => {
          await xhr.post("/auth/logout");
          navigate("/auth/login");
        },
      },
    ],
    super_admin: [
      {
        label: (
          <Inline align={"center"} gap={"xs"}>
            <IconUser size={16} /> Profile
          </Inline>
        ),
        onClick: () => navigate("/admin/profile"),
      },
    ],
    teacher: [
      {
        label: (
          <Inline align={"center"} gap={"xs"}>
            <IconUser size={16} /> Profile
          </Inline>
        ),
        onClick: () => navigate("/admin/profile"),
      },
    ],
    student: [
      {
        label: (
          <Inline align={"center"} gap={"xs"}>
            <IconUser size={16} /> Profile
          </Inline>
        ),
        onClick: () => navigate("/admin/profile"),
      },
    ],
    parent: [
      {
        label: (
          <Inline align={"center"} gap={"xs"}>
            <IconUser size={16} /> Profile
          </Inline>
        ),
        onClick: () => navigate("/admin/profile"),
      },
    ],
  };
  return (
    <Inline
      bg={"#000"}
      h={"100%"}
      align={"center"}
      px={"xl"}
      justify={"space-between"}
    >
      <Inline gap={"xl"} align={"center"}>
        <Inline
          bg={"#fff"}
          align={"center"}
          justify={"center"}
          bdrs={"xl"}
          fw={"bolder"}
          c={"#000"}
          h={"30px"}
          w={"30px"}
        >
          <NavLink to={`/${user.role}/dashboard`} color={"#000"}>
            MJ
          </NavLink>
        </Inline>

        <Inline gap={"lg"} fw={"bolder"}>
          {navigation[user?.role].left.map((l) => (
            <NavLink to={l.to}>{l.label}</NavLink>
          ))}
        </Inline>
      </Inline>

      <Inline align={"center"} gap={"xl"}>
        {navigation[user?.role].right?.map((r) => (
          <NavLink to={r.to}>{r.label}</NavLink>
        ))}
        <DropdownMenu
          width={150}
          trigger="hover"
          items={settingOptions[user.role].map((s) => s)}
        >
          <IconSettings cursor={"pointer"} size={20} color="white" />
        </DropdownMenu>
      </Inline>
    </Inline>
  );
}

// navigation.ts
export const navigation = {
  super_admin: {
    left: [
      { label: "Tenants", to: "/super-admin/tenants" },
      { label: "Payments", to: "/super-admin/payments" },
    ],
    right: [],
  },

  school_admin: {
    left: [
      { label: "Dashboard", to: "/school_admin/dashboard" },
      { label: "Students", to: "/admin/students" },
      { label: "Teachers", to: "/admin/teachers" },
    ],

    right: [
      { label: "Fees", to: "/admin/fees" },
      { label: "Reports", to: "/admin/reports" },
    ],
  },

  teacher: {
    left: [{ label: "Dashboard", to: "/principal" }],
    right: [
      { label: "Teachers", to: "/principal/teachers" },
      { label: "Reports", to: "/principal/reports" },
    ],
  },

  student: {
    left: [{ label: "Dashboard", to: "/principal" }],
    right: [
      { label: "Teachers", to: "/principal/teachers" },
      { label: "Reports", to: "/principal/reports" },
    ],
  },

  parent: {
    left: [{ label: "Dashboard", to: "/principal" }],
    right: [
      { label: "Teachers", to: "/principal/teachers" },
      { label: "Reports", to: "/principal/reports" },
    ],
  },
};
