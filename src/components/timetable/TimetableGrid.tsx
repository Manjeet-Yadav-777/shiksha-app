import { useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Button,
  Stack,
  Text,
  Badge,
  Group,
  Loader,
  Center,
  Table as MantineTable,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { Form, Field, useForm, useFormState } from 'react-final-form';
import { IconPlus, IconTrash, IconPencil } from '@tabler/icons-react';
import { Select } from '@mantine/core';
import { Dialog, useDialog } from '../../libs/basic/Dialog';
import { Inline } from '../../libs/basic/Layout';
import { SelectInputField } from '../../libs/form/SelectInputField';
import { TextInputField } from '../../libs/form/Input';
import { api } from '../../libs/XHR/xhr';
import type { IListResponse } from '../../libs/XHR/xhr';
import { notifications } from '@mantine/notifications';
import type { IPeriodSlot, ITimetableEntry } from './store';
import { DAYS } from './store';
import type { ISubject } from '../subjects/store';
import type { ITeacher } from '../teachers/store';

interface Props {
  sectionId: string;
  academicSession: string;
}

interface IEntryFormValues {
  subjectId?: string;
  teacherId?: string;
  room?: string;
}

// Ek section ka poora weekly timetable — rows = periods, columns = din.
// Har cell click karke us din+period pe class assign/edit hoti hai.
export function TimetableGrid({ sectionId, academicSession }: Props) {
  const entriesKey = ['/timetable/section', sectionId, academicSession];
  const slotsKey = '/timetable/period-slots';

  const { data: entriesRes, isLoading: entriesLoading } = useSWR(
    entriesKey,
    async () =>
      api.get<{ data: ITimetableEntry[] }>(`/timetable/section/${sectionId}`, {
        params: { academicSession },
      }),
  );
  console.log(entriesRes, 'Hello');

  const { data: slotsRes, isLoading: slotsLoading } = useSWR(
    slotsKey,
    async () => api.get<{ data: IPeriodSlot[] }>(slotsKey),
  );

  // Dropdowns: tenant-wide subjects + teachers.
  const { data: subjectsRes } = useSWR('/academic/subjects/all', async () =>
    api.get<IListResponse<ISubject>>('/academic/subjects', {
      params: { limit: 200 },
    }),
  );
  const dialog = useDialog();
  const [active, setActive] = useState<{
    day: number;
    slot: IPeriodSlot;
    entry?: ITimetableEntry;
  } | null>(null);

  const slots = useMemo(
    () =>
      (slotsRes?.data ?? [])
        .slice()
        .sort((a, b) => a.periodNumber - b.periodNumber),
    [slotsRes],
  );
  const entries = entriesRes?.data ?? [];

  // (day, periodSlotId) -> entry, taaki har cell ko O(1) me resolve kar saken.
  const cellMap = useMemo(() => {
    const map = new Map<string, ITimetableEntry>();
    for (const e of entries) {
      const slotId =
        typeof e.periodSlot === 'string' ? e.periodSlot : e.periodSlot._id;
      map.set(`${e.dayOfWeek}-${slotId}`, e);
    }
    return map;
  }, [entries]);

  const subjectOptions =
    subjectsRes?.data.map((s) => ({
      value: s._id,
      label: `${s.name} (${s.code})`,
    })) ?? [];

  const refresh = () => mutate(entriesKey);

  const openCell = (
    day: number,
    slot: IPeriodSlot,
    entry?: ITimetableEntry,
  ) => {
    setActive({ day, slot, entry });
    dialog.open();
  };

  const handleSubmit = async (values: IEntryFormValues) => {
    if (!active) return;
    const payload = {
      sectionId,
      dayOfWeek: active.day,
      periodSlotId: active.slot._id,
      subjectId: values.subjectId,
      teacherId: values.teacherId,
      academicSession,
      room: values.room,
    };
    try {
      if (active.entry) {
        await api.put(`/timetable/entries/${active.entry._id}`, payload);
      } else {
        await api.post('/timetable/entries', payload);
      }
      dialog.close();
      setActive(null);
      refresh();
    } catch (err: any) {
      // Clash (409) ka message backend se aata hai — user ko dikhao.
      notifications.show({
        color: 'red',
        title: 'Could not save',
        message: err?.response?.data?.error ?? 'Something went wrong',
      });
    }
  };

  const handleDelete = async (entry: ITimetableEntry) => {
    await api.delete(`/timetable/entries/${entry._id}`);
    refresh();
  };

  if (slotsLoading || entriesLoading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  if (!slots.length) {
    return (
      <Text c="gray" ta="center" py="xl">
        No periods defined yet. Set up the bell schedule (Manage Periods) first.
      </Text>
    );
  }

  const subjName = (e: ITimetableEntry) =>
    typeof e.subject === 'string' ? '' : e.subject.name;
  const teacherName = (e: ITimetableEntry) =>
    typeof e.teacher === 'string' ? '' : (e.teacher.user?.name ?? '');

  return (
    <Stack gap="md">
      <MantineTable withTableBorder withColumnBorders striped highlightOnHover>
        <MantineTable.Thead>
          <MantineTable.Tr>
            <MantineTable.Th style={{ width: 120 }}>Period</MantineTable.Th>
            {DAYS.map((d) => (
              <MantineTable.Th key={d.value} ta="center">
                {d.short}
              </MantineTable.Th>
            ))}
          </MantineTable.Tr>
        </MantineTable.Thead>
        <MantineTable.Tbody>
          {slots.map((slot) => (
            <MantineTable.Tr key={slot._id}>
              <MantineTable.Td>
                <Text fw="bold" fz="sm">
                  {slot.label || `Period ${slot.periodNumber}`}
                </Text>
                <Text c="gray" fz="xs">
                  {slot.startTime}-{slot.endTime}
                </Text>
              </MantineTable.Td>

              {DAYS.map((d) => {
                if (slot.isBreak) {
                  return (
                    <MantineTable.Td key={d.value} bg="#fff7ed" ta="center">
                      <Badge variant="light" color="orange" size="sm">
                        {slot.label || 'Break'}
                      </Badge>
                    </MantineTable.Td>
                  );
                }

                const entry = cellMap.get(`${d.value}-${slot._id}`);

                if (!entry) {
                  return (
                    <MantineTable.Td key={d.value} ta="center">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => openCell(d.value, slot)}
                        aria-label="Add class"
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </MantineTable.Td>
                  );
                }

                return (
                  <MantineTable.Td key={d.value}>
                    <Group justify="space-between" gap={4} wrap="nowrap">
                      <div>
                        <Text fw={600} fz="sm">
                          {subjName(entry)}
                        </Text>
                        <Text c="gray" fz="xs">
                          {teacherName(entry)}
                        </Text>
                      </div>
                      <Group gap={2} wrap="nowrap">
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => openCell(d.value, slot, entry)}
                          >
                            <IconPencil size={13} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Remove">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => handleDelete(entry)}
                          >
                            <IconTrash size={13} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                  </MantineTable.Td>
                );
              })}
            </MantineTable.Tr>
          ))}
        </MantineTable.Tbody>
      </MantineTable>

      <Dialog
        sizes="45rem"
        isOpened={dialog.isOpened}
        close={() => {
          dialog.close();
          setActive(null);
        }}
        title={
          active
            ? `${active.entry ? 'Edit' : 'Add'} class — ${
                DAYS.find((d) => d.value === active.day)?.label
              }, ${active.slot.label || `Period ${active.slot.periodNumber}`}`
            : ''
        }
      >
        <Form<IEntryFormValues>
          initialValues={
            active?.entry
              ? {
                  subjectId:
                    typeof active.entry.subject === 'string'
                      ? active.entry.subject
                      : active.entry.subject._id,
                  teacherId:
                    typeof active.entry.teacher === 'string'
                      ? active.entry.teacher
                      : active.entry.teacher._id,
                  room: active.entry.room,
                }
              : {}
          }
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, submitting }) => (
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                <SelectInputField
                  name="subjectId"
                  label="Subject"
                  placeholder="Select subject"
                  data={subjectOptions}
                  searchable
                />
                <EligibleTeacherField sectionId={sectionId} />
                <TextInputField
                  name="room"
                  label="Room (optional)"
                  placeholder="Defaults to section room"
                />
                <Inline justify="end" gap="md">
                  <Button type="submit" disabled={submitting}>
                    {active?.entry ? 'Update' : 'Add'} class
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      dialog.close();
                      setActive(null);
                    }}
                  >
                    Cancel
                  </Button>
                </Inline>
              </Stack>
            </form>
          )}
        </Form>
      </Dialog>
    </Stack>
  );
}

