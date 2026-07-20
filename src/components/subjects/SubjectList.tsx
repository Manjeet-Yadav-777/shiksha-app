import { useEffect, useState } from "react";
import { Button, Stack, Text, Badge } from "@mantine/core";
import { Form } from "react-final-form";
import { mutate } from "swr";
import {
  IconDotsVertical,
  IconPencil,
  IconTrash,
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
import { api } from "../../libs/XHR/xhr";
import { formatDate } from "../../helpers/Date";
import { capitalize } from "../../helpers/Wording";
import { SubjectType, type ISubject } from "./store";

interface ISubjectFormValues {
  name?: string;
  code?: string;
  type: SubjectType;
}

const SWR_KEY = "/academic/subjects";

export function SubjectList() {
  const [query, setQuery] = useLocationQuery();
  const [params, setParams] = useSearch(query);
  const addDialog = useDialog();
  const editDialog = useDialog();
  const [selected, setSelected] = useState<ISubject>();

  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);

  return (
    <Search
      title="Subjects"
      placeHolder="Search subjects..."
      onSearch={(p) => setParams(p)}
      actions={
        <>
          <Button onClick={() => addDialog.open()}>Add Subject</Button>
          <SubjectForm
            isOpened={addDialog.isOpened}
            close={addDialog.close}
            title="Add Subject"
            onSubmit={async (values) => {
              await api.post("/academic/subjects", values);
              mutate([SWR_KEY, params]);
              addDialog.close();
            }}
          />
        </>
      }
    >
      {({ setSearchParams }) => (
        <ListView<ISubject>
          params={params}
          onParamsChange={(newParams) => setSearchParams(newParams)}
          swrKey={SWR_KEY}
          fetchFn={async () => await api.get(SWR_KEY, { params })}
        >
          {(items) => (
            <>
              <Table
                headers={["Name", "Code", "Type", "Created At", "Actions"]}
                rows={items.map((s) => [
                  <Text fw="bold">{s.name}</Text>,
                  <Text>{s.code?.toUpperCase()}</Text>,
                  <Badge
                    color={s.type === SubjectType.PRACTICAL ? "grape" : "blue"}
                    variant="light"
                  >
                    {capitalize(s.type)}
                  </Badge>,
                  <Text>{formatDate(s.createdAt)}</Text>,
                  <DropdownMenu
                    trigger="hover"
                    width={140}
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
                          <Inline c="red" gap="xs" align="center">
                            <IconTrash size={16} />
                            Delete
                          </Inline>
                        ),
                        onClick: async () => {
                          await api.delete(`/academic/subjects/${s._id}`);
                          mutate([SWR_KEY, params]);
                        },
                      },
                    ]}
                  >
                    <IconDotsVertical cursor="pointer" size={18} />
                  </DropdownMenu>,
                ])}
              />
              <SubjectForm
                isOpened={editDialog.isOpened}
                close={editDialog.close}
                title="Edit Subject"
                initialValues={selected}
                onSubmit={async (values) => {
                  await api.put(`/academic/subjects/${selected?._id}`, values);
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

function SubjectForm({
  isOpened,
  close,
  title,
  initialValues,
  onSubmit,
}: {
  isOpened: boolean;
  close: () => void;
  title: string;
  initialValues?: Partial<ISubject>;
  onSubmit: (values: ISubjectFormValues) => void;
}) {
  const values: ISubjectFormValues = {
    name: initialValues?.name,
    code: initialValues?.code,
    type: initialValues?.type ?? SubjectType.THEORY,
  };

  return (
    <Dialog sizes="55rem" isOpened={isOpened} close={close} title={title}>
      <Form<ISubjectFormValues>
        initialValues={values}
        onSubmit={(v) => onSubmit(v)}
      >
        {({ handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Inline gap="lg">
                <TextInputField
                  w="50%"
                  name="name"
                  label="Subject Name"
                  placeholder="Mathematics"
                />
                <TextInputField
                  w="50%"
                  name="code"
                  label="Subject Code"
                  placeholder="MATH"
                />
              </Inline>
              <SelectInputField
                name="type"
                label="Type"
                data={[
                  { value: SubjectType.THEORY, label: "Theory" },
                  { value: SubjectType.PRACTICAL, label: "Practical" },
                ]}
              />
              <Inline justify="end" gap="md">
                <Button type="submit" disabled={submitting}>
                  Save Subject
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
