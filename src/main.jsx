// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme } from './theme/theme';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      {/* CssBaseline resetea los estilos para una mejor consistencia cross-browser */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);