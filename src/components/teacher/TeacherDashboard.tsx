import { useState } from 'react';
import useSWR from 'swr';
import {
  Stack,
  Text,
  Badge,
  Group,
  Card,
  Loader,
  Center,
  Table as MantineTable,
  Divider,
} from '@mantine/core';
import { IconCalendarEvent, IconClock } from '@tabler/icons-react';
import { Heading } from '../../libs/basic/Layout';
import { api } from '../../libs/XHR/xhr';
import { useAuthUser } from '../../hooks/auth';
import { type IPeriodSlot, DAYS } from '../timetable/store';
import type { ISubject } from '../subjects/store';
import type { IClass } from '../classes/store';

// getTeacherTimetable populated shape — section me class bhi populated aata hai.
interface ITeacherEntry {
  _id: string;
  dayOfWeek: number; // 1=Mon .. 6=Sat
  periodSlot: IPeriodSlot;
  subject: ISubject;
  section?: { _id: string; name: string; class?: IClass; roomNumber?: string };
  room?: string;
  academicSession: string;
}

// Current academic session — "2025-2026" jaisa. School July me naya session
// shuru karti hai (TimetableManager ke jaisa hi rule).
function currentSession(): string {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 6 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

const SUBJECT_COLOR: Record<string, string> = {
  core: 'blue',
  elective: 'grape',
  activity: 'teal',
};

function subjectName(s?: ISubject): string {
  return s?.name ?? '—';
}

function sectionLabel(e: ITeacherEntry): string {
  const cls = e.section?.class?.name ?? '';
  const sec = e.section?.name ?? '';
  return [cls, sec].filter(Boolean).join(' - ') || '—';
}

function timeRange(slot?: IPeriodSlot): string {
  if (!slot) return '';
  return `${slot.startTime} - ${slot.endTime}`;
}

export function TeacherDashboard() {
  const { user } = useAuthUser();
  const [session] = useState(currentSession());
  const teacherId = user?.teacherProfile;

  const { data, isLoading } = useSWR(
    teacherId ? ['/timetable/teacher', teacherId, session] : null,
    async () =>
      api.get<{ data: ITeacherEntry[] }>(`/timetable/teacher/${teacherId}`, {
        params: { academicSession: session },
      }),
  );

  const entries = data?.data ?? [];

  // JS getDay(): Sun=0, Mon=1 .. Sat=6 — hamare dayOfWeek (Mon=1..Sat=6) se
  // seedha match karta hai. Sunday (0) pe koi school din nahi.
  const todayDow = new Date().getDay();
  const todayLabel = DAYS.find((d) => d.value === todayDow)?.label;

  const todaysEntries = entries
    .filter((e) => e.dayOfWeek === todayDow)
    .sort((a, b) => a.periodSlot.periodNumber - b.periodSlot.periodNumber);

  // Poore week ke liye day → periodNumber ke hisaab se group.
  const byDay = DAYS.map((day) => ({
    day,
    rows: entries
      .filter((e) => e.dayOfWeek === day.value)
      .sort((a, b) => a.periodSlot.periodNumber - b.periodSlot.periodNumber),
  }));

  if (!teacherId) {
    return (
      <Center h="60vh">
        <Text c="dimmed">
          There is No teacher profile linked to you. Please contact to your
          admin.
        </Text>
      </Center>
    );
  }

  return (
    <Stack p="lg" gap="lg">
      <Group justify="space-between" align="center">
        <Heading>Hello, {user?.name}</Heading>
        <Badge variant="light" size="lg">
          Session: {session}
        </Badge>
      </Group>

      {/* AAJ KA SCHEDULE */}
      <Card shadow="xs" withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group gap="xs" align="center">
            <IconCalendarEvent size={20} />
            <Text fw={600} fz="lg">
              Your Today's Schedule
            </Text>
            {todayLabel && (
              <Badge variant="light" color="blue">
                {todayLabel}
              </Badge>
            )}
          </Group>
          <Divider />
          {isLoading ? (
            <Center h={80}>
              <Loader size="sm" />
            </Center>
          ) : !todayLabel ? (
            <Text c="dimmed">Today is leave.</Text>
          ) : todaysEntries.length === 0 ? (
            <Text c="dimmed">There is no class assigned today.</Text>
          ) : (
            <Stack gap="xs">
              {todaysEntries.map((e) => (
                <Group
                  key={e._id}
                  justify="space-between"
                  wrap="nowrap"
                  p="xs"
                  style={{
                    borderLeft: '3px solid var(--mantine-color-blue-5)',
                  }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <IconClock size={16} color="gray" />
                    <Text fw={500} w={110}>
                      {timeRange(e.periodSlot)}
                    </Text>
                    <Badge
                      color={SUBJECT_COLOR[e.subject?.type ?? ''] ?? 'gray'}
                      variant="light"
                    >
                      {subjectName(e.subject)}
                    </Badge>
                  </Group>
                  <Group gap="sm">
                    <Text fz="sm">{sectionLabel(e)}</Text>
                    {(e.room || e.section?.roomNumber) && (
                      <Text fz="sm" c="dimmed">
                        Room {e.room || e.section?.roomNumber}
                      </Text>
                    )}
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* POORA WEEK */}
      <Card shadow="xs" withBorder radius="md" p="lg">
        <Stack gap="md">
          <Text fw={600} fz="lg">
            Your Weekly timetable
          </Text>
          <Divider />
          {isLoading ? (
            <Center h={120}>
              <Loader size="sm" />
            </Center>
          ) : entries.length === 0 ? (
            <Text c="dimmed">Abhi koi period assigned nahi hai.</Text>
          ) : (
            <Stack gap="lg">
              {byDay.map(({ day, rows }) => (
                <Stack key={day.value} gap="xs">
                  <Text
                    fw={600}
                    c={day.value === todayDow ? 'blue' : undefined}
                  >
                    {day.label}
                  </Text>
                  {rows.length === 0 ? (
                    <Text fz="sm" c="dimmed" pl="sm">
                      Koi class nahi
                    </Text>
                  ) : (
                    <MantineTable withTableBorder withColumnBorders>
                      <MantineTable.Thead>
                        <MantineTable.Tr>
                          <MantineTable.Th>Time</MantineTable.Th>
                          <MantineTable.Th>Subject</MantineTable.Th>
                          <MantineTable.Th>Class</MantineTable.Th>
                          <MantineTable.Th>Room</MantineTable.Th>
                        </MantineTable.Tr>
                      </MantineTable.Thead>
                      <MantineTable.Tbody>
                        {rows.map((e) => (
                          <MantineTable.Tr key={e._id}>
                            <MantineTable.Td>
                              {timeRange(e.periodSlot)}
                            </MantineTable.Td>
                            <MantineTable.Td>
                              <Badge
                                color={
                                  SUBJECT_COLOR[e.subject?.type ?? ''] ?? 'gray'
                                }
                                variant="light"
                              >
                                {subjectName(e.subject)}
                              </Badge>
                            </MantineTable.Td>
                            <MantineTable.Td>{sectionLabel(e)}</MantineTable.Td>
                            <MantineTable.Td>
                              {e.room || e.section?.roomNumber || '—'}
                            </MantineTable.Td>
                          </MantineTable.Tr>
                        ))}
                      </MantineTable.Tbody>
                    </MantineTable>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
