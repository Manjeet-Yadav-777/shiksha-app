import axios, {type AxiosInstance, type AxiosStatic } from "axios";
import { createContext, useContext } from "react";

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
 * Faster: Reduces the total counting and usage database cursor
 * Usage: Used in listing pages where total counting is not helpful
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
 * Simple listing with a offset and limit, without any next/previous/total details
 * Fastest: Reduces the total counting and doesn't use database cursor, simple limit and offset
 * Usage: Used in selection dropdowns
 * Issue: You can not tell if you reached at the last page.
 * Needs an extra call to check if there are any more items left
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

export const XHRContext = createContext<AxiosStatic>(axios)
export type XHRProps = { xhr: AxiosStatic }

export function useXHR() {
	return useContext(XHRContext)
}


