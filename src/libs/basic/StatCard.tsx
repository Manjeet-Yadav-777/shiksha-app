import { ActionIcon, Card, Stack, Text, Tooltip } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { Inline } from './Layout';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  color?: string;
  // When set, a nav button is shown that routes to this stat's detail page.
  to?: string;
}

// A single KPI tile. Kept intentionally plain so a dashboard can lay several
// out in a grid without extra wrapping. When `to` is given the header shows a
// nav button that takes the user straight to the stat's detail page.
export function StatCard({
  label,
  value,
  hint,
  icon,
  color,
  to,
}: StatCardProps) {
  const navigate = useNavigate();

  return (
    <Card shadow="xs" withBorder radius="md" p="lg">
      <Stack gap={6}>
        <Inline align="center" justify="space-between">
          <Inline align="center" gap="xs">
            {icon}
            <Text c="dimmed" fz="sm" fw={500}>
              {label}
            </Text>
          </Inline>
          {to ? (
            <Tooltip label={`View ${label.toLowerCase()}`} withArrow>
              <ActionIcon
                variant="light"
                color="gray"
                radius="xl"
                aria-label={`View ${label}`}
                onClick={() => navigate(to)}
              >
                <IconArrowRight size={16} />
              </ActionIcon>
            </Tooltip>
          ) : null}
        </Inline>
        <Text fz={28} fw={700} c={color}>
          {value}
        </Text>
        {hint ? (
          <Text c="dimmed" fz="xs">
            {hint}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}
