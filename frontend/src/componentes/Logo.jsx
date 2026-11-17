import { Box, Typography } from '@mui/material';

export default function Logo({ color = 'primary.main', compact = false }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color }}>
      <svg
        width={compact ? 30 : 34}
        height={compact ? 30 : 34}
        viewBox="0 0 32 32"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 18v-3.5l1.8-5.1A2 2 0 0 1 8.7 8h8.6a2 2 0 0 1 1.9 1.4L21 14.5V18h-2v-2H7v2H5Z" />
        <path d="M6 14.5h14M9 11h8" />
        <circle cx="8" cy="14.5" r=".7" fill="currentColor" />
        <circle cx="18" cy="14.5" r=".7" fill="currentColor" />
      </svg>
      <Typography
        component="span"
        sx={{
          fontSize: compact ? 19 : 22,
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
