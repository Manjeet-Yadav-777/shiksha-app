import { useEffect, useState } from 'react';
import { mutate } from 'swr';
import { Button, Stack, Text, Badge, Group } from '@mantine/core';
import { Form } from 'react-final-form';
import {
  IconDotsVertical,
  IconTrash,
  IconRestore,
  IconUsersGroup,
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
import type { IParent } from './store';
import { ManageChildren } from './ManageChildren';

interface IParentFormValues {
  name?: string;
  email?: string;
  password?: string;
  occupation?: string;
}

const SWR_KEY = '/parents';

export function ParentList() {
  const [query, setQuery] = useLocationQuery();
  const [params, setParams] = useSearch(query);
  const addDialog = useDialog();
  const childrenDialog = useDialog();
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);

  const archived = (params as { archived?: boolean }).archived;

  return (
    <Search
      title="Parents"
      placeHolder="Search by name or email..."
      onSearch={(p) => setParams(p)}
      actions={
        <>
          <Button onClick={() => addDialog.open()}>Add Parent</Button>
          <ParentForm
            isOpened={addDialog.isOpened}
            close={addDialog.close}
            onSubmit={async (values) => {
              await api.post('/parents', values);
              mutate([SWR_KEY, params]);
              addDialog.close();
            }}
          />
        </>
      }
    >
      {({ setSearchParams }) => (
        <ListView<IParent>
          params={params}
          onParamsChange={(newParams) => setSearchParams(newParams)}
          swrKey={SWR_KEY}
          fetchFn={async () => await api.get(SWR_KEY, { params })}
        >
          {(items) => {
            const selected = items.find((p) => p._id === selectedParentId);

            return (
              <>
                <Table
                  headers={[
                    'Name',
                    'Email',
                    'Occupation',
                    'Children',
                    'Actions',
                  ]}
                  rows={items.map((p) => [
                    <Text fw="bold">{p.user?.name}</Text>,
                    <Text>{p.user?.email}</Text>,
                    <Text>{p.occupation || '-'}</Text>,
                    p.students?.length ? (
                      <Group gap={4}>
                        {p.students.map((s) => (
                          <Badge key={s._id} variant="light" size="sm">
                            {s.user?.name ?? 'Student'}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text c="dimmed" fz="sm">
                        None
                      </Text>
                    ),
                    <DropdownMenu
                      trigger="hover"
                      width={190}
                      items={[
                        {
                          label: (
                            <Inline gap="xs" align="center">
                              <IconUsersGroup size={16} />
                              Manage Children
                            </Inline>
                          ),
                          onClick: () => {
                            setSelectedParentId(p._id);
                            childrenDialog.open();
                          },
                        },
                        archived
                          ? {
                              label: (
                                <Inline c="orange" gap="xs" align="center">
                                  <IconRestore size={16} />
                                  Restore
                                </Inline>
                              ),
                              onClick: async () => {
                                await api.patch(`/parents/${p._id}/restore`);
                                mutate([SWR_KEY, params]);
                              },
                            }
                          : {
                              label: (
                                <Inline c="red" gap="xs" align="center">
                                  <IconTrash size={16} />
                                  Archive
                                </Inline>
                              ),
                              onClick: async () => {
                                await api.delete(`/parents/${p._id}`);
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
                  sizes="55rem"
                  isOpened={childrenDialog.isOpened}
                  close={childrenDialog.close}
                  title={`Children - ${selected?.user?.name ?? ''}`}
                >
                  {selected && (
                    <ManageChildren
                      parent={selected}
                      onChanged={() => mutate([SWR_KEY, params])}
                    />
                  )}
                </Dialog>
              </>
            );
          }}
        </ListView>
      )}
    </Search>
  );
}

function ParentForm({
  isOpened,
  close,
  onSubmit,
}: {
  isOpened: boolean;
  close: () => void;
  onSubmit: (values: IParentFormValues) => void;
}) {
  return (
    <Dialog sizes="45rem" isOpened={isOpened} close={close} title="Add Parent">
      <Form<IParentFormValues> onSubmit={(v) => onSubmit(v)}>
        {({ handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Inline gap="lg">
                <TextInputField
                  w="50%"
                  name="name"
                  label="Full Name"
                  placeholder="Sunita Verma"
                />
                <TextInputField
                  w="50%"
                  name="occupation"
                  label="Occupation (optional)"
                  placeholder="Engineer"
                />
              </Inline>
              <Inline gap="lg">
                <TextInputField
                  w="50%"
                  name="email"
                  label="Email"
                  placeholder="sunita@example.com"
                />
                <TextInputField
                  w="50%"
                  type="password"
                  name="password"
                  label="Password"
                  placeholder="Min 6 characters"
                />
              </Inline>
              <Inline justify="end" gap="md">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Parent'}
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
