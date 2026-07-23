// import axios, {type AxiosInstance, type AxiosStatic } from "axios";
// import { createContext, useContext } from "react";

// export interface IListResponse<Item> {
//   data: Array<Item>;
//   meta: {
//     from: number;
//     to: number;
//     total: number;
//     current_page: number;
//     last_page: number;
//     per_page: number;
//   };
// }

// /**
//  * Cursor paginated list with next/prev pages, without total
//  * Faster: Reduces the total counting and usage database cursor
//  * Usage: Used in listing pages where total counting is not helpful
//  */
// export interface ICursorListResponse<Item> {
//   data: Array<Item>;
//   meta: {
//     next_cursor: string | null;
//     prev_cursor: string | null;
//     per_page: number;
//   };
// }

// /**
//  * Simple listing with a offset and limit, without any next/previous/total details
//  * Fastest: Reduces the total counting and doesn't use database cursor, simple limit and offset
//  * Usage: Used in selection dropdowns
//  * Issue: You can not tell if you reached at the last page.
//  * Needs an extra call to check if there are any more items left
//  */
// export interface ISimpleListResponse<Item> {
//   data: Array<Item>;
//   meta: {
//     from: number;
//     to: number;
//     current_page: number;
//     per_page: number;
//   };
// }

// export type XHRInstance = AxiosInstance;

// export const XHRContext = createContext<AxiosStatic>(axios)
// export type XHRProps = { xhr: AxiosStatic }

// export function useXHR() {
// 	return useContext(XHRContext)
// }

import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosRequestConfig,
} from 'axios';
import { notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

export interface IListResponse<Item> {
  data: Array<Item>;
  meta: {
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

/**
 * Cursor paginated list with next/prev pages, without total
 */
export interface ICursorListResponse<Item> {
  data: Array<Item>;
  meta: {
    next_cursor: string | null;
    prev_cursor: string | null;
    per_page: number;
  };
}

/**
 * Simple listing with offset and limit
 */
export interface ISimpleListResponse<Item> {
  data: Array<Item>;
  meta: {
    from: number;
    to: number;
    current_page: number;
    per_page: number;
  };
}

export type XHRInstance = AxiosInstance;

/**
 * Access Token (Memory)
 * Login ke baad set karna hai.
 */

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return xhr.get(url, config);
  },

  post: async <T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return xhr.post(url, body, config);
  },

  put: async <T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return xhr.put(url, body, config);
  },

  patch: async <T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return xhr.patch(url, body, config);
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return xhr.delete(url, config);
  },
};

export const xhr = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  // 30s taaki Render free-tier cold start (server so jaata hai, jagne me 30-60s)
  // pe pehli request bina wajah fail na ho. 10s pe wo timeout hoke unauthorized
  // jaisa behaviour deta tha.
  timeout: 30000,
});

xhr.interceptors.response.use(
  (response) => {
    console.log(response);
    if (response.data.message) {
      notifications.show({
        title: 'Success',
        message: response.data.message,
        color: 'green',
        withCloseButton: true,
        autoClose: 3000,
        position: 'top-right',
      });
    }
    return response.data;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const data = error.response?.data;
    console.log(error);

    const errorMessage =
      data?.error || data?.message || error.message || 'Something went wrong';

    notifications.show({
      title: 'Error',
      message: errorMessage,
      color: 'red',
      withCloseButton: true,
      autoClose: 3000,
      position: 'top-right',
    });

    return Promise.reject(error);
  },
);
