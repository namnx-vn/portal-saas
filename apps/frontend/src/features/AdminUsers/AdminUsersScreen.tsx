import {
  Box,
  Container,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Typography,
  Select,
  type SelectChangeEvent,
  MenuItem,
} from "@mui/material";
import {
  ControlledTextField,
  ControlledSelect,
} from "../../components/ControlledForm";
import {
  useAdminUsersList,
  useCreateUserForm,
  useChangeUserRole,
  useAssignDepartmentRole,
} from "./hooks/useAdminUsers";
import { useRolesList } from "../AdminRoles/hooks/useAdminRoles";

export function AdminUsersScreen() {
  const { data: users, isLoading, error } = useAdminUsersList();
  const assignDepartmentRoleMutation = useAssignDepartmentRole();
   const changeRoleMutation = useChangeUserRole();
  const { data: roles } = useRolesList();
  const { form, createMutation, onSubmit } = useCreateUserForm();

  return (
    <Container maxWidth="md" className="py-10">
      <Typography variant="h5" className="mb-6">
        Quản lý người dùng
      </Typography>

      <Paper
        elevation={0}
        className="p-6 mb-8 rounded-2xl border border-gray-200"
      >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-4 items-start flex-wrap"
        >
          <ControlledTextField
            control={form.control}
            name="email"
            label="Email"
            disabled={createMutation.isPending}
          />
          <ControlledSelect
            control={form.control}
            name="role"
            label="Role"
            options={[
              { label: "Member", value: "member" },
              { label: "Admin", value: "admin" },
            ]}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              "Mời người dùng"
            )}
          </Button>
        </form>

        {createMutation.isError && (
          <Alert severity="error" className="mt-4">
            {(createMutation.error as any)?.response?.data?.error ||
              "Không thể tạo user."}
          </Alert>
        )}
        {createMutation.isSuccess && (
          <Alert severity="success" className="mt-4">
            Đã gửi lời mời qua email.
          </Alert>
        )}
      </Paper>

      <Paper elevation={0} className="rounded-2xl border border-gray-200">
        {isLoading && (
          <Box className="flex justify-center py-8">
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" className="m-4">
            Không tải được danh sách người dùng.
          </Alert>
        )}
        {users && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Vai trò phòng ban</TableCell>
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
                    <Select
                      size="small"
                      displayEmpty
                      value={u.departmentRole?.id ?? ""}
                      disabled={assignDepartmentRoleMutation.isPending}
                      onChange={(e: SelectChangeEvent) =>
                        assignDepartmentRoleMutation.mutate({
                          id: u.id,
                          departmentRoleId: e.target.value || null,
                        })
                      }
                    >
                      <MenuItem value="">— Chưa gán —</MenuItem>
                      {roles?.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.departmentName} — {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        u.status === "active" ? "Đã kích hoạt" : "Chờ kích hoạt"
                      }
                      color={u.status === "active" ? "success" : "warning"}
                    />
                  </TableCell>
                  <TableCell>
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {changeRoleMutation.isError && (
        <Alert severity="error" className="mt-4">
          {(changeRoleMutation.error as any)?.response?.data?.error || "Không thể đổi role."}
        </Alert>
      )}
      </Paper>
    </Container>
  );
}
