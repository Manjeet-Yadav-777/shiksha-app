import { useEffect, useState } from 'react';
import { mutate } from 'swr';
import { Button, Stack, Text } from '@mantine/core';
import { Form } from 'react-final-form';
import {
  IconDotsVertical,
  IconTrash,
  IconClipboardList,
} from '@tabler/icons-react';
import { Search } from '../../libs/search/Search';
import { useLocationQuery, useSearch } from '../../utils/filterQuery';
import { ListView } from '../../libs/List/List';
import { Table } from '../../libs/basic/Table';
import { Dialog, useDialog } from '../../libs/basic/Dialog';
import { Inline } from '../../libs/basic/Layout';
import { DropdownMenu } from '../../libs/basic/DropDown';
import { TextInputField } from '../../libs/form/Input';
import { DatenputField } from '../../libs/form/DateInputField';
import { api } from '../../libs/XHR/xhr';
import { formatDate } from '../../helpers/Date';
import type { ITeacher } from './store';
import { ManageAssignments } from './ManageAssignments';

interface ITeacherFormValues {
  name?: string;
  email?: string;
  password?: string;
  employeeId?: string;
  qualification?: string;
  joiningDate?: string | Date;
}

const SWR_KEY = '/teachers';

export function TeacherList() {
  const [query, setQuery] = useLocationQuery();
  const [params, setParams] = useSearch(query);
  const addDialog = useDialog();
  const assignDialog = useDialog();
  const [selected, setSelected] = useState<ITeacher>();

  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);

  return (
    <Search
      title="Teachers"
      placeHolder="Search by name, email or employee ID..."
      onSearch={(p) => setParams(p)}
      actions={
        <>
          <Button onClick={() => addDialog.open()}>Add Teacher</Button>
          <TeacherForm
            isOpened={addDialog.isOpened}
            close={addDialog.close}
            onSubmit={async (values) => {
              await api.post('/teachers', values);
              mutate([SWR_KEY, params]);
              addDialog.close();
            }}
          />
        </>
      }
    >
      {({ setSearchParams }) => (
        <ListView<ITeacher>
          params={params}
          onParamsChange={(newParams) => setSearchParams(newParams)}
          swrKey={SWR_KEY}
          fetchFn={async () => await api.get(SWR_KEY, { params })}
        >
          {(items) => (
            <>
              <Table
                headers={[
                  'Name',
                  'Email',
                  'Employee ID',
                  'Qualification',
                  'Joined',
                  'Actions',
                ]}
                rows={items.map((t) => [
                  <Text fw="bold">{t.user?.name}</Text>,
                  <Text>{t.user?.email}</Text>,
                  <Text>{t.employeeId}</Text>,
                  <Text>{t.qualification || '-'}</Text>,
                  <Text>
                    {t.joiningDate ? formatDate(t.joiningDate) : '-'}
                  </Text>,
                  <DropdownMenu
                    trigger="hover"
                    width={190}
                    items={[
                      {
                        label: (
                          <Inline gap="xs" align="center">
                            <IconClipboardList size={16} />
                            Assignments
                          </Inline>
                        ),
                        onClick: () => {
                          setSelected(t);
                          assignDialog.open();
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
                          await api.delete(`/teachers/${t._id}`);
                          mutate([SWR_KEY, params]);
                        },
                      },
                    ]}
                  >
                    <IconDotsVertical cursor="pointer" size={18} />
                  </DropdownMenu>,
                ])}
              />

              <Dialog
                sizes="70%"
                isOpened={assignDialog.isOpened}
                close={assignDialog.close}
                title={`Assignments - ${selected?.user?.name ?? ''}`}
              >
                {selected && <ManageAssignments teacher={selected} />}
              </Dialog>
            </>
          )}
        </ListView>
      )}
    </Search>
  );
}

function TeacherForm({
  isOpened,
  close,
  onSubmit,
}: {
  isOpened: boolean;
  close: () => void;
  onSubmit: (values: ITeacherFormValues) => void;
}) {
  return (
    <Dialog sizes="55rem" isOpened={isOpened} close={close} title="Add Teacher">
      <Form<ITeacherFormValues>
        initialValues={{ joiningDate: new Date() }}
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
                  placeholder="Ramesh Sharma"
                />
                <TextInputField
                  w="50%"
                  name="employeeId"
                  label="Employee ID"
                  placeholder="EMP-001"
                />
              </Inline>
              <Inline gap="lg">
                <TextInputField
                  w="50%"
                  name="email"
                  label="Email"
                  placeholder="ramesh@school.com"
                />
                <TextInputField
                  w="50%"
                  type="password"
                  name="password"
                  label="Password"
                  placeholder="Min 6 characters"
                />
              </Inline>
              <Inline gap="lg">
                <TextInputField
                  w="50%"
                  name="qualification"
                  label="Qualification (optional)"
                  placeholder="M.Sc, B.Ed"
                />
                <DatenputField name="joiningDate" label="Joining Date" />
              </Inline>
              <Inline justify="end" gap="md">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Teacher'}
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
