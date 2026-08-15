import { Box, Typography } from "@mui/material";

export function BrandMark() {
  return (
    <Box className="flex items-center gap-3" aria-label="SimpleFlow">
      {/* Logo Icon */}
      <Box
        className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md"
        aria-hidden="true"
      >
        S
      </Box>
      {/* Brand Name */}
      <Typography variant="h6" className="font-bold text-gray-900">
        SimpleFlow
      </Typography>
    </Box>
  );
}
