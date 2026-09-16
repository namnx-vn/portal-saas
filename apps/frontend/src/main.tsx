import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { createMsalConfig } from "./authConfig";
import { loadRuntimeConfig } from "./config/runtimeConfig";
import { queryClient } from "./lib/queryClient";
import "./styles/main.css";
import { theme } from "./theme";

async function bootstrap() {
  const runtimeConfig = await loadRuntimeConfig();

  const msalConfig = createMsalConfig(runtimeConfig);

  const msalInstance =
    new PublicClientApplication(msalConfig);

  await msalInstance.initialize();

  ReactDOM.createRoot(
    document.getElementById("root")!,
  ).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <MsalProvider instance={msalInstance}>
            <CssBaseline />
            <App />
          </MsalProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>,
  );
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap application", error);

  const root = document.getElementById("root");

  if (root) {
    root.innerHTML =
      "<h1>Application configuration error</h1>";
  }
});