import { AppShell } from "@mantine/core";
import { useRoutes } from "react-router-dom";
import routes from "~react-pages";
import { Navbar } from "./components/Navbar";

export default function App() {
  const element = useRoutes(routes);

  return (
    <AppShell
      header={{ height: 60 }}
    >
      <AppShell.Header>
       <Navbar/>
      </AppShell.Header>

      <AppShell.Main>
        {element}
      </AppShell.Main>
    </AppShell>
  );
}