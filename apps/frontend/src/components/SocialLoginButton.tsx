import { useMsal } from "@azure/msal-react";
import Image, { type ImageKey } from "./Image";
import clsx from "clsx";

type SocialProvider = "apple" | "google" | "microsoft";

interface SocialLoginButtonProps {
  provider: SocialProvider;
  idpAlias?: string | null;
  disabled?: boolean;
}

const providerLabels: Record<SocialProvider, string> = {
  google: "Google",
  apple: "Apple",
  microsoft: "Microsoft",
};

export function SocialLoginButton({
  provider,
  idpAlias,
  disabled,
}: SocialLoginButtonProps) {
  const { instance } = useMsal();
  const label = providerLabels[provider];

  const handleClick = () => {
    // Chỉ Microsoft (Entra External ID) mới có luồng SSO thật trong app này
    if (provider !== "microsoft") return;

    instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      ...(idpAlias && { extraQueryParameters: { domain_hint: idpAlias } }),
    });
  };

  return (
    <button
      type="button"
      aria-label={`Sign in with ${label}`}
      className={clsx("social-login-button", {
        "cursor-pointer": !disabled && idpAlias !== null,
        "cursor-not-allowed": disabled || idpAlias === null,
      })}
      onClick={handleClick}
      disabled={disabled || idpAlias === null}
    >
      <Image src={`${provider}_icon` as ImageKey} alt={label} />
    </button>
  );
}
