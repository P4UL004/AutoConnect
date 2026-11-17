import { Box, Typography } from '@mui/material';

export default function Logo({ color = 'primary.main', compact = false }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color }}>
      <svg
        width={compact ? 28 : 32}
        height={compact ? 28 : 32}
        viewBox="0 0 32 32"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M8 10.5h16M8 21.5h16M10.5 8v16M21.5 8v16" opacity=".55" />
        <circle cx="8" cy="10.5" r="3" fill="currentColor" />
        <circle cx="24" cy="10.5" r="3" fill="currentColor" />
        <circle cx="8" cy="21.5" r="3" fill="currentColor" />
        <circle cx="24" cy="21.5" r="3" fill="currentColor" />
        <circle cx="16" cy="16" r="3.5" fill="currentColor" />
      </svg>
      <Typography
        component="span"
        sx={{
          fontSize: compact ? 17 : 19,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        AutoConnect
      </Typography>
    </Box>
  );
}
