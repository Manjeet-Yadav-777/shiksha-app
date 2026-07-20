import { useEffect, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import { Button, Stack, Text } from "@mantine/core";
import { Form, useForm, useFormState } from "react-final-form";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { Search, type TSearchParams } from "../../libs/search/Search";
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
import type { IClass, ISection } from "../classes/store";
import type { IStudent } from "./store";

interface IStudentFormValues {
  name?: string;
  email?: string;
  password?: string;
  rollNumber?: string;
  classId?: string;
  sectionId?: string;
  admissionNumber?: string;
  admissionDate?: string | Date;
}

interface TFilters extends TSearchParams {
  archived?: boolean;
}

interface TLocationQuery extends TSearchParams {
  archived?: boolean;
}

function filterQuery(filters: TFilters): TLocationQuery {
  const { q, page, archived } = filters;

  const query: TLocationQuery = {};

  if (q) {
    query.q = q;
  }

  if (page) {
    query.page = page;
  }

  if (archived) {
    query.archived = true;
  }

  return query;
}

function queryToFilter(query: TLocationQuery): TFilters {
  const { q, page, archived } = query;

  const filters: TFilters = {};

  if (q) {
    filters.q = q;
  }

  if (page) {
    filters.page = page;
  }

  if (archived) {
    filters.archived = true;
  }

  return filters;
}

const SWR_KEY = "/students";

export function StudentList() {
  const [query, setQuery] = useLocationQuery({
    fromQuery: queryToFilter,
    toQuery: filterQuery,
  });
  const [params, setParams] = useSearch(query);
  const addDialog = useDialog();
  const editDialog = useDialog();
  const [selected, setSelected] = useState<IStudent>();

  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);

  return (
    <Search
      title="Students"
      filters={Filters}
      placeHolder="Search by name, email or admission no..."
      initialParams={params}
      onSearch={(p) => setParams(p)}
      actions={
        <>
          <Button onClick={() => addDialog.open()}>Add Student</Button>
          <StudentForm
            title="Add Student"
            isOpened={addDialog.isOpened}
            close={addDialog.close}
            onSubmit={async (values) => {
              await api.post("/students", values);
              mutate([SWR_KEY, params]);
              addDialog.close();
            }}
          />
        </>
      }
    >
      {({ setSearchParams }) => (
        <ListView<IStudent>
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
                  "Email",
                  "Roll No",
                  "Admission No",
                  "Class",
                  "Section",
                  "Admitted",
                  "Actions",
                ]}
                rows={items.map((s) => [
                  <Text fw="bold">{s.user?.name}</Text>,
                  <Text>{s.user?.email}</Text>,
                  <Text>{s.rollNumber}</Text>,
                  <Text>{s.admissionNumber}</Text>,
                  <Text>{s.class?.name ?? "-"}</Text>,
                  <Text>{s.section?.name ?? "-"}</Text>,
                  <Text>
                    {s.admissionDate ? formatDate(s.admissionDate) : "-"}
                  </Text>,
                  <DropdownMenu
                    trigger="hover"
                    width={160}
                    items={[
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
                          <Inline
                            c={s.deletedAt ? "orange" : "red"}
                            gap="xs"
                            align="center"
                          >
                            <IconTrash size={16} />
                            {s.deletedAt ? "Restore" : "Disable"}
                          </Inline>
                        ),
                        onClick: async () => {
                          const reqType = s.deletedAt ? "patch" : "delete";

                          if (reqType === "patch") {
                            await api.patch(`/students/${s._id}/restore`);
                          } else {
                            await api.delete(`/students/${s._id}`);
                          }

                          mutate([SWR_KEY, params]);
                        },
                      },
                    ]}
                  >
                    <IconDotsVertical cursor="pointer" size={18} />
                  </DropdownMenu>,
                ])}
              />

              <StudentForm
                title="Edit Student"
                isEdit
                isOpened={editDialog.isOpened}
                close={editDialog.close}
                initialValues={
                  selected && {
                    name: selected.user?.name,
                    email: selected.user?.email,
                    rollNumber: selected.rollNumber,
                    classId: selected.class?._id,
                    sectionId: selected.section?._id,
                    admissionNumber: selected.admissionNumber,
                    admissionDate: selected.admissionDate
                      ? new Date(selected.admissionDate)
                      : undefined,
                  }
                }
                onSubmit={async (values) => {
                  if (!selected) return;
                  await api.put(`/students/${selected._id}`, values);
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

function StudentForm({
  title,
  isOpened,
  close,
  onSubmit,
  initialValues,
  isEdit,
}: {
  title: string;
  isOpened: boolean;
  close: () => void;
  onSubmit: (values: IStudentFormValues) => void;
  initialValues?: IStudentFormValues;
  isEdit?: boolean;
}) {
  // Class catalog for the picker.
  const { data: classes } = useSWR("/academic/classes/all", async () =>
    api.get<IListResponse<IClass>>("/academic/classes", {
      params: { limit: 200 },
    }),
  );

  const classOptions =
    classes?.data.map((c) => ({ value: c._id, label: c.name })) ?? [];

  return (
    <Dialog sizes="55rem" isOpened={isOpened} close={close} title={title}>
      <Form<IStudentFormValues>
        initialValues={initialValues ?? { admissionDate: new Date() }}
        onSubmit={(v) => onSubmit(v)}
      >
        {({ handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Inline gap="lg">
                <TextInputField
                  w="50%"
                  name="name"
                  label="Full Name"
                  placeholder="Aarav Gupta"
                />
                <TextInputField
                  w="50%"
                  name="email"
                  label="Email"
                  placeholder="aarav@school.com"
                />
              </Inline>
              {!isEdit && (
                <Inline gap="lg">
                  <TextInputField
                    w="50%"
                    type="password"
                    name="password"
                    label="Password"
                    placeholder="Min 6 characters"
                  />
                  <TextInputField
                    w="50%"
                    name="admissionNumber"
                    label="Admission Number"
                    placeholder="ADM-2025-001"
                  />
                </Inline>
              )}
              <ClassSectionFields classOptions={classOptions} />
              <Inline gap="lg">
                <TextInputField
                  w="50%"
                  name="rollNumber"
                  label="Roll Number"
                  placeholder="12"
                />
                {!isEdit && (
                  <DatenputField name="admissionDate" label="Admission Date" />
                )}
              </Inline>
              <Inline justify="end" gap="md">
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : isEdit
                      ? "Save Changes"
                      : "Add Student"}
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

// Class -> Section cascade. Sections load for the picked class; changing the
// class clears the stale section selection.
function ClassSectionFields({
  classOptions,
}: {
  classOptions: { value: string; label: string }[];
}) {
  const { values } = useFormState<IStudentFormValues>({
    subscription: { values: true },
  });
  const form = useForm<IStudentFormValues>();
  const classId = values.classId;

  // Clear the section when the class changes — but not on first mount, so the
  // edit form keeps its pre-filled section. prevClassId starts as the initial
  // classId, so only a real user-driven switch wipes the section.
  const prevClassId = useRef(classId);
  useEffect(() => {
    if (prevClassId.current !== undefined && prevClassId.current !== classId) {
      form.change("sectionId", undefined);
    }
    prevClassId.current = classId;
  }, [classId, form]);

  const { data: sections } = useSWR(
    classId ? ["/academic/sections", classId] : null,
    async () =>
      api.get<{ data: ISection[] }>("/academic/sections", {
        params: { classId },
      }),
  );

  const sectionOptions =
    sections?.data.map((s) => ({ value: s._id, label: s.name })) ?? [];

  return (
    <Inline gap="lg">
      <SelectInputField
        w="50%"
        name="classId"
        label="Class"
        placeholder="Select class"
        data={classOptions}
        searchable
      />
      <SelectInputField
        w="50%"
        name="sectionId"
        label="Section"
        placeholder={classId ? "Select section" : "Pick a class first"}
        data={sectionOptions}
        disabled={!classId}
      />
    </Inline>
  );
}

function Filters() {
  return (
    <SelectInputField
      name="archived"
      data={[
        { label: "All", value: "" },
        { label: "Archived", value: "true" },
      ]}
    />
  );
}
