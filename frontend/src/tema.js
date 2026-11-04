import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3A549C' },
    background: { default: '#202533', paper: '#292D36' },
    divider: '#3C4869',
    text: { primary: '#FFFFFF', secondary: '#B8BFD1' },
    error: { main: '#FF8A80' },
  },
  typography: { fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif' },
  shape: { borderRadius: 0 },   // 0 = cantos retos, como no esboço
});

export default theme;