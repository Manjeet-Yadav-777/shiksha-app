import useSWR, { mutate } from "swr";
import {
  Button,
  Stack,
  Text,
  Badge,
  Group,
  Divider,
  Loader,
  Center,
  Select,
} from "@mantine/core";
import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";
import { Table } from "../../libs/basic/Table";
import { Inline } from "../../libs/basic/Layout";
import { api } from "../../libs/XHR/xhr";
import type { IListResponse } from "../../libs/XHR/xhr";
import type { ITeacher, ITeacherAssignment } from "./store";
import type { IClass, ISection } from "../classes/store";
import { getSubjectTypeColor, type IClassSubject } from "../subjects/store";

// Assign a teacher to teach a subject to a specific class/section for a session.
// Selects cascade: pick a class -> its sections + curriculum subjects load.
export function ManageAssignments({ teacher }: { teacher: ITeacher }) {
  const assignmentsKey = ["/teacher-assignments", teacher._id];
  const { data: assignments, isLoading } = useSWR(assignmentsKey, async () =>
    api.get<ITeacherAssignment[]>(`/teachers/${teacher._id}/assignments`)
  );

  // Class catalog for the tenant (high limit so all appear in the picker)
  const { data: classes } = useSWR("/academic/classes/all", async () =>
    api.get<IListResponse<IClass>>("/academic/classes", {
      params: { limit: 200 },
    })
  );

  const [classId, setClassId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [academicSession, setAcademicSession] = useState<string | null>(
    defaultSession()
  );
  const [saving, setSaving] = useState(false);

  // Sections belong to the chosen class only
  const { data: sections } = useSWR(
    classId ? ["/academic/sections", classId] : null,
    async () =>
      api.get<{ data: ISection[] }>("/academic/sections", {
        params: { classId },
      })
  );

  // Subjects offered come from the class curriculum, not the full catalog
  const { data: curriculum } = useSWR(
    classId ? ["/academic/class-subjects", classId] : null,
    async () =>
      api.get<{ data: IClassSubject[] }>(`/academic/classes/${classId}/subjects`)
  );

  const refresh = () => mutate(assignmentsKey);

  const resetForm = () => {
    setClassId(null);
    setSectionId(null);
    setSubjectId(null);
  };

  const handleAssign = async () => {
    if (!classId || !subjectId || !academicSession) return;
    setSaving(true);
    try {
      await api.post(`/teachers/${teacher._id}/assignments`, {
        teacherId: teacher._id,
        classId,
        sectionId: sectionId || undefined,
        subjectId,
        academicSession,
      });
      resetForm();
      refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="lg">
      <Group align="end" gap="md" grow>
        <Select
          label="Class"
          placeholder="Select class"
          data={
            classes?.data.map((c) => ({ value: c._id, label: c.name })) ?? []
          }
          value={classId}
          onChange={(value) => setClassId(typeof value === "string" ? value : null)}
          searchable
        />
        <Select
          label="Section (optional)"
          placeholder={classId ? "Whole class" : "Pick a class first"}
          data={
            sections?.data.map((s) => ({
              value: s._id,
              label: s.name,
            })) ?? []
          }
          value={sectionId}
          onChange={(value) => setSectionId(typeof value === "string" ? value : null)}
          disabled={!classId}
          clearable
        />
        <Select
          label="Subject"
          placeholder={
            !classId
              ? "Pick a class first"
              : curriculum?.data.length
              ? "Select subject"
              : "No subjects in curriculum"
          }
          data={
            curriculum?.data.map((cs) => ({
              value: cs.subject._id,
              label: `${cs.subject.name} (${cs.subject.code})`,
            })) ?? []
          }
          value={subjectId}
          onChange={(value) => setSubjectId(typeof value === "string" ? value : null)}
          disabled={!classId || !curriculum?.data.length}
          searchable
        />
        <Select
          label="Session"
          placeholder="e.g. 2025-2026"
          data={sessionOptions()}
          value={academicSession}
          onChange={(value) => setAcademicSession(typeof value === "string" ? value : null)}
        />
        <Button
          onClick={handleAssign}
          disabled={!classId || !subjectId || !academicSession || saving}
        >
          {saving ? "Assigning..." : "Assign"}
        </Button>
      </Group>

      <Divider />

      {isLoading ? (
        <Center h={120}>
          <Loader size="sm" />
        </Center>
      ) : !assignments?.length ? (
        <Text c="gray" ta="center" py="lg">
          No assignments yet for {teacher.user?.name}.
        </Text>
      ) : (
        <Table
          headers={["Class", "Section", "Subject", "Session", "Actions"]}
          rows={assignments.map((a) => [
            <Text fw="bold">{a.class?.name}</Text>,
            <Text>{a.section?.name ?? "Whole class"}</Text>,
            <Badge
              variant="light"
              color={a.subject ? getSubjectTypeColor(a.subject.type) : "blue"}
            >
              {a.subject?.name}
            </Badge>,
            <Text>{a.academicSession}</Text>,
            <Button
              variant="subtle"
              color="red"
              size="compact-sm"
              leftSection={<IconTrash size={14} />}
              onClick={async () => {
                await api.delete(`/teachers/assignments/${a._id}`);
                refresh();
              }}
            >
              Remove
            </Button>,
          ])}
        />
      )}

      <Inline justify="end">
        <Text c="gray" fz="sm">
          {assignments?.length ?? 0} assignment(s)
        </Text>
      </Inline>
    </Stack>
  );
}

// Sessions run Apr->Mar in most Indian schools; offer current + a couple around it.
function defaultSession(): string {
  return "2025-2026";
}

function sessionOptions() {
  return [
    { value: "2024-2025", label: "2024-2025" },
    { value: "2025-2026", label: "2025-2026" },
    { value: "2026-2027", label: "2026-2027" },
  ];
}
