import { AppShell } from '@mantine/core';
import { useLocation } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Navbar } from './components/Navbar';

export default function App() {
  const location = useLocation();
  const hideHeader = location.pathname === '/auth/login';

  return (
    <AppShell header={hideHeader ? undefined : { height: 60 }}>
      <AppShell.Header>{hideHeader ? null : <Navbar />}</AppShell.Header>

      <AppShell.Main>
        <AppRoutes />
      </AppShell.Main>
    </AppShell>
  );
}
