import { useEffect, useMemo, useState } from 'react';
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
  RingProgress,
  Select,
  SimpleGrid,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconChartBar,
  IconReceipt2,
  IconUser,
} from '@tabler/icons-react';
import { Heading } from '../../libs/basic/Layout';
import { api } from '../../libs/XHR/xhr';
import { useAuthUser } from '../../hooks/auth';
import { type IPeriodSlot, DAYS } from '../timetable/store';
import type { ISubject } from '../subjects/store';
import {
  type AttendanceStatus,
  type IChild,
  type IChildAttendance,
  type IChildFees,
  type IChildTimetableEntry,
  STATUS_META,
  FEE_STATUS_COLOR,
} from './store';

// Session rule backend/dashboards jaisa hi — July+ me naya session.
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

function attendanceColor(pct: number): string {
  if (pct >= 75) return 'green';
  if (pct >= 60) return 'yellow';
  return 'red';
}

export function ParentPortal() {
  const { user } = useAuthUser();
  const [session] = useState(currentSession());
  const [childId, setChildId] = useState<string | null>(null);

  // 1. Apne bachche — child selector isi se banta hai.
  const {
    data: childrenRes,
    isLoading: loadingChildren,
    error,
  } = useSWR(`/parents/me/children/${user?._id}`, async () =>
    api.get<{ data: IChild[] }>('/parents/me/children'),
  );
  const children = useMemo(() => {
    return childrenRes?.data ?? [];
  }, [childrenRes?.data]);

  // Pehla bachcha default select.
  useEffect(() => {
    if (children.length === 0) {
      setChildId(null);
      return;
    }

    const exists = children.some((c) => c._id === childId);

    if (!exists) {
      setChildId(children[0]._id);
    }
  }, [children, childId]);

  const selectedChild = children.find((c) => c._id === childId);

  // 2. Selected child ki attendance.
  const { data: attRes, isLoading: loadingAtt } = useSWR(
    childId ? ['/parents/attendance', childId, session] : null,
    async () =>
      api.get<{ data: IChildAttendance }>(
        `/parents/me/children/${childId}/attendance`,
        { params: { academicSession: session } },
      ),
  );
  const attendance = attRes?.data;

  // 3. Timetable.
  const { data: ttRes, isLoading: loadingTt } = useSWR(
    childId ? ['/parents/timetable', childId, session] : null,
    async () =>
      api.get<{ data: IChildTimetableEntry[] }>(
        `/parents/me/children/${childId}/timetable`,
        { params: { academicSession: session } },
      ),
  );
  const entries = ttRes?.data ?? [];

  // 4. Fees.
  const { data: feesRes, isLoading: loadingFees } = useSWR(
    childId ? ['/parents/fees', childId] : null,
    async () =>
      api.get<{ data: IChildFees }>(`/parents/me/children/${childId}/fees`),
  );
  const fees = feesRes?.data;

  const todayDow = new Date().getDay();
  const byDay = DAYS.map((day) => ({
    day,
    rows: entries
      .filter((e) => e.dayOfWeek === day.value)
      .sort((a, b) => a.periodSlot.periodNumber - b.periodSlot.periodNumber),
  }));

  if (loadingChildren) {
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    );
  }

  if (error || children.length === 0) {
    return (
      <Center h="60vh">
        <Text c="dimmed" ta="center" maw={440}>
          No children are linked to your account yet. Please contact your school
          admin to link your child.
        </Text>
      </Center>
    );
  }

  return (
    <Stack p="lg" gap="lg">
      <Group justify="space-between" align="center" wrap="wrap">
        <Stack gap={2}>
          <Heading>Hello, {user?.name}</Heading>
          <Text c="dimmed" fz="sm">
            Viewing your child's school updates
          </Text>
        </Stack>
        <Group gap="sm" align="center">
          <Select
            label="Child"
            data={children.map((c) => ({
              value: c._id,
              label: c.user?.name ?? 'Student',
            }))}
            value={childId}
            onChange={setChildId}
            allowDeselect={false}
            w={200}
          />
          <Badge variant="light" size="lg" mt={22}>
            Session: {session}
          </Badge>
        </Group>
      </Group>

      {/* CHILD BASICS */}
      <Card shadow="xs" withBorder radius="md" p="lg">
        <Group gap="xs" align="center" mb="sm">
          <IconUser size={20} />
          <Text fw={600} fz="lg">
            Student Details
          </Text>
        </Group>
        <Divider mb="md" />
        {selectedChild && (
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
            <Detail label="Name" value={selectedChild.user?.name ?? '—'} />
            <Detail
              label="Class"
              value={
                [selectedChild.class?.name, selectedChild.section?.name]
                  .filter(Boolean)
                  .join(' - ') || '—'
              }
            />
            <Detail label="Roll No" value={selectedChild.rollNumber} />
            <Detail
              label="Admission No"
              value={selectedChild.admissionNumber}
            />
          </SimpleGrid>
        )}
      </Card>

      {/* ATTENDANCE + FEES SUMMARY SIDE BY SIDE */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* ATTENDANCE */}
        <Card shadow="xs" withBorder radius="md" p="lg">
          <Group gap="xs" align="center" mb="sm">
            <IconChartBar size={20} />
            <Text fw={600} fz="lg">
              Attendance
            </Text>
          </Group>
          <Divider mb="md" />
          {loadingAtt ? (
            <Center h={120}>
              <Loader size="sm" />
            </Center>
          ) : !attendance || attendance.total === 0 ? (
            <Text c="dimmed">No attendance recorded yet this session.</Text>
          ) : (
            <Group align="center" gap="lg" wrap="nowrap">
              <RingProgress
                size={120}
                thickness={12}
                roundCaps
                sections={[
                  {
                    value: attendance.percentage,
                    color: attendanceColor(attendance.percentage),
                  },
                ]}
                label={
                  <Text ta="center" fw={700}>
                    {attendance.percentage}%
                  </Text>
                }
              />
              <Stack gap={6} flex={1}>
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
                      <Group key={status} gap="xs" wrap="nowrap">
                        <Text fz="xs" w={70}>
                          {STATUS_META[status].label}
                        </Text>
                        <Progress
                          flex={1}
                          value={pct}
                          color={STATUS_META[status].color}
                          size="md"
                        />
                        <Text fz="xs" w={24} ta="right">
                          {count}
                        </Text>
                      </Group>
                    );
                  },
                )}
              </Stack>
            </Group>
          )}
        </Card>

        {/* FEES */}
        <Card shadow="xs" withBorder radius="md" p="lg">
          <Group gap="xs" align="center" mb="sm">
            <IconReceipt2 size={20} />
            <Text fw={600} fz="lg">
              Fees
            </Text>
          </Group>
          <Divider mb="md" />
          {loadingFees ? (
            <Center h={120}>
              <Loader size="sm" />
            </Center>
          ) : !fees || fees.fees.length === 0 ? (
            <Text c="dimmed">No fees assigned yet.</Text>
          ) : (
            <Stack gap="md">
              <Group grow>
                <SummaryStat
                  label="Total"
                  value={fees.summary.totalDue}
                  color="dark"
                />
                <SummaryStat
                  label="Paid"
                  value={fees.summary.totalPaid}
                  color="green"
                />
                <SummaryStat
                  label="Outstanding"
                  value={fees.summary.outstanding}
                  color={fees.summary.outstanding > 0 ? 'red' : 'green'}
                />
              </Group>
              <MantineTable withTableBorder>
                <MantineTable.Thead>
                  <MantineTable.Tr>
                    <MantineTable.Th>Fee</MantineTable.Th>
                    <MantineTable.Th>Amount</MantineTable.Th>
                    <MantineTable.Th>Paid</MantineTable.Th>
                    <MantineTable.Th>Status</MantineTable.Th>
                  </MantineTable.Tr>
                </MantineTable.Thead>
                <MantineTable.Tbody>
                  {fees.fees.map((f) => (
                    <MantineTable.Tr key={f._id}>
                      <MantineTable.Td>
                        {f.feeStructure?.name ?? '—'}
                      </MantineTable.Td>
                      <MantineTable.Td>
                        ₹{f.netAmount.toLocaleString('en-IN')}
                      </MantineTable.Td>
                      <MantineTable.Td>
                        ₹{f.amountPaid.toLocaleString('en-IN')}
                      </MantineTable.Td>
                      <MantineTable.Td>
                        <Badge
                          variant="light"
                          color={FEE_STATUS_COLOR[f.status] ?? 'gray'}
                        >
                          {f.status}
                        </Badge>
                      </MantineTable.Td>
                    </MantineTable.Tr>
                  ))}
                </MantineTable.Tbody>
              </MantineTable>
            </Stack>
          )}
        </Card>
      </SimpleGrid>

      {/* WEEKLY TIMETABLE */}
      <Card shadow="xs" withBorder radius="md" p="lg">
        <Group gap="xs" align="center" mb="sm">
          <IconCalendarEvent size={20} />
          <Text fw={600} fz="lg">
            Weekly Timetable
          </Text>
        </Group>
        <Divider mb="md" />
        {loadingTt ? (
          <Center h={120}>
            <Loader size="sm" />
          </Center>
        ) : entries.length === 0 ? (
          <Text c="dimmed">No timetable set for this section yet.</Text>
        ) : (
          <Stack gap="lg">
            {byDay.map(({ day, rows }) => (
              <Stack key={day.value} gap="xs">
                <Text fw={600} c={day.value === todayDow ? 'blue' : undefined}>
                  {day.label}
                </Text>
                {rows.length === 0 ? (
                  <Text fz="sm" c="dimmed" pl="sm">
                    No class
                  </Text>
                ) : (
                  <MantineTable withTableBorder withColumnBorders>
                    <MantineTable.Thead>
                      <MantineTable.Tr>
                        <MantineTable.Th>Time</MantineTable.Th>
                        <MantineTable.Th>Subject</MantineTable.Th>
                        <MantineTable.Th>Teacher</MantineTable.Th>
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
                          <MantineTable.Td>
                            {e.teacher?.user?.name ?? '—'}
                          </MantineTable.Td>
                          <MantineTable.Td>{e.room ?? '—'}</MantineTable.Td>
                        </MantineTable.Tr>
                      ))}
                    </MantineTable.Tbody>
                  </MantineTable>
                )}
              </Stack>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={2}>
      <Text fz="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={500}>{value}</Text>
    </Stack>
  );
}

function SummaryStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Stack gap={0} align="center">
      <Text fz="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={700} c={color}>
        ₹{value.toLocaleString('en-IN')}
      </Text>
    </Stack>
  );
}
