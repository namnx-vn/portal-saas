import type { Configuration } from "@azure/msal-browser";
import type { RuntimeConfig } from "./config/runtimeConfig";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority: `https://${import.meta.env.VITE_ENTRA_TENANT_NAME}.ciamlogin.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage", // KHÔNG dùng localStorage cho token
  },
};

export function createMsalConfig(config: RuntimeConfig): Configuration {
  return {
    auth: {
      clientId: config.entra.clientId,

      authority:
        `https://${config.entra.tenantName}.ciamlogin.com/` +
        config.entra.tenantId,

      redirectUri: config.entra.redirectUri,
    },

    cache: {
      cacheLocation: "sessionStorage",
    },
  };
}

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};
