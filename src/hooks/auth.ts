import useSWR from "swr";
import { api } from "../libs/XHR/xhr";
import type { IUser } from "../components/Auth/store";

export async function getUser() {
  const res = await api.get<IUser>("/auth/me");
  return res;
}

export function useAuthUser() {
  const { data, error, isLoading, mutate } = useSWR(
    "/auth/me",
    getUser
  );
  return {
    user: data,
    error,
    isLoading,
    mutate,
  };
}