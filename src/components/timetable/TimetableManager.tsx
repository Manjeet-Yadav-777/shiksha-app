import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Button,
  Stack,
  Group,
  Select,
  Title,
  Paper,
  Text,
  Badge,
  Loader,
  Center,
} from "@mantine/core";
import { IconClockHour4, IconUserStar } from "@tabler/icons-react";
import { Dialog, useDialog } from "../../libs/basic/Dialog";
import { api } from "../../libs/XHR/xhr";
import type { IListResponse } from "../../libs/XHR/xhr";
import type { IClass } from "../classes/store";
import type { ISection } from "../subjects/store";
import type { ITeacher } from "../teachers/store";
import { ManagePeriodSlots } from "./ManagePeriodSlots";
import { TimetableGrid } from "./TimetableGrid";

// Current academic session ka default — "2025-2026" jaisa. School July me naya
// session shuru karti hai, isliye July+ me year se agla year jodo.
function currentSession(): string {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 6 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export function TimetableManager() {
  const [classId, setClassId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [session] = useState(currentSession());

  const periodsDialog = useDialog();
  const classTeacherDialog = useDialog();

  const { data: classesRes } = useSWR("/academic/classes/all", async () =>
    api.get<IListResponse<IClass>>("/academic/classes", {
      params: { limit: 200 },
    })
  );

  // Selected class ki sections.
  const { data: sectionsRes } = useSWR(
    classId ? ["/academic/sections", classId] : null,
    async () =>
      api.get<{ data: ISection[] }>("/academic/sections", {
        params: { classId },
      })
  );

  const classOptions =
    classesRes?.data.map((c) => ({ value: c._id, label: c.name })) ?? [];
  const sectionOptions =
    sectionsRes?.data.map((s) => ({ value: s._id, label: s.name })) ?? [];

  const selectedSection = sectionsRes?.data.find((s) => s._id === sectionId);
  const classTeacher =
    selectedSection && typeof selectedSection.classTeacher === "object"
      ? selectedSection.classTeacher
      : null;

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between" align="center">
        <Title order={3}>Time Table</Title>
        <Group gap="sm">
          <Text c="gray" fz="sm">
            Session: {session}
          </Text>
          <Button
            variant="light"
            leftSection={<IconClockHour4 size={16} />}
            onClick={periodsDialog.open}
          >
            Manage Periods
          </Button>
        </Group>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Group align="end" gap="md">
          <Select
            label="Class"
            placeholder="Select class"
            data={classOptions}
            value={classId}
            onChange={(v) => {
              setClassId(v);
              setSectionId(null); // class badla to section reset
            }}
            searchable
            w={220}
          />
          <Select
            label="Section"
            placeholder={classId ? "Select section" : "Pick a class first"}
            data={sectionOptions}
            value={sectionId}
            onChange={setSectionId}
            disabled={!classId}
            searchable
            w={220}
          />
          {sectionId && (
            <Button
              variant="light"
              color="grape"
              leftSection={<IconUserStar size={16} />}
              onClick={classTeacherDialog.open}
            >
              {classTeacher ? "Change Class Teacher" : "Set Class Teacher"}
            </Button>
          )}
        </Group>

        {sectionId && (
          <Group gap="xs" mt="md" align="center">
            <Text fz="sm" c="gray">
              Class Teacher:
            </Text>
            {classTeacher ? (
              <Badge
                variant="light"
                color="grape"
                size="lg"
                leftSection={<IconUserStar size={13} />}
              >
                {classTeacher.user?.name ?? "Teacher"} ({classTeacher.employeeId})
              </Badge>
            ) : (
              <Text fz="sm" c="dimmed" fs="italic">
                Not assigned yet
              </Text>
            )}
          </Group>
        )}
      </Paper>

      {sectionId ? (
        <TimetableGrid sectionId={sectionId} academicSession={session} />
      ) : (
        <Text c="gray" ta="center" py="xl">
          Select a class and section to view or build its timetable.
        </Text>
      )}

      <Dialog
        sizes="55rem"
        isOpened={periodsDialog.isOpened}
        close={periodsDialog.close}
        title="Manage Periods (Bell Schedule)"
      >
        <ManagePeriodSlots />
      </Dialog>

      <Dialog
        sizes="45rem"
        isOpened={classTeacherDialog.isOpened}
        close={classTeacherDialog.close}
        title="Set Class Teacher"
      >
        {sectionId && classId && (
          <ClassTeacherForm
            sectionId={sectionId}
            currentTeacherId={classTeacher?._id ?? null}
            onDone={classTeacherDialog.close}
            onSaved={() => mutate(["/academic/sections", classId])}
          />
        )}
      </Dialog>
    </Stack>
  );
}

// Section ka class teacher set/hatane ka form. Yahi teacher aage attendance lega.
function ClassTeacherForm({
  sectionId,
  currentTeacherId,
  onDone,
  onSaved,
}: {
  sectionId: string;
  currentTeacherId: string | null;
  onDone: () => void;
  onSaved: () => void;
}) {
  const { data: teachersRes, isLoading } = useSWR("/teachers/all", async () =>
    api.get<IListResponse<ITeacher>>("/teachers", { params: { limit: 200 } })
  );
  // Current class teacher pre-selected — user ko dikhe abhi kaun set hai.
  const [teacherId, setTeacherId] = useState<string | null>(currentTeacherId);
  const [saving, setSaving] = useState(false);

  const options =
    teachersRes?.data.map((t) => ({
      value: t._id,
      label: `${t.user?.name ?? "Teacher"} (${t.employeeId})`,
    })) ?? [];

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/timetable/section/${sectionId}/class-teacher`, {
        teacherId,
      });
      onSaved();
      onDone();
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Center h={120}>
        <Loader size="sm" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Select
        label="Class Teacher"
        placeholder="Select a teacher"
        data={options}
        value={teacherId}
        onChange={setTeacherId}
        searchable
        clearable
      />
      <Text c="gray" fz="xs">
        This teacher will be responsible for taking attendance for this section.
      </Text>
      <Group justify="end" gap="md">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button variant="default" onClick={onDone}>
          Cancel
        </Button>
      </Group>
    </Stack>
  );
}
