import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#176B70', dark: '#105459', light: '#E8F4F3' },
    background: { default: '#F4F7F8', paper: '#FFFFFF' },
    divider: '#E3E9EB',
    text: { primary: '#172A30', secondary: '#65767C' },
    success: { main: '#23836D' },
    error: { main: '#C34E52' },
  },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", Arial, sans-serif',
    h1: { fontWeight: 600, letterSpacing: '-0.04em' },
    h2: { fontWeight: 600, letterSpacing: '-0.03em' },
    h3: { fontWeight: 600, letterSpacing: '-0.025em' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16 },
        contained: { boxShadow: 'none' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
        notchedOutline: { borderColor: '#DCE4E6' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: '#65767C' },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&.Mui-disabled': {
            WebkitTextFillColor: '#65767C',
            opacity: 1,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            '&.Mui-disabled': {
              WebkitTextFillColor: '#65767C',
              color: '#65767C',
              opacity: 1,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { color: '#65767C', fontWeight: 600, backgroundColor: '#F7F9FA' },
        root: { borderColor: '#E8EDEE' },
      },
    },
  },
});

export default theme;
