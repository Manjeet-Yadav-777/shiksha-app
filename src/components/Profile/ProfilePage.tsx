import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useAuthUser } from '../../hooks/auth';
import { TextInputField } from '../../libs/form/Input';
import { Form } from 'react-final-form';
import { Dialog, useDialog } from '../../libs/basic/Dialog';
import { Inline } from '../../libs/basic/Layout';
import { xhr } from '../../libs/XHR/xhr';
import { getRole } from './store';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <Group justify="space-between" py="md">
        <Text c="dimmed" fw={500}>
          {label}
        </Text>

        <Text fw={500}>{value}</Text>
      </Group>

      <Divider />
    </>
  );
}

export default function ProfilePage() {
  const { user, mutate } = useAuthUser();
  const dialog = useDialog();
  return (
    <Box maw={850} mx="auto" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Title order={2}>Settings</Title>

          <Text fw={600}>Profile</Text>
        </Group>

        {/* Profile Summary */}
        <Card withBorder radius="md" p="xl">
          <Stack align="center" gap={6}>
            <Avatar radius="xl" size={80}>
              MY
            </Avatar>

            <Text fw={700} size="lg">
              {user?.name}
            </Text>

            <Text c="dimmed">{user?.email}</Text>

            <Badge variant="light">{getRole(user?.role)}</Badge>
          </Stack>
        </Card>

        {/* Personal Information */}
        <Card withBorder radius="md" p={0}>
          <Box p="lg">
            <Title order={4}>Personal Information</Title>
          </Box>

          <Divider />

          <Box px="lg">
            <Row label="Name" value={user?.name} />
            <Row label="Email" value={user?.email} />

            <Group justify="space-between" py="md">
              <Text c="dimmed" fw={500}>
                Role
              </Text>

              <Text fw={500}>{getRole(user?.role)}</Text>
            </Group>
          </Box>
        </Card>

        {/* Security */}
        <Card withBorder radius="md" p={0}>
          <Group justify="space-between" p="lg">
            <Title order={4}>Security</Title>

            <Button variant="subtle" size="xs">
              Edit
            </Button>
          </Group>

          <Divider />

          <Box p="lg">
            <Group justify="space-between">
              <Box>
                <Text c="dimmed" fw={500}>
                  Password
                </Text>

                <Text fw={500}>••••••••••••</Text>

                <Text size="xs" c="dimmed" mt={4}>
                  Last changed 21 Jul 2026
                </Text>
              </Box>

              <Button
                leftSection={<IconLock size={16} />}
                onClick={dialog.open}
                variant="default"
              >
                Change Password
              </Button>
              <EditPassword
                isOpen={dialog.isOpened}
                close={dialog.close}
                onSuccess={() => {
                  dialog.close();
                  mutate();
                }}
              />
            </Group>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
}

export function EditPassword({
  isOpen,
  close,
  onSuccess,
}: {
  isOpen: boolean;
  close: () => void;
  onSuccess: () => void;
}) {
  return (
    <Dialog title="Edit Password" isOpened={isOpen} close={close}>
      <Form
        onSubmit={async (values) => {
          await xhr.post('/auth/change-password', values);
          onSuccess();
        }}
      >
        {({ handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <Stack gap={'md'}>
              <Stack gap={'lg'}>
                <TextInputField
                  type="password"
                  name="password"
                  label="Password"
                />
                <TextInputField
                  type="password"
                  name="newPassword"
                  label="New Password"
                />
              </Stack>
              <Inline gap={'lg'}>
                <Button
                  loading={submitting}
                  disabled={submitting}
                  type="submit"
                >
                  Change Password
                </Button>
                <Button variant="default" onClick={close}>
                  Cancel
                </Button>
              </Inline>
            </Stack>
          </form>
        )}
      </Form>
    </Dialog>
  );
}
