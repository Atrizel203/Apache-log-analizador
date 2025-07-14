// src/components/LexicalTable.jsx
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip } from '@mui/material';

// Función para clasificar cada token según las columnas de la tabla (CORREGIDA)
const categorizeToken = (token) => {
  const prKeywords = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];
  if (prKeywords.includes(token.value)) return 'PR';

  switch (token.type) {
    case 'NUMBER':
      return 'Numeros';
    case 'WORD':
    case 'IP':
      return 'ID';
    case 'TIMESTAMP':
    case 'DASH':
    case 'QUOTED_STRING':
    case 'PROTOCOL':
      return 'Simbolos';
    default:
      // Cualquier otro token que no sea PR se considera ID si es una palabra
      if (token.type === 'METHOD') return 'ID';
      return 'Error';
  }
};

const LexicalTable = ({ tokens, allLogs }) => {
  const headers = ['Tokens', 'PR', 'ID', 'Numeros', 'Simbolos', 'Error'];

  // Si tenemos múltiples logs, mostrar todos los tokens de todos los logs
  if (allLogs && allLogs.length > 0) {
    const allTokens = allLogs.flatMap((log, logIndex) => 
      log.tokens.map(token => ({ ...token, logLine: logIndex + 1 }))
    );

    const totals = headers.slice(1).reduce((acc, header) => {
      acc[header] = 0;
      return acc;
    }, {});
    
    allTokens.forEach(t => {
        const category = categorizeToken(t);
        if (totals[category] !== undefined) {
            totals[category]++;
        }
    });

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="lexical analysis table">
          <TableHead>
            <TableRow>
              <TableCell><b>Línea</b></TableCell>
              {headers.map(header => <TableCell key={header}><b>{header}</b></TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {allTokens.map((token, index) => {
              const category = categorizeToken(token);
              return (
                <TableRow key={index} hover>
                  <TableCell>
                    <Chip label={`Log ${token.logLine}`} size="small" color="primary" />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Chip label={token.value.length > 50 ? `${token.value.substring(0, 50)}...` : token.value} 
                          variant="outlined" 
                          size="small"
                          title={token.value} />
                  </TableCell>
                  {headers.slice(1).map(header => (
                    <TableCell key={header} align="center">
                      {category === header ? <Typography color="primary" sx={{fontWeight: 'bold'}}>X</Typography> : ''}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {/* Fila de Totales */}
            <TableRow sx={{ '& > *': { backgroundColor: 'action.hover', borderTop: '2px solid' } }}>
              <TableCell><b>Total</b></TableCell>
              <TableCell><b>Total</b></TableCell>
              {headers.slice(1).map(header => (
                <TableCell key={`total-${header}`} align="center"><b>{totals[header]}</b></TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Compatibilidad hacia atrás para un solo log
  if (tokens) {
    const totals = headers.slice(1).reduce((acc, header) => {
      acc[header] = 0;
      return acc;
    }, {});
    
    tokens.forEach(t => {
        const category = categorizeToken(t);
        if (totals[category] !== undefined) {
            totals[category]++;
        }
    });

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="lexical analysis table">
          <TableHead>
            <TableRow>
              {headers.map(header => <TableCell key={header}><b>{header}</b></TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token, index) => {
              const category = categorizeToken(token);
              return (
                <TableRow key={index} hover>
                  <TableCell component="th" scope="row">
                    <Chip label={token.value.length > 50 ? `${token.value.substring(0, 50)}...` : token.value} 
                          variant="outlined" 
                          size="small"
                          title={token.value} />
                  </TableCell>
                  {headers.slice(1).map(header => (
                    <TableCell key={header} align="center">
                      {category === header ? <Typography color="primary" sx={{fontWeight: 'bold'}}>X</Typography> : ''}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {/* Fila de Totales */}
            <TableRow sx={{ '& > *': { backgroundColor: 'action.hover', borderTop: '2px solid' } }}>
              <TableCell><b>Total</b></TableCell>
              {headers.slice(1).map(header => (
                <TableCell key={`total-${header}`} align="center"><b>{totals[header]}</b></TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
      <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
        No hay tokens para mostrar
      </Typography>
    </TableContainer>
  );
};

export default LexicalTable;