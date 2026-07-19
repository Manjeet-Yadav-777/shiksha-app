import { useState } from "react";
import useSWR from "swr";
import {
  SegmentedControl,
  SimpleGrid,
  Stack,
  Group,
  Text,
  Badge,
  Card,
  Loader,
  Center,
  Divider,
} from "@mantine/core";
import {
  IconUsers,
  IconSchool,
  IconBooks,
  IconBuilding,
  IconCash,
  IconAlertTriangle,
  IconUserPlus,
} from "@tabler/icons-react";
import { StatCard } from "../../libs/basic/StatCard";
import { Table } from "../../libs/basic/Table";
import { Heading } from "../../libs/basic/Layout";
import { api } from "../../libs/XHR/xhr";
import { capitalize } from "../../helpers/Wording";

type Period = "weekly" | "monthly" | "yearly";

interface ISummary {
  period: Period;
  counts: {
    students: number;
    teachers: number;
    classes: number;
    subjects: number;
    newAdmissions: number;
  };
  fees: {
    collected: number;
    outstanding: number;
    overdue: number;
  };
}

interface ICollections {
  period: Period;
  unit: "day" | "month";
  series: Array<{ label: string; total: number }>;
}

interface IFeeStatus {
  breakdown: Array<{ status: string; count: number; amount: number }>;
}

interface IStudentsByClass {
  breakdown: Array<{ classId: string; class: string; count: number }>;
}

const inr = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

const PERIOD_LABEL: Record<Period, string> = {
  weekly: "last 7 days",
  monthly: "last 30 days",
  yearly: "last 12 months",
};

const STATUS_COLOR: Record<string, string> = {
  paid: "green",
  pending: "orange",
  partial: "blue",
};

export default function SchoolDashboard() {
  const [period, setPeriod] = useState<Period>("weekly");

  const { data: summary, isLoading: loadingSummary } = useSWR(
    ["/stats/summary", period],
    () => api.get<ISummary>("/stats/summary", { params: { period } }),
  );

  const { data: collections } = useSWR(["/stats/collections", period], () =>
    api.get<ICollections>("/stats/collections", { params: { period } }),
  );

  // These two aren't period-scoped on the backend, so no period in the key.
  const { data: feeStatus } = useSWR("/stats/fee-status", () =>
    api.get<IFeeStatus>("/stats/fee-status"),
  );

  const { data: studentsByClass } = useSWR("/stats/students-by-class", () =>
    api.get<IStudentsByClass>("/stats/students-by-class"),
  );

  const windowLabel = PERIOD_LABEL[period];

  return (
    <Stack gap="xl" p="md">
      <Group justify="space-between" align="center">
        <Heading as="h2">Dashboard</Heading>
        <SegmentedControl
          value={period}
          onChange={(v) => setPeriod(v as Period)}
          data={[
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
            { label: "Yearly", value: "yearly" },
          ]}
        />
      </Group>

      {loadingSummary && !summary ? (
        <Center h={160}>
          <Loader size="sm" />
        </Center>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <StatCard
              label="Students"
              value={summary?.counts.students ?? 0}
              icon={<IconUsers size={20} color="gray" />}
              to="/admin/students"
            />
            <StatCard
              label="Teachers"
              value={summary?.counts.teachers ?? 0}
              icon={<IconSchool size={20} color="gray" />}
              to="/admin/teachers"
            />
            <StatCard
              label="Classes"
              value={summary?.counts.classes ?? 0}
              icon={<IconBuilding size={20} color="gray" />}
              to="/admin/classes"
            />
            <StatCard
              label="Subjects"
              value={summary?.counts.subjects ?? 0}
              icon={<IconBooks size={20} color="gray" />}
              to="/admin/subjects"
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <StatCard
              label="Collected"
              value={inr(summary?.fees.collected ?? 0)}
              hint={windowLabel}
              color="green"
              icon={<IconCash size={20} color="gray" />}
            />
            <StatCard
              label="Outstanding"
              value={inr(summary?.fees.outstanding ?? 0)}
              hint="all pending dues"
              color="orange"
              icon={<IconCash size={20} color="gray" />}
            />
            <StatCard
              label="Overdue Fees"
              value={summary?.fees.overdue ?? 0}
              hint="past due date"
              color="red"
              icon={<IconAlertTriangle size={20} color="gray" />}
            />
            <StatCard
              label="New Admissions"
              value={summary?.counts.newAdmissions ?? 0}
              hint={windowLabel}
              icon={<IconUserPlus size={20} color="gray" />}
            />
          </SimpleGrid>
        </>
      )}

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Card shadow="xs" withBorder radius="md" p="lg">
          <Stack gap="md">
            <Text fw={600} fz="lg">
              Fee Status
            </Text>
            <Divider />
            {!feeStatus ? (
              <Center h={100}>
                <Loader size="sm" />
              </Center>
            ) : (
              <Table
                headers={["Status", "Fees", "Outstanding"]}
                rows={feeStatus.breakdown.map((b) => [
                  <Badge variant="light" color={STATUS_COLOR[b.status] ?? "gray"}>
                    {capitalize(b.status)}
                  </Badge>,
                  <Text>{b.count}</Text>,
                  <Text>{inr(b.amount)}</Text>,
                ])}
              />
            )}
          </Stack>
        </Card>

        <Card shadow="xs" withBorder radius="md" p="lg">
          <Stack gap="md">
            <Text fw={600} fz="lg">
              Students by Class
            </Text>
            <Divider />
            {!studentsByClass ? (
              <Center h={100}>
                <Loader size="sm" />
              </Center>
            ) : !studentsByClass.breakdown.length ? (
              <Text c="dimmed" ta="center" py="md">
                No students enrolled yet.
              </Text>
            ) : (
              <Table
                headers={["Class", "Students"]}
                rows={studentsByClass.breakdown.map((b) => [
                  <Text fw={500}>{b.class}</Text>,
                  <Text>{b.count}</Text>,
                ])}
              />
            )}
          </Stack>
        </Card>
      </SimpleGrid>

      <Card shadow="xs" withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text fw={600} fz="lg">
              Collections Trend
            </Text>
            <Text c="dimmed" fz="sm">
              {windowLabel}
            </Text>
          </Group>
          <Divider />
          {!collections ? (
            <Center h={100}>
              <Loader size="sm" />
            </Center>
          ) : (
            <Table
              headers={[collections.unit === "month" ? "Month" : "Day", "Collected"]}
              rows={collections.series.map((s) => [
                <Text>{s.label}</Text>,
                <Text>{inr(s.total)}</Text>,
              ])}
            />
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
