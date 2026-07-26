import { useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Stack,
  Group,
  Select,
  Card,
  Text,
  Badge,
  Button,
  Loader,
  Center,
  Divider,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconClipboardCheck,
  IconLock,
  IconUsers,
  IconCircleCheck,
} from '@tabler/icons-react';
import { Heading } from '../../libs/basic/Layout';
import { Table } from '../../libs/basic/Table';
import { api } from '../../libs/XHR/xhr';
import {
  type AttendanceStatus,
  type IAttendanceRecord,
  type IAttendanceSession,
  type IMarkAttendanceBody,
  type IMySection,
  type IRosterStudent,
  ATTENDANCE_STATUSES,
  STATUS_META,
  STATUS_SHORT_LABEL,
} from './store';

// Current academic session — "2025-2026" jaisa. School July me naya session
// shuru karti hai (TeacherDashboard/TimetableManager jaisa hi rule).
function currentSession(): string {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 6 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

// Date -> "YYYY-MM-DD" (local, backend ka canonical dateKey). toISOString UTC me
// shift kar deta hai isliye local getFullYear/Month/Date se banaya hai.
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function sectionLabel(s: IMySection): string {
  const cls = s.class?.name ?? '';
  return [cls, s.name].filter(Boolean).join(' - ') || s.name;
}

function studentName(s: IRosterStudent): string {
  return s.user?.name ?? '—';
}

// Ek student ki current draft state — status + optional remark.
type DraftEntry = { status: AttendanceStatus; remark: string };

export function TakeAttendance() {
  const [session] = useState(currentSession());
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [draft, setDraft] = useState<Record<string, DraftEntry>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [finalizingAttendance, setFinalizingAttendance] = useState(false);

  const dateKey = toDateKey(date);

  // 1. Sirf wahi sections jinka caller class teacher hai.
  const { data: sectionsRes, isLoading: loadingSections } = useSWR(
    '/attendance/my-sections',
    async () => api.get<{ data: IMySection[] }>('/attendance/my-sections'),
  );
  const sections = sectionsRes?.data ?? [];

  // 2. Selected section ka roster (students to mark).
  const { data: rosterRes, isLoading: loadingRoster } = useSWR(
    sectionId ? ['/attendance/roster', sectionId] : null,
    async () =>
      api.get<{ data: IRosterStudent[] }>(
        `/attendance/section/${sectionId}/roster`,
      ),
  );
  const roster = useMemo(() => rosterRes?.data ?? [], [rosterRes]);

  // 3. Us din ka existing register (agar pehle se mark hai) — edit/prefill ke liye.
  const attendanceKey =
    sectionId && dateKey
      ? ['/attendance/section', sectionId, dateKey, session]
      : null;
  const { data: existingRes, isLoading: loadingExisting } = useSWR(
    attendanceKey,
    async () =>
      api.get<{
        data: {
          session: IAttendanceSession | null;
          records: IAttendanceRecord[];
        };
      }>(`/attendance/section/${sectionId}`, {
        params: { date: dateKey, academicSession: session },
      }),
  );

  const existingSession = existingRes?.data.session ?? null;
  const existingRecords = useMemo(
    () => existingRes?.data.records ?? [],
    [existingRes],
  );
  const isFinalized = !!existingSession?.isFinalized;

  // Roster + existing records se draft banao. Pehle se mark hai to wahi status,
  // warna default "present" (sabse common — teacher sirf absentees toggle kare).
  useEffect(() => {
    if (roster.length === 0) return;

    const byStudent: Record<string, IAttendanceRecord> = {};
    for (const r of existingRecords) {
      const sid = typeof r.student === 'string' ? r.student : r.student?._id;
      if (sid) byStudent[sid] = r;
    }

    const next: Record<string, DraftEntry> = {};
    for (const stu of roster) {
      const rec = byStudent[stu._id];
      next[stu._id] = {
        status: rec?.status ?? 'present',
        remark: rec?.remark ?? '',
      };
    }
    setDraft(next);
  }, [roster, existingRecords]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setDraft((d) => ({ ...d, [studentId]: { ...d[studentId], status } }));
  };
  const setRemark = (studentId: string, remark: string) => {
    setDraft((d) => ({ ...d, [studentId]: { ...d[studentId], remark } }));
  };

  // Ek click me sabko present — bada roster ho to fast entry.
  const markAllPresent = () => {
    setDraft((d) => {
      const next = { ...d };
      for (const stu of roster)
        next[stu._id] = { ...next[stu._id], status: 'present' };
      return next;
    });
  };

  // Live summary counts (draft se) — save se pehle preview.
  const summary = useMemo(() => {
    const c: Record<AttendanceStatus, number> = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      half_day: 0,
    };
    for (const stu of roster) {
      const s = draft[stu._id]?.status;
      if (s) c[s] += 1;
    }
    return c;
  }, [draft, roster]);

  const save = async () => {
    if (!sectionId) return;
    setSavingAttendance(true);
    try {
      const body: IMarkAttendanceBody = {
        sectionId,
        date: dateKey,
        academicSession: session,
        entries: roster.map((stu) => ({
          studentId: stu._id,
          status: draft[stu._id]?.status ?? 'present',
          remark: draft[stu._id]?.remark?.trim() || undefined,
        })),
      };
      await api.post('/attendance', body);
      // Register refresh — counts/finalize state dobara load.
      await mutate(attendanceKey);
    } finally {
      setSavingAttendance(false);
    }
  };

  const finalize = async () => {
    if (!existingSession) return;
    setFinalizingAttendance(true);
    try {
      await api.patch(`/attendance/session/${existingSession._id}/finalize`);
      await mutate(attendanceKey);
    } finally {
      setFinalizingAttendance(false);
    }
  };

  const sectionOptions = sections.map((s) => ({
    value: s._id,
    label: sectionLabel(s),
  }));

  const busy = loadingRoster || loadingExisting;

  return (
    <Stack p="lg" gap="lg">
      <Group justify="space-between" align="center">
        <Group gap="xs" align="center">
          <IconClipboardCheck size={24} />
          <Heading>Take Attendance</Heading>
        </Group>
        <Badge variant="light" size="lg">
          Session: {session}
        </Badge>
      </Group>

      {/* SECTION + DATE PICKER */}
      <Card shadow="xs" withBorder radius="md" p="lg">
        {loadingSections ? (
          <Center h={60}>
            <Loader size="sm" />
          </Center>
        ) : sections.length === 0 ? (
          <Text c="dimmed">
            You are not assigned as a class teacher of any section. Only a
            section's class teacher can take its attendance — please contact
            your admin.
          </Text>
        ) : (
          <Group align="end" gap="md">
            <Select
              label="Your Class"
              placeholder="Select section"
              data={sectionOptions}
              value={sectionId}
              onChange={(value) =>
                setSectionId(typeof value === 'string' ? value : null)
              }
              searchable
              w={260}
            />
            <DateInput
              label="Date"
              value={date}
              onChange={(v) => v && setDate(new Date(v))}
              maxDate={new Date()}
              w={200}
            />
          </Group>
        )}
      </Card>

      {/* ROSTER + MARKING */}
      {sectionId && (
        <Card shadow="xs" withBorder radius="md" p="lg">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Group gap="xs" align="center">
                <IconUsers size={18} />
                <Text fw={600} fz="lg">
                  Students
                </Text>
                {isFinalized && (
                  <Badge
                    color="gray"
                    variant="light"
                    leftSection={<IconLock size={12} />}
                  >
                    Finalized
                  </Badge>
                )}
              </Group>
              {!isFinalized && roster.length > 0 && (
                <Button variant="light" size="xs" onClick={markAllPresent}>
                  Mark all present
                </Button>
              )}
            </Group>

            {/* Live summary */}
            <Group gap="sm">
              {ATTENDANCE_STATUSES.map((st) => (
                <Badge key={st} variant="light" color={STATUS_META[st].color}>
                  {STATUS_META[st].label}: {summary[st]}
                </Badge>
              ))}
            </Group>

            <Divider />

            {busy ? (
              <Center h={120}>
                <Loader size="sm" />
              </Center>
            ) : roster.length === 0 ? (
              <Text c="dimmed">No students in this section yet.</Text>
            ) : (
              <Table
                headers={['Roll', 'Name', 'Status', 'Remark']}
                rows={roster.map((stu) => [
                  stu.rollNumber,
                  studentName(stu),
                  isFinalized ? (
                    (() => {
                      const status = draft[stu._id]?.status;
                      const meta = status ? STATUS_META[status] : null;

                      return meta ? (
                        <Tooltip label={meta.label} withArrow>
                          <Badge color={meta.color} variant="light">
                            {meta.label}
                          </Badge>
                        </Tooltip>
                      ) : (
                        <Badge variant="light" color="gray">
                          —
                        </Badge>
                      );
                    })()
                  ) : (
                    <Group gap={4} wrap="nowrap" key={`s-${stu._id}`}>
                      {ATTENDANCE_STATUSES.map((st) => {
                        const active = draft[stu._id]?.status === st;
                        return (
                          <Tooltip
                            label={STATUS_META[st].label}
                            key={st}
                            withArrow
                          >
                            <Button
                              size="compact-xs"
                              variant={active ? 'filled' : 'light'}
                              color={STATUS_META[st].color}
                              onClick={() => setStatus(stu._id, st)}
                            >
                              {STATUS_SHORT_LABEL[st]}
                            </Button>
                          </Tooltip>
                        );
                      })}
                    </Group>
                  ),
                  <TextInput
                    key={`r-${stu._id}`}
                    placeholder="—"
                    size="xs"
                    value={draft[stu._id]?.remark ?? ''}
                    disabled={isFinalized}
                    onChange={(e) => setRemark(stu._id, e.currentTarget.value)}
                  />,
                ])}
              />
            )}

            {!isFinalized && roster.length > 0 && (
              <Group justify="end" gap="md">
                <Button
                  loading={savingAttendance}
                  leftSection={<IconCircleCheck size={16} />}
                  onClick={save}
                >
                  Save Attendance
                </Button>
                {existingSession && (
                  <Tooltip
                    label="Lock this register — no more edits after finalizing"
                    withArrow
                  >
                    <Button
                      variant="light"
                      color="red"
                      loading={finalizingAttendance}
                      leftSection={<IconLock size={16} />}
                      onClick={finalize}
                    >
                      Finalize
                    </Button>
                  </Tooltip>
                )}
              </Group>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
