import { useEffect, useState } from "react";
import { Search, type TSearchParams } from "../../libs/search/Search";
import { useLocationQuery, useSearch } from "../../utils/filterQuery";
import { Button, Divider, Stack, Text } from "@mantine/core";
import { Dialog, useDialog } from "../../libs/basic/Dialog";
import { Inline } from "../../libs/basic/Layout";
import { TextInputField } from "../../libs/form/Input";
import { Form } from "react-final-form";
import { api } from "../../libs/XHR/xhr";
import { ListView } from "../../libs/List/List";
import type { ITenant } from "./store";
import { Table } from "../../libs/basic/Table";
import { mutate } from "swr";
import { formatDate } from "../../helpers/Date";
import { DropdownMenu } from "../../libs/basic/DropDown";
import { IconBan, IconDotsVertical, IconPencil } from "@tabler/icons-react";
import { downloadFile } from "../../libs/XHR/downloadFile";
import { capitalize } from "../../helpers/Wording";
import { SelectInputField } from "../../libs/form/SelectInputField";
import { NavLink } from "../../utils/Link";
import { useAuthUser } from "../../hooks/auth";

interface TFilters extends TSearchParams {
  status?: "active" | "suspended" | "all";
}

interface TLocationQuery extends TSearchParams {
  status?: "active" | "suspended" | "all";
}

function paramsToQuery(filters: TFilters): TLocationQuery {
  const { q, page, status = "active" } = filters;
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
  const { q, page, status = "active" } = query;
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

export function TenantList() {
  const [query, setQuery] = useLocationQuery({
    toQuery: paramsToQuery,
    fromQuery: queryToFilter,
  });
  const user = useAuthUser();
  console.log(user);
  const [params, setparams] = useSearch(query);
  const tenantAddDialog = useDialog();
  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);

  const tenantUpdateDialog = useDialog();
  const [selectedTenant, setSelectedTenant] = useState<ITenant>();
  return (
    <Search
      title="Tenant List"
      filters={Filters}
      initialParams={params}
      onSearch={(params) => setparams({ ...params })}
      actions={
        <>
          <Button onClick={() => tenantAddDialog.open()}>Add Tenant</Button>
          <Addtenant
            isOpen={tenantAddDialog.isOpened}
            close={tenantAddDialog.close}
            title="Add Tenant"
            params={params}
            onSubmit={async (values) => {
              await api.post("/tenant/add", values);
              mutate(["/tenants", params]);
              close();
            }}
          />
        </>
      }
    >
      {({ setSearchParams }) => (
        <ListView<ITenant>
          params={params}
          onParamsChange={(newParams) => {
            console.log("Parent:", newParams);
            setSearchParams(newParams);
          }}
          swrKey={"/tenants"}
          fetchFn={async () => {
            return await api.get("/tenant/getall", { params: params });
          }}
          actions={
            <Button
              variant="default"
              onClick={async () => {
                await downloadFile(
                  "/tenant/export",
                  "tenants.xlsx",
                  { filters: params },
                );
              }}
            >
              Export Tenants
            </Button>
          }
        >
          {(items) => (
            <>
              <Table
                headers={["Name", "Slug", "Created At", "Status", "Actions"]}
                rows={items.map((i) => [
                  <NavLink
                    fw="bold"
                    color="blue"
                    to={`/super-admin/tenants/${i._id}`}
                  >
                    {i.name}
                  </NavLink>,
                  <Text>{i.slug.toUpperCase()}</Text>,
                  <Text>{formatDate(i.createdAt)}</Text>,
                  <Text c={i.status === "suspended" ? "red" : ""}>
                    {capitalize(i.status)}
                  </Text>,
                  <>
                    <DropdownMenu
                      trigger="hover"
                      width={140}
                      items={[
                        {
                          label: (
                            <Inline gap="xs" align={"center"}>
                              <IconPencil size={16} />
                              Edit
                            </Inline>
                          ),
                          onClick: () => {
                            setSelectedTenant(i);
                            tenantUpdateDialog.open();
                          },
                        },
                        {
                          label:
                            i.status === "active" ? (
                              <Inline c={"red"} gap="xs" align={"center"}>
                                <IconBan size={16} />
                                Suspend
                              </Inline>
                            ) : (
                              <Inline c={"yellow"} gap="xs" align={"center"}>
                                <IconBan size={16} />
                                Activate
                              </Inline>
                            ),
                          onClick: async () => {
                            let status =
                              i.status === "active" ? "suspended" : "active";
                            await api.patch(`/tenant/${i._id}/status`, {
                              status,
                            });
                            mutate(["/tenants", params]);
                          },
                        },
                      ]}
                    >
                      <IconDotsVertical cursor={"pointer"} size={18} />
                    </DropdownMenu>
                  </>,
                ])}
              />
              <EditTenant
                close={tenantUpdateDialog.close}
                isOpen={tenantUpdateDialog.isOpened}
                initialValues={selectedTenant}
                title="Edit Tenant"
                onSubmit={async (values) => {
                  await api.put(`/tenant/${selectedTenant?._id}`, values);
                  mutate(["/tenants", params]);
                  tenantUpdateDialog.close();
                }}
              />
            </>
          )}
        </ListView>
      )}
    </Search>
  );
}

