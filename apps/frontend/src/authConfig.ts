import type { Configuration } from "@azure/msal-browser";

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

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};