// Teacher dropdown jo chune hue subject pe depend karta hai: sirf woh teachers
// dikhta hai jinhe wo subject is section/class me assign hai. Subject change hone
// pe, agar pehle se select teacher nayi list me nahi hai to selection clear ho
// jaati hai (warna galat pairing submit ho jaati).
function EligibleTeacherField({ sectionId }: { sectionId: string }) {
  const form = useForm();
  const { values } = useFormState<IEntryFormValues>();
  const subjectId = values.subjectId;

  const { data, isLoading } = useSWR(
    subjectId ? ['/timetable/eligible-teachers', sectionId, subjectId] : null,
    async () =>
      api.get<{ data: ITeacher[] }>('/timetable/eligible-teachers', {
        params: { sectionId, subjectId },
      }),
  );

  const teachers = data?.data ?? [];
  const options = teachers.map((t) => ({
    value: t._id,
    label: `${t.user?.name ?? 'Teacher'} (${t.employeeId})`,
  }));

  // Subject badla aur current teacher ab eligible nahi -> reset.
  useEffect(() => {
    if (!subjectId) return;
    if (isLoading) return;
    const current = values.teacherId;
    if (current && !teachers.some((t) => t._id === current)) {
      form.change('teacherId', undefined);
    }
  }, [subjectId, isLoading, teachers, values.teacherId, form]);

  return (
    <Field<string | undefined> name="teacherId">
      {({ input }) => (
        <Select
          label="Teacher"
          placeholder={
            !subjectId
              ? 'Select a subject first'
              : isLoading
                ? 'Loading teachers...'
                : options.length
                  ? 'Select teacher'
                  : 'No teacher assigned to this subject'
          }
          data={options}
          value={input.value || null}
          onChange={input.onChange}
          disabled={!subjectId || isLoading || !options.length}
          searchable
        />
      )}
    </Field>
  );
}
