import { useState } from "react";
import useSWR from "swr";
import {
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Select,
  Divider,
  ActionIcon,
  Loader,
  Center,
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { api } from "../../libs/XHR/xhr";
import type { IListResponse } from "../../libs/XHR/xhr";
import type { IStudent } from "../students/store";
import type { IParent } from "./store";

// Admin ek parent ke bachche link/unlink karta hai. Student picker `/students`
// (paginated + ?q search) se aata hai; link/unlink ke baad parent list refresh.
export function ManageChildren({
  parent,
  onChanged,
}: {
  parent: IParent;
  onChanged: () => void;
}) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  // Local copy taaki dialog band kiye bina turant updated list dikhe.
  const [children, setChildren] = useState<IStudent[]>(parent.students ?? []);

  // Student search — debounce ki zarurat nahi, Select searchable onSearchChange
  // pe SWR key badalti hai aur keepPreviousData flicker rokta hai.
  const { data: studentsRes, isLoading } = useSWR(
    ["/students", search],
    async () =>
      api.get<IListResponse<IStudent>>("/students", {
        params: { q: search, limit: 20 },
      }),
    { keepPreviousData: true },
  );

  // Pehle se linked bachche dropdown me na dikhein.
  const linkedIds = new Set(children.map((c) => c._id));
  const options =
    studentsRes?.data
      ?.filter((s) => !linkedIds.has(s._id))
      .map((s) => ({
        value: s._id,
        label:
          `${s.user?.name ?? "Student"} (${s.rollNumber}) - ${s.class?.name ?? ""} ${s.section?.name ?? ""}`.trim(),
      })) ?? [];

  const link = async () => {
    if (!studentId) return;
    setBusy(true);
    try {
      await api.post(`/parents/${parent._id}/students`, { studentId });
      const justLinked = studentsRes?.data?.find((s) => s._id === studentId);
      if (justLinked) setChildren((prev) => [...prev, justLinked]);
      setStudentId(null);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const unlink = async (childId: string) => {
    setBusy(true);
    try {
      await api.delete(`/parents/${parent._id}/students/${childId}`);
      setChildren((prev) => prev.filter((c) => c._id !== childId));
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack gap="lg">
      {/* LINK A NEW CHILD */}
      <Stack gap="xs">
        <Text fw={600}>Link a Child</Text>
        <Group align="end" gap="md">
          <Select
            flex={1}
            label="Search student"
            placeholder="Type name to search..."
            data={options}
            value={studentId}
            onChange={setStudentId}
            searchable
            searchValue={search}
            onSearchChange={setSearch}
            nothingFoundMessage={
              isLoading ? "Searching..." : "No students found"
            }
            rightSection={isLoading ? <Loader size="xs" /> : undefined}
          />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={link}
            disabled={!studentId || busy}
          >
            Link
          </Button>
        </Group>
        {isLoading && children.length === 0 && (
          <Center h={40}>
            <Loader size="sm" />
          </Center>
        )}
      </Stack>

      <Divider />

      {/* CURRENT CHILDREN */}
      <Stack gap="xs">
        <Text fw={600}>Linked Children</Text>
        {children.length === 0 ? (
          <Text c="dimmed" fz="sm">
            No children linked yet.
          </Text>
        ) : (
          <Stack gap="xs">
            {children.map((c) => (
              <Group key={c._id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Text fw={500}>{c.user?.name ?? "Student"}</Text>
                  <Badge variant="light" size="sm">
                    {c.rollNumber}
                  </Badge>
                  <Text fz="sm" c="dimmed">
                    {[c.class?.name, c.section?.name]
                      .filter(Boolean)
                      .join(" - ")}
                  </Text>
                </Group>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  disabled={busy}
                  onClick={() => unlink(c._id)}
                  aria-label="Unlink child"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
