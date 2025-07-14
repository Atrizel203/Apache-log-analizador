// src/App.jsx
import { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Grid, Alert, Stack } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import LogParser from './utils/logAnalyzer';
import LexicalTable from './components/LexicalTable';
import SyntaxResult from './components/SyntaxResult';
import SemanticResult from './components/SemanticResult';

const sampleLog = `192.168.1.105 - - [15/Jun/2025:10:30:15 +0000] "GET /admin.php?id=1'%20OR%20'1'='1'-- HTTP/1.1" 200 5432 "-" "Mozilla/5.0 (compatible; sqlmap/1.7.0)"`;

function App() {
  const [inputText, setInputText] = useState(sampleLog);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      setError("El campo de entrada no puede estar vacío.");
      setAnalysisResult(null);
      return;
    }

    const parser = new LogParser();
    const lines = inputText.trim().split('\n').filter(line => line.trim());
    const results = [];
    const errors = [];
    
    lines.forEach((line, index) => {
      try {
        // FASE 1: Léxico
        const tokens = parser.tokenize(line);
        
        // FASE 2: Sintáctico
        const ast = parser.parse([...tokens]);
        
        // FASE 3: Semántico
        const attack = parser.analyzeSemantics(ast);

        results.push({ 
          lineNumber: index + 1, 
          originalLine: line, 
          tokens, 
          ast, 
          attack 
        });

      } catch (e) {
        console.error(`Error en línea ${index + 1}:`, e);
        errors.push({
          lineNumber: index + 1,
          originalLine: line,
          error: e.message
        });
      }
    });

    if (results.length > 0) {
      setAnalysisResult({ 
        allLogs: results, 
        errors: errors,
        totalProcessed: results.length,
        totalErrors: errors.length
      });
      setError(errors.length > 0 ? `Procesados ${results.length} logs, ${errors.length} con errores` : null);
    } else {
      setError("No se pudo procesar ningún log válido.");
      setAnalysisResult(null);
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Analizador de vulnerabilidades de Apache
      </Typography>
      
      <Box sx={{ my: 4 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="filled"
          label="Pega aquí tus logs de Apache (uno por línea)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <Button variant="contained" size="large" onClick={handleAnalyze} sx={{ mt: 2 }}>
          Analizar
        </Button>
      </Box>

      {error && !analysisResult && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}

      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Columna 1: Léxico */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>1. Análisis Léxico</Typography>
                <LexicalTable tokens={analysisResult.tokens} allLogs={analysisResult.allLogs} />
              </Grid>
              
              {/* Columna 2: Sintáctico y Semántico */}
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" gutterBottom>2. Análisis Sintáctico</Typography>
                    <SyntaxResult 
                      ast={analysisResult.ast} 
                      allLogs={analysisResult.allLogs}
                      error={error && !analysisResult.ast ? error : null} 
                    />
                  </Box>
                  <Box>
                    <Typography variant="h5" gutterBottom>3. Análisis Semántico</Typography>
                    <SemanticResult 
                      attack={analysisResult.attack} 
                      allLogs={analysisResult.allLogs}
                      error={error && !analysisResult.attack ? error : null} 
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}

export default App;