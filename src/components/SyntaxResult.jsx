// src/components/SyntaxResult.jsx
import { Paper, Typography, Box, Alert } from '@mui/material';

const SyntaxResult = ({ ast, error, allLogs }) => {
  if (error) {
    return <Alert severity="error"><b>Error de Sintaxis:</b> {error}</Alert>;
  }

  // Si tenemos múltiples logs, mostrar todos
  if (allLogs && allLogs.length > 0) {
    return (
      <Paper sx={{ p: 2, backgroundColor: 'background.default', height: '100%' }}>
        <Typography variant="h6" gutterBottom>Árbol de Sintaxis</Typography>
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, fontSize: '0.875rem', maxHeight: '400px', overflow: 'auto' }}>
          {JSON.stringify(allLogs.map(log => ({
            linea: log.lineNumber,
            original: log.originalLine,
            ast: log.ast
          })), null, 2)}
        </Box>
      </Paper>
    );
  }

  // Si solo tenemos un AST individual (compatibilidad hacia atrás)
  if (ast) {
    return (
      <Paper sx={{ p: 2, backgroundColor: 'background.default', height: '100%' }}>
        <Typography variant="h6" gutterBottom>Árbol de Sintaxis</Typography>
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, fontSize: '0.875rem' }}>
          {JSON.stringify(ast, null, 2)}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, backgroundColor: 'background.default', height: '100%' }}>
      <Typography variant="h6" gutterBottom>Análisis Sintáctico</Typography>
      <Alert severity="info">No hay datos de log para analizar sintácticamente.</Alert>
    </Paper>
  );
};

export default SyntaxResult;