import {
  Button,
  Container,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconHome, IconError404 } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Container size="sm" h="100vh">
      <Stack justify="center" align="center" h="100%" gap="xl">
        <ThemeIcon size={100} radius="xl" variant="light" color="blue">
          <IconError404 size={56} stroke={1.5} />
        </ThemeIcon>

        <Stack gap={6} align="center">
          <Title order={1} fz={42}>
            Page Not Found
          </Title>

          <Text c="dimmed" ta="center" maw={500}>
            Sorry, the page you're looking for doesn't exist or may have been
            moved. Please check the URL or return to the dashboard.
          </Text>
        </Stack>

        <Group>
          <Button
            component={Link}
            to="/"
            leftSection={<IconHome size={18} />}
            size="md"
          >
            Back to Dashboard
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
