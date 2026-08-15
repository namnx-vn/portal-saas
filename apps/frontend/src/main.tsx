import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { msalConfig } from "./authConfig";
import { queryClient } from "./lib/queryClient";
import "./styles/main.css";
import { theme } from "./theme";

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
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
});
