import { Link } from "react-router-dom";
import { Box, Container, Paper, Typography, Button, Chip } from "@mui/material";
import { useUserStore } from "../../stores";
import { useLogout } from "../../hooks/useLogout";

export function DashboardScreen() {
  const user = useUserStore((state) => state.user);

  const { logout, isLoggingOut } = useLogout();

  if (!user) return null;
  return (
    <Container maxWidth="sm" className="py-16">
      <Paper
        elevation={0}
        className="p-8 rounded-2xl border border-gray-200 shadow-sm"
      >
        <Typography variant="h5" className="mb-2">
          Dashboard
        </Typography>
        <Typography variant="body2" className="text-gray-600 mb-6">
          Đăng nhập thành công.
        </Typography>

        <Box className="space-y-2 mb-8">
          <Typography variant="body2">
            <strong>Email:</strong> {user.email}
          </Typography>
          <Box className="flex items-center gap-2">
            <Typography variant="body2">
              <strong>Role:</strong>
            </Typography>
            <Chip size="small" label={user.role} />
          </Box>
          <Typography variant="body2">
            <strong>Tenant ID:</strong> {user.tenantId}
          </Typography>
        </Box>

        <Box className="flex gap-3">
          {user.role === "admin" && (
            <Button component={Link} to="/admin/users" variant="contained">
              Quản lý người dùng
            </Button>
          )}
          {user.permissions.includes("manage_roles") && (
            <Button component={Link} to="/admin/roles" variant="outlined">
              Quản lý vai trò
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            onClick={logout}
            disabled={isLoggingOut}
          >
            Đăng xuất
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
