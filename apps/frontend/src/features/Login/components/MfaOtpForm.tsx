import { useState } from "react";
import { Button, Alert, TextField, CircularProgress, Typography } from "@mui/material";

interface MfaOtpFormProps {
  onSubmit: (otp: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function MfaOtpForm({ onSubmit, isSubmitting = false, error }: MfaOtpFormProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      <Typography variant="body2" className="text-gray-600 text-center">
        Nhập mã xác thực đã gửi tới email của bạn.
      </Typography>

      {error && <Alert severity="error" className="text-sm">{error}</Alert>}

      <TextField
        label="Mã OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        fullWidth
        disabled={isSubmitting}
        slotProps={{ htmlInput: { maxLength: 6, inputMode: "numeric" } }}
        autoFocus
      />

      <Button type="submit" fullWidth size="large" variant="contained" disabled={otp.length !== 6 || isSubmitting}>
        {isSubmitting ? <CircularProgress size={20} /> : "Xác nhận"}
      </Button>
    </form>
  );
}