import { AppShell } from "@mantine/core";
import { useRoutes } from "react-router-dom";
import routes from "~react-pages";
import { Navbar } from "./components/Navbar";

export default function App() {
  const element = useRoutes(routes);
  const hideHeader = location.pathname === "/auth/login";

  return (
    <AppShell header={hideHeader ? undefined : { height: 60 }}>
      <AppShell.Header>
       {hideHeader ? null :  <Navbar />}
      </AppShell.Header>

      <AppShell.Main>{element}</AppShell.Main>
    </AppShell>
  );
}
