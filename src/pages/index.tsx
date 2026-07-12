import { Button, Stack } from "@mantine/core";
import { Search, type TSearchParams } from "../libs/search/Search";
import { useLocationQuery, useSearch } from "../utils/filterQuery";
import { useEffect } from "react";
import { TextInputBox } from "../libs/form/Input";

interface TFilters extends TSearchParams {
  name?: string;
}

interface TLocationQuery extends TSearchParams {
  name?: string;
}

function filterToLocationQuery(filters: TFilters): TLocationQuery {
  const { name, q, sort, page } = filters;
  const query: TLocationQuery = {};

  if (name) {
    query.name = name;
  }
  if (q) {
    query.q = q;
  }
  if (page) {
    query.page = page;
  }
  if (sort) query.sort = sort;

  return query;
}

function locationQueryToFilter(query: TLocationQuery): TFilters {
  const { name, q, sort, page } = query;
  const filters: TFilters = {};

  if (name) {
    filters.name = name;
  }
  if (q) {
    filters.q = q;
  }
  if (page) {
    filters.page = page;
  }
  if (sort) filters.sort = sort;

  return filters;
}

export default function Dashboard() {
  const [query, setQuery] = useLocationQuery<TFilters, TLocationQuery>({
    toQuery: filterToLocationQuery,
    fromQuery: locationQueryToFilter,
  });

  const [params, setParams] = useSearch(query);

  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);

  return (
    <div>
      <Search
        filters={Filters}
        title="Student List"
        initialParams={params}
        onSearch={(newParams) => {
          setParams({ ...newParams, page: 1 });
        }}
        actions={<Button>Add Student</Button>}
      />
    </div>
  );
}

function Filters() {
  return (
    <Stack>
      <TextInputBox name="name" label="Name" />
    </Stack>
  );
}