interface ITennatAddEditPorps {
  isOpen: boolean;
  close: () => void;
  title: string;
  params?: TFilters;
  initialValues?: Partial<ITenant>;
  onSubmit: (values: Partial<ITenant>) => void;
}

export function Addtenant({
  isOpen,
  close,
  title,
  initialValues,
  onSubmit,
}: ITennatAddEditPorps) {
  console.log(isOpen);
  return (
    <Dialog sizes="55rem" title={title} isOpened={isOpen} close={close}>
      <Form
        initialValues={initialValues}
        onSubmit={async (values) => {
          onSubmit(values);
        }}
      >
        {({ handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <Stack gap={"xl"}>
              <Inline gap={"lg"}>
                <TextInputField
                  placeholder="Sanjay public school"
                  w={"50%"}
                  name="name"
                  label="Name"
                />
                <TextInputField
                  w={"50%"}
                  name="slug"
                  label="Slug"
                  placeholder="SPSS"
                />
              </Inline>
              <Inline gap={"lg"}>
                <TextInputField
                  placeholder="+91**********"
                  w={"50%"}
                  name="contactPhone"
                  label="Phone"
                />
                <TextInputField
                  w={"50%"}
                  name="contactEmail"
                  label="Email"
                  placeholder="spss@gmail.com"
                />
              </Inline>

              <TextInputField
                name="address"
                label="Address"
                placeholder="PN.12 Shivpuri Ext Shyam Ngar "
              />
              <Divider />
              <Inline gap={"lg"} justify={"end"}>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add tenant"}
                </Button>
                <Button variant="default" onClick={() => close()}>
                  Cancel
                </Button>
              </Inline>
            </Stack>
          </form>
        )}
      </Form>
    </Dialog>
  );
}

export function EditTenant({
  isOpen,
  close,
  title,
  initialValues,
  onSubmit,
}: ITennatAddEditPorps) {
  const initialValue = {
    name: initialValues?.name,
    slug: initialValues?.slug,
    contactPhone: initialValues?.contactPhone,
    contactEmail: initialValues?.contactEmail,
    address: initialValues?.address,
  };
  return (
    <Addtenant
      isOpen={isOpen}
      close={close}
      title={title}
      initialValues={initialValue}
      onSubmit={async (values) => {
        onSubmit(values);
      }}
    />
  );
}

export function Filters() {
  return (
    <SelectInputField
      name="status"
      label="Status"
      data={[
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
        { value: "all", label: "All" },
      ]}
    />
  );
}
