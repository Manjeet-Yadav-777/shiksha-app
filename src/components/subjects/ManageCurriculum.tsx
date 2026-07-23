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
  MultiSelect,
} from "@mantine/core";
import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";
import { Table } from "../../libs/basic/Table";
import { Inline } from "../../libs/basic/Layout";
import { api } from "../../libs/XHR/xhr";
import type { IListResponse } from "../../libs/XHR/xhr";
import { capitalize } from "../../helpers/Wording";
import {
  getSubjectTypeColor,
  type IClassSubject,
  type ISubject,
} from "./store";
import type { IClass } from "../classes/store";

// Attach subjects to a class curriculum. Subjects are the tenant-wide catalog;
// here we pick which of them this class actually studies.
export function ManageCurriculum({ classItem }: { classItem: IClass }) {
  const curriculumKey = ["/academic/class-subjects", classItem._id];

  const { data: curriculum, isLoading } = useSWR(curriculumKey, async () =>
    api.get<{ data: IClassSubject[] }>(
      `/academic/classes/${classItem._id}/subjects`
    )
  );

  // Full subject catalog to choose from (high limit so all show in the picker)
  const { data: allSubjects } = useSWR("/academic/subjects/all", async () =>
    api.get<IListResponse<ISubject>>("/academic/subjects", {
      params: { limit: 200 },
    })
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const refresh = () => mutate(curriculumKey);

  const assignedIds = new Set(curriculum?.data.map((cs) => cs.subject._id));

  // Only offer subjects not already in the curriculum
  const options =
    allSubjects?.data
      .filter((s) => !assignedIds.has(s._id))
      .map((s) => ({ value: s._id, label: `${s.name} (${s.code})` })) ?? [];

  const handleAssign = async () => {
    if (!selectedIds.length) return;
    setSaving(true);
    try {
      await api.post(`/academic/classes/${classItem._id}/subjects`, {
        subjectIds: selectedIds,
      });
      setSelectedIds([]);
      refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="lg">
      <Group align="end" gap="md">
        <MultiSelect
          flex={1}
          label="Add subjects to this class"
          placeholder={options.length ? "Select subjects" : "All subjects added"}
          data={options}
          value={selectedIds}
          onChange={setSelectedIds}
          searchable
          clearable
          disabled={!options.length}
        />
        <Button onClick={handleAssign} disabled={!selectedIds.length || saving}>
          {saving ? "Adding..." : "Add"}
        </Button>
      </Group>

      <Divider />

      {isLoading ? (
        <Center h={120}>
          <Loader size="sm" />
        </Center>
      ) : !curriculum?.data.length ? (
        <Text c="gray" ta="center" py="lg">
          No subjects assigned to {classItem.name} yet.
        </Text>
      ) : (
        <Table
          headers={["Subject", "Code", "Type", "Actions"]}
          rows={curriculum.data.map((cs) => [
            <Text fw="bold">{cs.subject.name}</Text>,
            <Text>{cs.subject.code?.toUpperCase()}</Text>,
            <Badge
              variant="light"
              color={getSubjectTypeColor(cs.subject.type)}
            >
              {capitalize(cs.subject.type)}
            </Badge>,
            <Button
              variant="subtle"
              color="red"
              size="compact-sm"
              leftSection={<IconTrash size={14} />}
              onClick={async () => {
                await api.delete(
                  `/academic/classes/${classItem._id}/subjects/${cs.subject._id}`
                );
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
          {curriculum?.data.length ?? 0} subject(s) in curriculum
        </Text>
      </Inline>
    </Stack>
  );
}
