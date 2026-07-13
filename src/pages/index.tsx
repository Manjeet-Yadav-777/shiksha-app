import { Button, Stack } from "@mantine/core";
import { Search, type TSearchParams } from "../libs/search/Search";
import { useLocationQuery, useSearch } from "../utils/filterQuery";
import { useEffect } from "react";
import { TextInputField } from "../libs/form/Input";
import { Table } from "../libs/basic/Table";

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
      >
        {({searchParams, setSearchParamValue, setSearchParams})=>(
            <Button onClick={()=> setSearchParamValue("name" , "Ram Ram ji")}>Change</Button>
        )}
      </Search>
    </div>
  );
}

function Filters() {
  return (
    <Stack>
      <TextInputField name="name" label="Name" />
    </Stack>
  );
}
