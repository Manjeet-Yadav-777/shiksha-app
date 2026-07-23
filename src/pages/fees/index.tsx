import { useState } from 'react';
import { Tabs } from '@mantine/core';
import { FeeStructureList } from '../../components/fees/FeeStructureList';
import { StudentFeeList } from '../../components/fees/StudentFeeList';

export default function Fees() {
  const [tab, setTab] = useState<string | null>('structures');

  return (
    <Tabs value={tab} onChange={setTab} keepMounted={false}>
      <Tabs.List px="lg" pt="md">
        <Tabs.Tab value="structures">Fee Structures</Tabs.Tab>
        <Tabs.Tab value="student-fees">Student Fees</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="structures">
        <FeeStructureList />
      </Tabs.Panel>
      <Tabs.Panel value="student-fees">
        <StudentFeeList />
      </Tabs.Panel>
    </Tabs>
  );
}
