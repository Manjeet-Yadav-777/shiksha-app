import useSWR from "swr";
import { xhr } from "../libs/XHR/xhr";

export async function getUser() {
  const res = await xhr.get("/auth/me");
  return res.data;
}

export function useAuthUser() {
  const { data, error, isLoading, mutate } = useSWR(
    "/auth/me",
    getUser
  );
  console.log(data)

  return {
    user: data,
    error,
    isLoading,
    mutate,
  };
}