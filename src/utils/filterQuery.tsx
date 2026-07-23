import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parse, stringify } from 'qs';
import { type Optional } from 'utility-types';

const emptyObject: unknown = {};

type TSearchParams = {
  q?: string;
  page?: number;
  limit?: number;
  cursor?: string | null;
};

export function useLocationQuery<
  TParams extends TSearchParams = TSearchParams,
  TQuery extends TSearchParams = TSearchParams,
>(
  {
    toQuery,
    fromQuery,
  }: {
    toQuery: (params: TParams) => TQuery;
    fromQuery: (query: TQuery) => TParams;
  } = {
    toQuery: (t: TParams) => t as unknown as TQuery,
    fromQuery: (q: TQuery) => q as unknown as TParams,
  },
): [TParams, (params: TParams) => void] {
  const location = useLocation();
  const navigate = useNavigate();
  // get the search from the location
  const search = location ? location.search : '';
  // get the params from the location's state if there is any
  let stateParams: TParams = emptyObject as unknown as TParams;
  if (location && location.state && typeof location.state === 'object') {
    stateParams = ((location.state as unknown as { params?: TParams }).params ||
      emptyObject) as unknown as TParams;
  }
  // hold a local state for search query in location
  const [query, setQuery] = useState<TQuery>({
    ...toQuery(stateParams || emptyObject),
    ...searchToQuery<TQuery>(search),
  });
  // because MOST of the toQuery are arrow functions.
  const toQueryRef = useRef(toQuery);
  toQueryRef.current = toQuery;
  const setParams = useCallback(
    (params: TParams) => {
      setQuery(toQueryRef.current(params));
    },
    [setQuery],
  );
  // update the url whenever the query changes
  useEffect(() => {
    // don't push the cursor to url
    const { cursor, ...q } = query;
    const newQuery = queryToSearch(q, {
      skipNulls: true,
    });
    const locationSearch = location?.search;
    if (newQuery !== locationSearch) {
      navigate &&
        navigate(newQuery, {
          replace: true,
          state:
            (location?.state as undefined | Record<string, unknown>) ||
            undefined,
        });
    }
  }, [query, location?.search, location?.state, navigate]);
  const params = useMemo(() => fromQuery(query), [query, fromQuery]);

  return [params, setParams];
}

export function searchToQuery<
  T extends Record<string, unknown> = Record<string, unknown>,
>(search = '?', options: qs.IParseOptions = {}): Optional<T> {
  return parse(search, {
    ignoreQueryPrefix: true,
    ...options,
  }) as Optional<T>;
}

export function queryToSearch(
  query?: Record<string, unknown>,
  options: qs.IStringifyOptions = {},
): string {
  return stringify(query, { addQueryPrefix: true, ...options });
}

export function useSearch<T extends TSearchParams = TSearchParams>(
  initialValues: T | (() => T) = {} as T,
) {
  return useState<T>(initialValues);
}
