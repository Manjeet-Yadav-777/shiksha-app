import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

import App from "./App";
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <MantineProvider theme={{
    white: "#E5E7EB",
  }}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </MantineProvider>
);