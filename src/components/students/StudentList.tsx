import { useEffect } from "react";
import { Search, type TSearchParams } from "../../libs/search/Search";
import { useLocationQuery, useSearch } from "../../utils/filterQuery";
import { Button } from "@mantine/core";
import { useDialog } from "../../libs/basic/Dialog";
import { ListView } from "../../libs/List/List";
import { Table } from "../../libs/basic/Table";
import { api } from "../../libs/XHR/xhr";

interface TFilters extends TSearchParams {}

interface TQuery extends TSearchParams {}

function filterToQuery(filters: TFilters): TQuery {
  const { q, page } = filters;
  const query: TQuery = {};

  if (q) {
    query.q = q;
  }

  if (page) {
    query.page = page;
  }

  return query;
}

function queryFilters(query: TQuery): TFilters {
  const { q, page } = query;
  const params: TFilters = {};

  if (q) {
    params.q = q;
  }

  if (page) {
    params.page = page;
  }

  return params;
}

export function StudentList() {
  const [query, setQuery] = useLocationQuery();
  const [params, setParams] = useSearch(query);
  const addStudentDialog = useDialog();

  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);
  return (
    <Search
      title="Student List"
      onSearch={(params) => setParams({ ...params, page: 1 })}
      actions={
        <Button onClick={() => addStudentDialog.open()}>Add Student</Button>
      }
    >
      {/* {({ setSearchParams})=>(
            <ListView onParamsChange={(newParams)=> setSearchParams(newParams)}  fetchFn={async()=> await api.get("")}>
                {()=>(
                    <Table rows={[]} headers={[]}/>
                )}
            </ListView> 
        )} */}
    </Search>
  );
}
