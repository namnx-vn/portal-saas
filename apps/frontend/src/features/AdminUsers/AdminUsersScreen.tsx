import {
  Box, Container, Paper, Button, Alert, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, Typography,
} from "@mui/material";
import { ControlledTextField, ControlledSelect } from "../../components/ControlledForm";
import { useAdminUsersList, useCreateUserForm } from "./hooks/useAdminUsers";

export function AdminUsersScreen() {
  const { data: users, isLoading, error } = useAdminUsersList();
  const { form, createMutation, onSubmit } = useCreateUserForm();

  return (
    <Container maxWidth="md" className="py-10">
      <Typography variant="h5" className="mb-6">Quản lý người dùng</Typography>

      <Paper elevation={0} className="p-6 mb-8 rounded-2xl border border-gray-200">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 items-start flex-wrap">
          <ControlledTextField control={form.control} name="email" label="Email" disabled={createMutation.isPending} />
          <ControlledSelect
            control={form.control}
            name="role"
            label="Role"
            options={[
              { label: "Member", value: "member" },
              { label: "Admin", value: "admin" },
            ]}
          />
          <Button type="submit" variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? <CircularProgress size={20} /> : "Mời người dùng"}
          </Button>
        </form>

        {createMutation.isError && (
          <Alert severity="error" className="mt-4">
            {(createMutation.error as any)?.response?.data?.error || "Không thể tạo user."}
          </Alert>
        )}
        {createMutation.isSuccess && <Alert severity="success" className="mt-4">Đã gửi lời mời qua email.</Alert>}
      </Paper>

      <Paper elevation={0} className="rounded-2xl border border-gray-200">
        {isLoading && (
          <Box className="flex justify-center py-8">
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error" className="m-4">Không tải được danh sách người dùng.</Alert>}
        {users && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Đăng nhập gần nhất</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={u.status === "active" ? "Đã kích hoạt" : "Chờ kích hoạt"}
                      color={u.status === "active" ? "success" : "warning"}
                    />
                  </TableCell>
                  <TableCell>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}