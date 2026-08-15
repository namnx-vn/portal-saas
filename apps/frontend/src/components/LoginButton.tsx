import { useMsal } from "@azure/msal-react";
import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

interface Props extends Omit<ButtonProps, "onClick"> {
  children?: React.ReactNode;
  idpAlias?: string | null;
  loginHint?: string;
}

export function LoginButton({ children, idpAlias, loginHint, ...buttonProps }: Props) {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      loginHint,
      ...(idpAlias && { extraQueryParameters: { domain_hint: idpAlias } }),
    });
  };

  return (
    <Button type="button" onClick={handleLogin} {...buttonProps}>
      {children ?? (idpAlias ? "Đăng nhập bằng SSO" : "Đăng nhập")}
    </Button>
  );
}
