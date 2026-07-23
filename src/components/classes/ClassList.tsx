import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Button,
  Stack,
  Text,
  Badge,
  Group,
  Divider,
  Loader,
  Center,
} from '@mantine/core';
import { Form } from 'react-final-form';
import {
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconLayoutGrid,
  IconBooks,
} from '@tabler/icons-react';
import { Search } from '../../libs/search/Search';
import { useLocationQuery, useSearch } from '../../utils/filterQuery';
import { ListView } from '../../libs/List/List';
import { Table } from '../../libs/basic/Table';
import { Dialog, useDialog } from '../../libs/basic/Dialog';
import { Inline } from '../../libs/basic/Layout';
import { DropdownMenu } from '../../libs/basic/DropDown';
import { TextInputField } from '../../libs/form/Input';
import { api } from '../../libs/XHR/xhr';
import type { IListResponse } from '../../libs/XHR/xhr';
import { formatDate } from '../../helpers/Date';
import type { IClass } from './store';
import { ManageCurriculum } from '../subjects/ManageCurriculum';
import type { ISection } from '../subjects/store';

interface IClassFormValues {
  name?: string;
  code?: string;
}

const SWR_KEY = '/academic/classes';

export function ClassList() {
  const [query, setQuery] = useLocationQuery();
  const [params, setParams] = useSearch(query);
  const addDialog = useDialog();
  const editDialog = useDialog();
  const sectionDialog = useDialog();
  const curriculumDialog = useDialog();
  const [selected, setSelected] = useState<IClass>();

  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);

  return (
    <Search
      title="Classes"
      placeHolder="Search classes..."
      onSearch={(p) => setParams(p)}
      actions={
        <>
          <Button onClick={() => addDialog.open()}>Add Class</Button>
          <ClassForm
            isOpened={addDialog.isOpened}
            close={addDialog.close}
            title="Add Class"
            onSubmit={async (values) => {
              await api.post('/academic/classes', values);
              mutate([SWR_KEY, params]);
              addDialog.close();
            }}
          />
        </>
      }
    >
      {({ setSearchParams }) => (
        <ListView<IClass>
          params={params}
          onParamsChange={(newParams) => setSearchParams(newParams)}
          swrKey={SWR_KEY}
          fetchFn={async () => await api.get(SWR_KEY, { params })}
        >
          {(items) => (
            <>
              <Table
                headers={['Name', 'Code', 'Created At', 'Actions']}
                rows={items.map((c) => [
                  <Text fw="bold">{c.name}</Text>,
                  <Text>{c.code || '-'}</Text>,
                  <Text>{formatDate(c.createdAt)}</Text>,
                  <DropdownMenu
                    trigger="hover"
                    width={190}
                    items={[
                      {
                        label: (
                          <Inline gap="xs" align="center">
                            <IconLayoutGrid size={16} />
                            Manage Sections
                          </Inline>
                        ),
                        onClick: () => {
                          setSelected(c);
                          sectionDialog.open();
                        },
                      },
                      {
                        label: (
                          <Inline gap="xs" align="center">
                            <IconBooks size={16} />
                            Manage Subjects
                          </Inline>
                        ),
                        onClick: () => {
                          setSelected(c);
                          curriculumDialog.open();
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
                          setSelected(c);
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
                          await api.delete(`/academic/classes/${c._id}`);
                          mutate([SWR_KEY, params]);
                        },
                      },
                    ]}
                  >
                    <IconDotsVertical cursor="pointer" size={18} />
                  </DropdownMenu>,
                ])}
              />

              <ClassForm
                isOpened={editDialog.isOpened}
                close={editDialog.close}
                title="Edit Class"
                initialValues={selected}
                onSubmit={async (values) => {
                  await api.put(`/academic/classes/${selected?._id}`, values);
                  mutate([SWR_KEY, params]);
                  editDialog.close();
                }}
              />

              <Dialog
                sizes="55rem"
                isOpened={sectionDialog.isOpened}
                close={sectionDialog.close}
                title={`Sections - ${selected?.name ?? ''}`}
              >
                {selected && <ManageSections classItem={selected} />}
              </Dialog>

              <Dialog
                sizes="55rem"
                isOpened={curriculumDialog.isOpened}
                close={curriculumDialog.close}
                title={`Curriculum - ${selected?.name ?? ''}`}
              >
                {selected && <ManageCurriculum classItem={selected} />}
              </Dialog>
            </>
          )}
        </ListView>
      )}
    </Search>
  );
}

function ClassForm({
  isOpened,
  close,
  title,
  initialValues,
  onSubmit,
}: {
  isOpened: boolean;
  close: () => void;
  title: string;
  initialValues?: Partial<IClass>;
  onSubmit: (values: IClassFormValues) => void;
}) {
  const values: IClassFormValues = {
    name: initialValues?.name,
    code: initialValues?.code,
  };

  return (
    <Dialog sizes="55rem" isOpened={isOpened} close={close} title={title}>
      <Form<IClassFormValues>
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
                  label="Class Name"
                  placeholder="Class 10"
                />
                <TextInputField
                  w="50%"
                  name="code"
                  label="Code (optional)"
                  placeholder="X"
                />
              </Inline>
              <Inline justify="end" gap="md">
                <Button type="submit" disabled={submitting}>
                  Save Class
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

interface ISectionFormValues {
  name?: string;
  roomNumber?: string;
}

// Sections are nested under a class (e.g. Class 10 -> A, B). Managed inline
// in a dialog rather than a separate page since they only make sense per class.
function ManageSections({ classItem }: { classItem: IClass }) {
  const key = ['/academic/sections', classItem._id];
  const { data, isLoading } = useSWR(key, async () =>
    api.get<IListResponse<ISection>>('/academic/sections', {
      params: { classId: classItem._id },
    }),
  );

  const refresh = () => mutate(key);

  return (
    <Stack gap="lg">
      <Form<ISectionFormValues>
        initialValues={{}}
        onSubmit={async (values, form) => {
          await api.post('/academic/sections', {
            classId: classItem._id,
            name: values.name,
            roomNumber: values.roomNumber,
          });
          refresh();
          form.restart();
        }}
      >
        {({ handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <Group align="end" gap="md">
              <TextInputField
                name="name"
                label="Section Name"
                placeholder="A"
                w={160}
              />
              <TextInputField
                name="roomNumber"
                label="Room No. (optional)"
                placeholder="101"
                w={180}
              />
              <Button type="submit" disabled={submitting}>
                Add Section
              </Button>
            </Group>
          </form>
        )}
      </Form>

      <Divider />

      {isLoading ? (
        <Center h={120}>
          <Loader size="sm" />
        </Center>
      ) : !data?.data.length ? (
        <Text c="gray" ta="center" py="lg">
          No sections yet. Add one above.
        </Text>
      ) : (
        <Table
          headers={['Section', 'Room No.', 'Actions']}
          rows={data.data.map((sec) => [
            <Badge variant="light">
              {classItem.name}
              {sec.name}
            </Badge>,
            <Text>{sec.roomNumber || '-'}</Text>,
            <Button
              variant="subtle"
              color="red"
              size="compact-sm"
              leftSection={<IconTrash size={14} />}
              onClick={async () => {
                await api.delete(`/academic/sections/${sec._id}`);
                refresh();
              }}
            >
              Delete
            </Button>,
          ])}
        />
      )}
    </Stack>
  );
}
