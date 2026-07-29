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
  Progress,
  SimpleGrid,
  RingProgress,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconClock,
  IconChartBar,
} from '@tabler/icons-react';
import { Heading } from '../../libs/basic/Layout';
import { api } from '../../libs/XHR/xhr';
import { useAuthUser } from '../../hooks/auth';
import { type IPeriodSlot, DAYS } from '../timetable/store';
import type { ISubject } from '../subjects/store';
import {
  type AttendanceStatus,
  type IMyAttendance,
  type IMyProfile,
  type IMyTimetableEntry,
  STATUS_META,
} from './store';

// Current academic session — "2025-2026". School July me naya session shuru
// karti hai (TeacherDashboard/backend ke jaisa hi rule).
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

function timeRange(slot?: IPeriodSlot): string {
  if (!slot) return '';
  return `${slot.startTime} - ${slot.endTime}`;
}

function teacherName(e: IMyTimetableEntry): string {
  return e.teacher?.user?.name ?? '—';
}

// 75%+ green, 60-75% yellow, neeche red — attendance % ki health.
function attendanceColor(pct: number): string {
  if (pct >= 75) return 'green';
  if (pct >= 60) return 'yellow';
  return 'red';
}

export function StudentDashboard() {
  const { user } = useAuthUser();
  const [session] = useState(currentSession());

  // 1. Apna profile — class/section/roll. Iske bina "no student linked" state.
  const {
    data: profileRes,
    isLoading: loadingProfile,
    error: profileError,
  } = useSWR('/students/me', async () =>
    api.get<{ data: IMyProfile }>('/students/me'),
  );
  const profile = profileRes?.data;

  // 2. Apni section ka weekly timetable.
  const { data: ttRes, isLoading: loadingTt } = useSWR(
    profile ? ['/students/me/timetable', session] : null,
    async () =>
      api.get<{ data: IMyTimetableEntry[] }>('/students/me/timetable', {
        params: { academicSession: session },
      }),
  );
  const entries = ttRes?.data ?? [];

  // 3. Apni attendance summary.
  const { data: attRes, isLoading: loadingAtt } = useSWR(
    profile ? ['/students/me/attendance', session] : null,
    async () =>
      api.get<{ data: IMyAttendance }>('/students/me/attendance', {
        params: { academicSession: session },
      }),
  );
  const attendance = attRes?.data;

  // JS getDay(): Sun=0, Mon=1 .. Sat=6 — hamare dayOfWeek (Mon=1..Sat=6) se
  // seedha match. Sunday pe koi school din nahi.
  const todayDow = new Date().getDay();
  const todayLabel = DAYS.find((d) => d.value === todayDow)?.label;

  const todaysEntries = entries
    .filter((e) => e.dayOfWeek === todayDow)
    .sort((a, b) => a.periodSlot.periodNumber - b.periodSlot.periodNumber);

  const byDay = DAYS.map((day) => ({
    day,
    rows: entries
      .filter((e) => e.dayOfWeek === day.value)
      .sort((a, b) => a.periodSlot.periodNumber - b.periodSlot.periodNumber),
  }));

  if (loadingProfile) {
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    );
  }

  if (profileError || !profile) {
    return (
      <Center h="60vh">
        <Text c="dimmed" ta="center" maw={420}>
          There is no student profile linked to your account. Please contact
          your school admin.
        </Text>
      </Center>
    );
  }

  const classSection = [profile.class?.name, profile.section?.name]
    .filter(Boolean)
    .join(' - ');

  return (
    <Stack p="lg" gap="lg">
      <Group justify="space-between" align="center">
        <Stack gap={2}>
          <Heading>Hello, {user?.name}</Heading>
          <Group gap="xs">
            {classSection && (
              <Text c="dimmed" fz="sm">
                {classSection}
              </Text>
            )}
            <Text c="dimmed" fz="sm">
              Roll No: {profile.rollNumber}
            </Text>
          </Group>
        </Stack>
        <Badge variant="light" size="lg">
          Session: {session}
        </Badge>
      </Group>

      {/* ATTENDANCE SUMMARY */}
      <Card shadow="xs" withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group gap="xs" align="center">
            <IconChartBar size={20} />
            <Text fw={600} fz="lg">
              Attendance Summary
            </Text>
          </Group>
          <Divider />
          {loadingAtt ? (
            <Center h={120}>
              <Loader size="sm" />
            </Center>
          ) : !attendance || attendance.total === 0 ? (
            <Text c="dimmed">No attendance recorded yet this session.</Text>
          ) : (
            <Group align="center" gap="xl" wrap="wrap">
              <RingProgress
                size={130}
                thickness={12}
                roundCaps
                sections={[
                  {
                    value: attendance.percentage,
                    color: attendanceColor(attendance.percentage),
                  },
                ]}
                label={
                  <Text ta="center" fw={700} fz="lg">
                    {attendance.percentage}%
                  </Text>
                }
              />
              <Stack gap="xs" flex={1} miw={260}>
                <Text fz="sm" c="dimmed">
                  {attendance.total} days recorded
                </Text>
                {(Object.keys(STATUS_META) as AttendanceStatus[]).map(
                  (status) => {
                    const count = attendance.breakdown[status] ?? 0;
                    const pct =
                      attendance.total > 0
                        ? (count / attendance.total) * 100
                        : 0;
                    return (
                      <Group key={status} gap="sm" wrap="nowrap">
                        <Text fz="sm" w={90}>
                          {STATUS_META[status].label}
                        </Text>
                        <Progress
                          flex={1}
                          value={pct}
                          color={STATUS_META[status].color}
                          size="lg"
                        />
                        <Text fz="sm" w={30} ta="right">
                          {count}
                        </Text>
                      </Group>
                    );
                  },
                )}
              </Stack>
            </Group>
          )}
        </Stack>
      </Card>

      {/* AAJ KA SCHEDULE */}
      <Card shadow="xs" withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group gap="xs" align="center">
            <IconCalendarEvent size={20} />
            <Text fw={600} fz="lg">
              Today's Classes
            </Text>
            {todayLabel && (
              <Badge variant="light" color="blue">
                {todayLabel}
              </Badge>
            )}
          </Group>
          <Divider />
          {loadingTt ? (
            <Center h={80}>
              <Loader size="sm" />
            </Center>
          ) : !todayLabel ? (
            <Text c="dimmed">Today is a holiday.</Text>
          ) : todaysEntries.length === 0 ? (
            <Text c="dimmed">No classes scheduled today.</Text>
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
                    <Text fz="sm">{teacherName(e)}</Text>
                    {(e.room || profile.section?.roomNumber) && (
                      <Text fz="sm" c="dimmed">
                        Room {e.room || profile.section?.roomNumber}
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
            Weekly Timetable
          </Text>
          <Divider />
          {loadingTt ? (
            <Center h={120}>
              <Loader size="sm" />
            </Center>
          ) : entries.length === 0 ? (
            <Text c="dimmed">No timetable has been set up yet.</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
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
                      No classes
                    </Text>
                  ) : (
                    <MantineTable withTableBorder withColumnBorders>
                      <MantineTable.Thead>
                        <MantineTable.Tr>
                          <MantineTable.Th>Time</MantineTable.Th>
                          <MantineTable.Th>Subject</MantineTable.Th>
                          <MantineTable.Th>Teacher</MantineTable.Th>
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
                            <MantineTable.Td>{teacherName(e)}</MantineTable.Td>
                          </MantineTable.Tr>
                        ))}
                      </MantineTable.Tbody>
                    </MantineTable>
                  )}
                </Stack>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
