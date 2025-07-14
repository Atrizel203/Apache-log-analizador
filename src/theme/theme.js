// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e676', // Un verde brillante para acentos
    },
    background: {
      default: '#121212', // Negro profundo
      paper: '#1e1e1e',   // Un gris oscuro para las superficies como las tarjetas
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
});