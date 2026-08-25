import { useMsal } from "@azure/msal-react";

export function useSsoLogin() {
  const { instance } = useMsal();

  return function loginWithSso(idpAlias?: string | null, loginHint?: string) {
    instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      loginHint,
      ...(idpAlias && { extraQueryParameters: { domain_hint: idpAlias } }),
    });
  };
}