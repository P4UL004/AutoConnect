import { Box, Typography } from '@mui/material';

export default function Logo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
     
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"
           fill="none" stroke="#FFFFFF" strokeWidth="1.5">
        {/* 3 colunas x 2 linhas de círculos */}
        {[5, 15, 25].flatMap((cx) =>
          [8, 22].map((cy) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" />
          ))
        )}
      </svg>
      <Typography component="span"
                  sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: { xs: 26, sm: 40 } }}>
        Auto Connect
      </Typography>
    </Box>
  );
}