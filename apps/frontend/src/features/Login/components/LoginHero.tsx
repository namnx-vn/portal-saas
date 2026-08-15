import { Box, Typography } from "@mui/material";

export function LoginHero() {
  return (
    <Box
      component="section"
      className="flex flex-col justify-between h-full p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl text-white"
      aria-label="SimpleFlow welcome"
    >
      {/* Intro Section */}
      <Box>
        <Typography variant="h3" className="font-bold mb-3">
          Welcome to SimpleFlow
        </Typography>
        <Typography variant="body1" className="text-blue-100 text-lg">
          Your Gateway to Effortless Management.
        </Typography>
      </Box>

      {/* Footer Section */}
      <Box>
        <Typography variant="h5" className="font-bold mb-2">
          Seamless Collaboration
        </Typography>
        <Typography variant="body2" className="text-blue-100 mb-6">
          Effortlessly work together with your team in real-time.
        </Typography>

        {/* Pagination Dots */}
        <Box className="flex gap-2" aria-hidden="true">
          <div className="w-2.5 h-2.5 bg-white rounded-full" />
          <div className="w-2.5 h-2.5 bg-blue-300 rounded-full" />
          <div className="w-2.5 h-2.5 bg-blue-300 rounded-full" />
        </Box>
      </Box>
    </Box>
  );
}
