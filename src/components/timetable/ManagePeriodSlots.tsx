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
  Switch,
} from "@mantine/core";
import { Form } from "react-final-form";
import { IconTrash } from "@tabler/icons-react";
import { Table } from "../../libs/basic/Table";
import { TextInputField } from "../../libs/form/Input";
import { api } from "../../libs/XHR/xhr";
import type { IPeriodSlot } from "./store";

const KEY = "/timetable/period-slots";

interface ISlotFormValues {
  periodNumber?: string;
  label?: string;
  startTime?: string;
  endTime?: string;
  isBreak?: boolean;
}

// Bell schedule setup — school apne periods ki timing ek baar define karti hai.
// Har section ka timetable inhi slots pe align hota hai.
export function ManagePeriodSlots() {
  const { data, isLoading } = useSWR(KEY, async () =>
    api.get<{ data: IPeriodSlot[] }>(KEY)
  );

  const refresh = () => mutate(KEY);
  const slots = data?.data ?? [];
  const nextNumber = slots.length
    ? Math.max(...slots.map((s) => s.periodNumber)) + 1
    : 1;

  return (
    <Stack gap="lg">
      <Form<ISlotFormValues>
        initialValues={{ isBreak: false }}
        onSubmit={async (values, form) => {
          await api.post(KEY, {
            periodNumber: Number(values.periodNumber),
            label: values.label,
            startTime: values.startTime,
            endTime: values.endTime,
            isBreak: !!values.isBreak,
          });
          refresh();
          form.restart({ isBreak: false });
        }}
      >
        {({ handleSubmit, submitting, form, values }) => (
          <form onSubmit={handleSubmit}>
            <Group align="end" gap="md">
              <TextInputField
                name="periodNumber"
                type="number"
                label="Period #"
                placeholder={String(nextNumber)}
                w={90}
              />
              <TextInputField
                name="label"
                label="Label (optional)"
                placeholder="Period 1 / Lunch"
                w={170}
              />
              <TextInputField
                name="startTime"
                label="Start"
                placeholder="09:00"
                w={100}
              />
              <TextInputField
                name="endTime"
                label="End"
                placeholder="09:45"
                w={100}
              />
              <Switch
                label="Break"
                checked={!!values.isBreak}
                onChange={(e) =>
                  form.change("isBreak", e.currentTarget.checked)
                }
                mb={8}
              />
              <Button type="submit" disabled={submitting}>
                Add Period
              </Button>
            </Group>
          </form>
        )}
      </Form>

      <Divider />

      {isLoading ? (
        <Center h={120}>
          <Loader size="sm" />
        </Center>
      ) : !slots.length ? (
        <Text c="gray" ta="center" py="lg">
          No periods yet. Add your school's bell schedule above.
        </Text>
      ) : (
        <Table
          headers={["#", "Label", "Time", "Type", "Actions"]}
          rows={slots.map((s) => [
            <Text fw="bold">{s.periodNumber}</Text>,
            <Text>{s.label || "-"}</Text>,
            <Text>
              {s.startTime} - {s.endTime}
            </Text>,
            <Badge variant="light" color={s.isBreak ? "orange" : "blue"}>
              {s.isBreak ? "Break" : "Class"}
            </Badge>,
            <Button
              variant="subtle"
              color="red"
              size="compact-sm"
              leftSection={<IconTrash size={14} />}
              onClick={async () => {
                await api.delete(`${KEY}/${s._id}`);
                refresh();
              }}
            >
              Delete
            </Button>,
          ])}
        />
      )}
    </Stack>
  );
}
