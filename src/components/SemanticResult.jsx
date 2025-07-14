// src/components/SemanticResult.jsx
import { Paper, Typography, Chip, Alert, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const SemanticResult = ({ attack, error, allLogs }) => {
  if (error) {
    return <Alert severity="error"><b>Error Semántico:</b> {error}</Alert>;
  }

  // Si tenemos múltiples logs, mostrar todos los ataques detectados
  if (allLogs && allLogs.length > 0) {
    const attacksDetected = allLogs.filter(log => log.attack);
    const cleanLogs = allLogs.filter(log => !log.attack);

    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>Resultado del Análisis Semántico - Todos los Logs</Typography>
        <Stack spacing={2}>
          {attacksDetected.length > 0 ? (
            <>
              <Alert severity="warning">
                <b>¡Amenazas Detectadas!</b> Se encontraron {attacksDetected.length} logs con patrones de ataque.
              </Alert>
              {attacksDetected.map((log, index) => (
                <Paper key={index} sx={{ p: 2, borderLeft: `4px solid`, borderColor: log.attack.confidence === 'high' ? 'error.main' : 'warning.main' }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="primary">
                      <b>Log #{log.lineNumber}:</b> {log.originalLine.substring(0, 80)}...
                    </Typography>
                    <Chip label="¡Amenaza Detectada!" color={log.attack.confidence === 'high' ? 'error' : 'warning'} size="small" />
                    <Typography variant="body2"><b>Tipo:</b> {log.attack.type}</Typography>
                    <Typography variant="body2"><b>Patrón:</b> <Chip label={log.attack.pattern} size="small" variant="outlined" /></Typography>
                    <Typography variant="body2"><b>Confianza:</b> {log.attack.confidence}</Typography>
                  </Stack>
                </Paper>
              ))}
            </>
          ) : (
            <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />}>
              <b>Análisis Semántico Completo:</b> No se detectaron patrones de ataque en ninguno de los {allLogs.length} logs.
            </Alert>
          )}
          
          {cleanLogs.length > 0 && (
            <Alert severity="info">
              <b>Logs Limpios:</b> {cleanLogs.length} logs no presentaron amenazas detectables.
            </Alert>
          )}
        </Stack>
      </Paper>
    );
  }

  // Compatibilidad hacia atrás para un solo ataque
  if (!attack) {
    return (
      <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />}>
        <b>Análisis Semántico Completo:</b> No se detectaron patrones de ataque.
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%', borderLeft: `4px solid`, borderColor: attack.confidence === 'high' ? 'error.main' : 'warning.main' }}>
        <Typography variant="h6" gutterBottom>Resultado del Análisis Semántico</Typography>
        <Stack spacing={1}>
            <Chip label="¡Amenaza Detectada!" color={attack.confidence === 'high' ? 'error' : 'warning'} />
            <Typography><b>Tipo:</b> {attack.type}</Typography>
            <Typography><b>Patrón:</b> <Chip label={attack.pattern} size="small" variant="outlined" /></Typography>
            <Typography><b>Confianza:</b> {attack.confidence}</Typography>
        </Stack>
    </Paper>
  );
};

export default SemanticResult;