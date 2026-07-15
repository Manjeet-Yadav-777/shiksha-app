import type { ITenant } from "../tenants/store";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "super_admin" | "school_admin" | "teacher" | "student" | "parent";
  tenant?: ITenant;
  status: "active" | "suspended";
  createdAt: string;
  updatedAt: string;
}
