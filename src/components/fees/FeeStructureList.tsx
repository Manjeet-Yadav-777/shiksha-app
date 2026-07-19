import { useEffect } from "react";
import { mutate } from "swr";
import { Button, Stack, Text, Badge } from "@mantine/core";
import { Form } from "react-final-form";
import useSWR from "swr";
import {
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconUsersPlus,
} from "@tabler/icons-react";
import { Search } from "../../libs/search/Search";
import { useLocationQuery, useSearch } from "../../utils/filterQuery";
import { ListView } from "../../libs/List/List";
import { Table } from "../../libs/basic/Table";
import { Dialog, useDialog } from "../../libs/basic/Dialog";
import { Inline } from "../../libs/basic/Layout";
import { DropdownMenu } from "../../libs/basic/DropDown";
import { TextInputField } from "../../libs/form/Input";
import { SelectInputField } from "../../libs/form/SelectInputField";
import { DatenputField } from "../../libs/form/DateInputField";
import { api } from "../../libs/XHR/xhr";
import type { IListResponse } from "../../libs/XHR/xhr";
import { formatDate } from "../../helpers/Date";
import type { IClass } from "../classes/store";
import { useState } from "react";
import {
  FREQUENCY_OPTIONS,
  sessionOptions,
  defaultSession,
  type IFeeStructure,
} from "./store";

interface IStructureFormValues {
  name?: string;
  amount?: number;
  dueDate?: string | Date;
  classId?: string;
  frequency?: string;
  academicSession?: string;
}

const SWR_KEY = "/fees/structures";

export function FeeStructureList() {
  const [query, setQuery] = useLocationQuery();
  const [params, setParams] = useSearch(query);
  const addDialog = useDialog();
  const editDialog = useDialog();
  const [selected, setSelected] = useState<IFeeStructure>();

  // Class catalog for the structure form's class picker.
  const { data: classes } = useSWR("/academic/classes/all", async () =>
    api.get<IListResponse<IClass>>("/academic/classes", {
      params: { limit: 200 },
    })
  );

  const classOptions =
    classes?.data.map((c) => ({ value: c._id, label: c.name })) ?? [];

  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);

  return (
    <Search
      title="Fee Structures"
      placeHolder="Search fee structures..."
      onSearch={(p) => setParams({ ...p, page: 1 })}
      actions={
        <>
          <Button onClick={() => addDialog.open()}>Add Fee Structure</Button>
          <StructureForm
            title="Add Fee Structure"
            classOptions={classOptions}
            isOpened={addDialog.isOpened}
            close={addDialog.close}
            onSubmit={async (values) => {
              await api.post("/fees/structures", {
                ...values,
                amount: Number(values.amount),
              });
              mutate([SWR_KEY, params]);
              addDialog.close();
            }}
          />
        </>
      }
    >
      {({ setSearchParams }) => (
        <ListView<IFeeStructure>
          params={params}
          onParamsChange={(newParams) => setSearchParams(newParams)}
          swrKey={SWR_KEY}
          fetchFn={async () => await api.get(SWR_KEY, { params })}
        >
          {(items) => (
            <>
              <Table
                headers={[
                  "Name",
                  "Amount",
                  "Frequency",
                  "Class",
                  "Session",
                  "Due Date",
                  "Actions",
                ]}
                rows={items.map((s) => [
                  <Text fw="bold">{s.name}</Text>,
                  <Text>₹{s.amount.toLocaleString("en-IN")}</Text>,
                  <Badge variant="light" color="blue">
                    {s.frequency.replace("_", " ")}
                  </Badge>,
                  <Text>{s.class?.name ?? "-"}</Text>,
                  <Text>{s.academicSession}</Text>,
                  <Text>{s.dueDate ? formatDate(s.dueDate) : "-"}</Text>,
                  <DropdownMenu
                    trigger="hover"
                    width={200}
                    items={[
                      {
                        label: (
                          <Inline gap="xs" align="center">
                            <IconUsersPlus size={16} />
                            Assign to Class
                          </Inline>
                        ),
                        onClick: async () => {
                          if (!s.class) return;
                          await api.post(`/fees/structures/${s._id}/assign`);
                          mutate([SWR_KEY, params]);
                        },
                      },
                      {
                        label: (
                          <Inline gap="xs" align="center">
                            <IconPencil size={16} />
                            Edit
                          </Inline>
                        ),
                        onClick: () => {
                          setSelected(s);
                          editDialog.open();
                        },
                      },
                      {
                        label: (
                          <Inline c="red" gap="xs" align="center">
                            <IconTrash size={16} />
                            Delete
                          </Inline>
                        ),
                        onClick: async () => {
                          await api.delete(`/fees/structures/${s._id}`);
                          mutate([SWR_KEY, params]);
                        },
                      },
                    ]}
                  >
                    <IconDotsVertical cursor="pointer" size={18} />
                  </DropdownMenu>,
                ])}
              />

              <StructureForm
                title="Edit Fee Structure"
                classOptions={classOptions}
                isOpened={editDialog.isOpened}
                close={editDialog.close}
                initialValues={
                  selected && {
                    name: selected.name,
                    amount: selected.amount,
                    dueDate: selected.dueDate ? new Date(selected.dueDate) : undefined,
                    classId: selected.class?._id,
                    frequency: selected.frequency,
                    academicSession: selected.academicSession,
                  }
                }
                onSubmit={async (values) => {
                  if (!selected) return;
                  await api.put(`/fees/structures/${selected._id}`, {
                    ...values,
                    amount: Number(values.amount),
                  });
                  mutate([SWR_KEY, params]);
                  editDialog.close();
                }}
              />
            </>
          )}
        </ListView>
      )}
    </Search>
  );
}

function StructureForm({
  title,
  isOpened,
  close,
  onSubmit,
  classOptions,
  initialValues,
}: {
  title: string;
  isOpened: boolean;
  close: () => void;
  onSubmit: (values: IStructureFormValues) => void;
  classOptions: { value: string; label: string }[];
  initialValues?: IStructureFormValues;
}) {
  return (
    <Dialog sizes="55rem" isOpened={isOpened} close={close} title={title}>
      <Form<IStructureFormValues>
        initialValues={
          initialValues ?? {
            dueDate: new Date(),
            frequency: "one_time",
            academicSession: defaultSession(),
          }
        }
        onSubmit={(v) => onSubmit(v)}
      >
        {({ handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Inline gap="lg">
                <TextInputField
                  w="50%"
                  name="name"
                  label="Fee Name"
                  placeholder="Tuition Fee"
                />
                <TextInputField
                  w="50%"
                  type="number"
                  name="amount"
                  label="Amount (₹)"
                  placeholder="5000"
                />
              </Inline>
              <Inline gap="lg">
                <SelectInputField
                  w="50%"
                  name="classId"
                  label="Class"
                  placeholder="Select class"
                  data={classOptions}
                  searchable
                  clearable
                />
                <SelectInputField
                  w="50%"
                  name="frequency"
                  label="Frequency"
                  placeholder="Select frequency"
                  data={FREQUENCY_OPTIONS}
                />
              </Inline>
              <Inline gap="lg">
                <SelectInputField
                  w="50%"
                  name="academicSession"
                  label="Academic Session"
                  placeholder="e.g. 2025-2026"
                  data={sessionOptions()}
                />
                <DatenputField w="50%" name="dueDate" label="Due Date" />
              </Inline>
              <Inline justify="end" gap="md">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save"}
                </Button>
                <Button variant="default" onClick={close}>
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
