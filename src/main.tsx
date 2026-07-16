import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css"; 
import App from "./App";
import "./index.css"
import { Notifications } from "@mantine/notifications";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <MantineProvider>
    <Notifications/>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </MantineProvider>
);