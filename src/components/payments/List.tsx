import { useEffect, useState } from "react";
import { useAuthUser } from "../../hooks/auth";
import { useDialog } from "../../libs/basic/Dialog";
import { Search, type TSearchParams } from "../../libs/search/Search";
import { useLocationQuery, useSearch } from "../../utils/filterQuery";
import { Badge, Button, Text } from "@mantine/core";
import { ListView } from "../../libs/List/List";
import { Table } from "../../libs/basic/Table";
import { NavLink } from "../../utils/Link";
import { api, xhr } from "../../libs/XHR/xhr";
import type { IInstallment } from "./store";
import { Inline } from "../../libs/basic/Layout";

import { capitalize } from "../../helpers/Wording";
import { formatDate } from "../../helpers/Date";
import { LogPayment } from "./LogPayment";
import { SelectInputField } from "../../libs/form/SelectInputField";
import { downloadFile } from "../../libs/XHR/downloadFile";
import { downloadPdf } from "../../libs/XHR/downloadPdf";

interface TFilters extends TSearchParams {
  status?: "pending" | "success" | "all";
}

interface TLocationQuery extends TSearchParams {
  status?: "pending" | "success" | "all";
}

function paramsToQuery(filters: TFilters): TLocationQuery {
  const { q, page, status = "pending" } = filters;
  const query: TLocationQuery = {};
  if (q) {
    query.q = q;
  }
  if (page) {
    query.page = page;
  }

  if (status) {
    query.status = status;
  }

  return query;
}

function queryToFilter(query: TLocationQuery): TFilters {
  const { q, page, status = "pending" } = query;
  const params: TFilters = {};

  if (q) {
    params.q = q;
  }
  if (page) {
    params.page = page;
  }
  if (status) {
    params.status = status;
  }

  return params;
}

export function PaymentList() {
  const [query, setQuery] = useLocationQuery({
    toQuery: paramsToQuery,
    fromQuery: queryToFilter,
  });
  const [params, setparams] = useSearch(query);
  const logDialog = useDialog();
  const [selectedinstallment, setSelectedInstallment] =
    useState<IInstallment>();
  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);
  return (
    <Search
      title="Payments List"
      filters={Filters}
      initialParams={params}
      onSearch={(params) => setparams({ ...params, page : 1 })}
    >
      {({ setSearchParams }) => (
        <ListView<IInstallment>
          params={params}
          onParamsChange={(newParams) => {
            console.log("Parent:", newParams);
            setSearchParams(newParams);
          }}
          swrKey={"/installment/getall"}
          fetchFn={async () => {
            return await api.get("/installment/getall", { params: params });
          }}
        >
          {(items) => (
            <>
              <Table
                headers={[
                  "Tenant",
                  "Amount",
                  "Paid",
                  "Due",
                  "Due Date",
                  "Status",
                  "Actions",
                ]}
                rows={items.map((i) => [
                  <NavLink
                    fw="bold"
                    color="blue"
                    to={`/super-admin/tenants/${i.tenant._id}`}
                  >
                    {i.tenant.name}
                  </NavLink>,

                  <Text>
                    {i.subscription.currency} {i.amount.toLocaleString()}
                  </Text>,

                  <Text c="green">
                    {i.subscription.currency} {i.paid_amount.toLocaleString()}
                  </Text>,

                  <Text c={i.amount >= 0 ? "red" : "green"}>
                    {i.subscription.currency} {Number(i.amount - i.paid_amount)}
                  </Text>,

                  <Text>{i.due_date ? formatDate(i.due_date) : "-"}</Text>,

                  <Badge
                    color={i.paid_amount ? "green" : "red"}
                    variant="light"
                  >
                    {capitalize(i.status)}
                  </Badge>,

                  //need to handle overdue here later
                  i.paid_amount ? (
                    <Button
                      variant="default"
                      c={"green"}
                      onClick={async () => {
                        await downloadPdf(
                          `/installment/${i._id}/invoice`,
                          "invoice.pdf",
                        );
                      }}
                    >
                      Generate Invoice
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => {
                        setSelectedInstallment(i);
                        logDialog.open();
                      }}
                    >
                      <Inline align={"center"} gap={"sm"}>
                        Log Payment
                      </Inline>
                    </Button>
                  ),
                ])}
              />
              <LogPayment
                close={logDialog.close}
                isOpen={logDialog.isOpened}
                title="Log Payment"
                installment={selectedinstallment}
                params={params}
              />
            </>
          )}
        </ListView>
      )}
    </Search>
  );
}

export function Filters() {
  return (
    <SelectInputField
      name="status"
      data={[
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Success", value: "success" },
      ]}
    />
  );
}
