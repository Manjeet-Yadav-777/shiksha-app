import { Button, Image, Stack, Text } from "@mantine/core";
import { Search, type TSearchParams } from "../libs/search/Search";
import { useLocationQuery, useSearch } from "../utils/filterQuery";
import { useEffect } from "react";
import { TextInputField } from "../libs/form/Input";
import { ListView } from "../libs/List/List";
import axios from "axios";
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
        {() => (
          <ListView
            swrKey={"Producrs"}
            params={params}
            onParamsChange={setParams}
            fetchFn={async () => {
              const res = await axios.get("https://fakestoreapi.com/products");

              return {
                data: res.data,
                meta: {
                  from: 1,
                  to: res.data.length,
                  total: res.data.length,
                  current_page: 1,
                  last_page: 1,
                  per_page: res.data.length,
                },
              };
            }}
          >
            {(items) => {
              return (
                <Table
                  headers={["Image", "Name", "Price", "Category"]}
                  rows={items.map((i: any) => [
                    <Image src={i.image} h={"30px"} w={"30px"} />,
                    <Text>{i.title.slice(0, 10) + "..."}</Text>,
                    <Text>{i.price}</Text>,
                    <Text>{i.category}</Text>,
                  ])}
                />
              );
            }}
          </ListView>
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
