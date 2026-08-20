import { useSearchParams } from "react-router-dom";
import { Box, Container, Paper, Alert, Button, TextField, CircularProgress, Typography } from "@mui/material";
import { useChangePasswordForm } from "./hooks/useChangePasswordForm";
import { useUserStore } from "../../stores";

export function ChangePasswordScreen() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { form, acceptMutation, isExpired, resendMutation, resendStatus, onSubmit, onResend } =
    useChangePasswordForm(token);
  const user = useUserStore((state) => state.user);

  if (!token) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Alert severity="error">Thiếu token trong đường dẫn.</Alert>
      </Box>
    );
  }

  if (user) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <p>Đặt mật khẩu thành công. Bạn đã đăng nhập.</p>
      </Box>
    );
  }

  return (
    <Box className="flex items-center justify-center min-h-screen p-4">
      <Container maxWidth="xs">
        <Paper elevation={0} className="p-8 rounded-2xl border border-gray-200 shadow-sm">
          <Typography variant="h6" className="mb-6 text-center">
            Đặt mật khẩu để kích hoạt tài khoản
          </Typography>

          {isExpired ? (
            <Box className="space-y-4">
              <Alert severity="warning">Đường dẫn mời đã hết hạn.</Alert>
              {resendStatus === "sent" ? (
                <Alert severity="success">Đã gửi lại email mời. Vui lòng kiểm tra hộp thư.</Alert>
              ) : (
                <Button fullWidth variant="contained" onClick={onResend} disabled={resendMutation.isPending}>
                  {resendMutation.isPending ? <CircularProgress size={20} /> : "Gửi lại lời mời"}
                </Button>
              )}
            </Box>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {acceptMutation.isError && (
                <Alert severity="error">
                  {(acceptMutation.error as any)?.response?.data?.error || "Có lỗi xảy ra."}
                </Alert>
              )}

              <TextField
                type="password"
                label="Mật khẩu mới"
                fullWidth
                disabled={acceptMutation.isPending}
                {...form.register("password", {
                  required: "Vui lòng nhập mật khẩu",
                  minLength: { value: 8, message: "Tối thiểu 8 ký tự" },
                })}
                error={Boolean(form.formState.errors.password)}
                helperText={form.formState.errors.password?.message}
              />

              <Button type="submit" fullWidth size="large" variant="contained" disabled={acceptMutation.isPending}>
                {acceptMutation.isPending ? <CircularProgress size={20} /> : "Kích hoạt tài khoản"}
              </Button>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
}