import Image, { type ImageKey } from "./atoms/Image";
import clsx from "clsx";

type SocialProvider = "apple" | "google" | "microsoft";

interface SocialLoginButtonProps {
  provider: SocialProvider;
  idpAlias?: string | null;
  disabled?: boolean;
  onClick?: () => void;
}

const providerLabels: Record<SocialProvider, string> = {
  google: "Google",
  apple: "Apple",
  microsoft: "Microsoft",
};

export function SocialLoginButton({
  provider,
  idpAlias,
  onClick,
  disabled,
}: SocialLoginButtonProps) {
  const label = providerLabels[provider];

  return (
    <button
      type="button"
      aria-label={`Sign in with ${label}`}
      className={clsx("social-login-button", {
        "cursor-pointer": !disabled && idpAlias !== null,
        "cursor-not-allowed": disabled || idpAlias === null,
      })}
      onClick={onClick}
      disabled={disabled || idpAlias === null}
    >
      <Image src={`${provider}_icon` as ImageKey} alt={label} />
    </button>
  );
}
