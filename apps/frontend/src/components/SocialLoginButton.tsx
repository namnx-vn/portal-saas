import { Button, Box } from "@mui/material";

type SocialProvider = "apple" | "google" | "microsoft";

interface SocialLoginButtonProps {
  provider: SocialProvider;
}

const providerIcons: Record<SocialProvider, string> = {
  google: "🔵",
  apple: "🍎",
  microsoft: "⊞",
};

const providerLabels: Record<SocialProvider, string> = {
  google: "Google",
  apple: "Apple",
  microsoft: "Microsoft",
};

export function SocialLoginButton({ provider }: SocialLoginButtonProps) {
  const label = providerLabels[provider];
  const icon = providerIcons[provider];

  return (
    <Button
      type="button"
      aria-label={`Sign in with ${label}`}
      variant="outlined"
      fullWidth
      className="border-gray-300 text-gray-700 hover:border-gray-400"
      sx={{
        py: 1.5,
        px: 2,
        border: "1px solid #e5e7eb",
        "&:hover": {
          border: "1px solid #d1d5db",
          backgroundColor: "#f9fafb",
        },
      }}
    >
      <Box className="flex items-center justify-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="hidden sm:inline text-sm font-medium">{label}</span>
      </Box>
    </Button>
  );
}
