import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Tabs, Tab } from "@mui/material";

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.startsWith("/admin/roles") ? "/admin/roles" : "/admin/users";

  return (
    <Box>
      <Container maxWidth="md" className="pt-8">
        <Tabs value={currentTab} onChange={(_, value) => navigate(value)} className="mb-2">
          <Tab label="User" value="/admin/users" />
          <Tab label="Role" value="/admin/roles" />
        </Tabs>
      </Container>
      <Outlet />
    </Box>
  );
}