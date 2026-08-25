import { useState } from "react";
import type { FormEvent } from "react";
import {
  Container, Paper, Typography, Box, TextField, Button, Alert, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, Chip,
} from "@mui/material";
import { useDepartmentsList, useCreateDepartment, useRolesList, useCreateRole } from "./hooks/useAdminRoles";

export function AdminRolesScreen() {
  const { data: departments, isLoading: departmentsLoading } = useDepartmentsList();
  const createDepartment = useCreateDepartment();
  const { data: roles, isLoading: rolesLoading } = useRolesList();
  const createRole = useCreateRole();

  const [departmentName, setDepartmentName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleDepartmentId, setRoleDepartmentId] = useState("");
  const [permissionsInput, setPermissionsInput] = useState("");

  const handleCreateDepartment = (e: FormEvent) => {
    e.preventDefault();
    createDepartment.mutate({ name: departmentName }, { onSuccess: () => setDepartmentName("") });
  };

  const handleCreateRole = (e: FormEvent) => {
    e.preventDefault();
    const permissions = permissionsInput.split(",").map((p) => p.trim()).filter(Boolean);
    createRole.mutate(
      { name: roleName, departmentId: roleDepartmentId, permissions },
      { onSuccess: () => { setRoleName(""); setPermissionsInput(""); } },
    );
  };

  return (
    <Container maxWidth="md" className="py-10">
      <Typography variant="h5" className="mb-6">Phòng ban & Vai trò</Typography>

      <Paper elevation={0} className="p-6 mb-8 rounded-2xl border border-gray-200">
        <Typography variant="subtitle1" className="mb-4">Phòng ban</Typography>
        <form onSubmit={handleCreateDepartment} className="flex gap-3 items-start mb-4">
          <TextField
            label="Tên phòng ban"
            size="small"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            disabled={createDepartment.isPending}
          />
          <Button type="submit" variant="contained" disabled={createDepartment.isPending || !departmentName}>
            {createDepartment.isPending ? <CircularProgress size={20} /> : "Thêm"}
          </Button>
        </form>
        {createDepartment.isError && (
          <Alert severity="error" className="mb-2">
            {(createDepartment.error as any)?.response?.data?.error || "Không thể tạo phòng ban."}
          </Alert>
        )}
        {departmentsLoading ? <CircularProgress size={20} /> : (
          <Box className="flex gap-2 flex-wrap">
            {departments?.map((d) => <Chip key={d.id} label={d.name} />)}
          </Box>
        )}
      </Paper>

      <Paper elevation={0} className="p-6 mb-8 rounded-2xl border border-gray-200">
        <Typography variant="subtitle1" className="mb-4">Tạo vai trò</Typography>
        <form onSubmit={handleCreateRole} className="flex gap-3 items-start flex-wrap mb-4">
          <TextField
            label="Tên vai trò"
            size="small"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            disabled={createRole.isPending}
          />
          <Select
            size="small"
            displayEmpty
            value={roleDepartmentId}
            onChange={(e) => setRoleDepartmentId(e.target.value)}
            disabled={createRole.isPending || !departments?.length}
          >
            <MenuItem value="" disabled>Chọn phòng ban</MenuItem>
            {departments?.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </Select>
          <TextField
            label="Permissions (cách nhau bằng dấu phẩy)"
            size="small"
            value={permissionsInput}
            onChange={(e) => setPermissionsInput(e.target.value)}
            disabled={createRole.isPending}
            sx={{ minWidth: 260 }}
          />
          <Button type="submit" variant="contained" disabled={createRole.isPending || !roleName || !roleDepartmentId}>
            {createRole.isPending ? <CircularProgress size={20} /> : "Tạo vai trò"}
          </Button>
        </form>
        {createRole.isError && (
          <Alert severity="error">{(createRole.error as any)?.response?.data?.error || "Không thể tạo vai trò."}</Alert>
        )}
      </Paper>

      <Paper elevation={0} className="rounded-2xl border border-gray-200">
        {rolesLoading ? (
          <Box className="flex justify-center py-8"><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vai trò</TableCell>
                <TableCell>Phòng ban</TableCell>
                <TableCell>Permissions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.departmentName}</TableCell>
                  <TableCell>
                    <Box className="flex gap-1 flex-wrap">
                      {r.permissions.map((p) => <Chip key={p} size="small" label={p} />)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}