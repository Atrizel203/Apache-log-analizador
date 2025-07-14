// src/utils/logAnalyzer.js
import { parse as parseDate } from 'date-fns';

class LogParser {
    constructor() {
        // ### FASE 1: ANALIZADOR LÉXICO - Definición de Tokens (Versión Definitiva) ###
        // Orden corregido y reglas simplificadas para máxima robustez.
        this.tokenDefinitions = [
            { type: 'TIMESTAMP',      regex: /^\[\d{2}\/[A-Za-z]{3}\/\d{4}:\d{2}:\d{2}:\d{2} [+-]\d{4}\]/ },
            { type: 'IP',             regex: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/ },
            { type: 'QUOTED_STRING',  regex: /^"[^"]*"/ },
            { type: 'METHOD',         regex: /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|CONNECT|TRACE|PATCH)/ },
            { type: 'PROTOCOL',       regex: /^HTTP\/\d\.\d/ },
            { type: 'DASH',           regex: /^-/ }, // Específico para el guion
            { type: 'NUMBER',         regex: /^\d+/ }, // Para CUALQUIER número (código o bytes)
            { type: 'WORD',           regex: /^\S+/ }, // Regla genérica al final
            { type: 'WHITESPACE',     regex: /^\s+/, ignore: true },
        ];

        // ... el resto del constructor (attackPatterns, etc.) no cambia ...
        this.attackPatterns = {
            sqlInjection: { regex: /(union\s*select|' OR '1'='1|'--|;--|exec\(|waitfor delay|benchmark\(|(?:\b(select|insert|update|delete|drop|alter|cast|convert)\b))/i, type: 'SQL Injection', confidence: 'high' },
            pathTraversal: { regex: /(\.\.\/|\.\.\\|%2e%2e\/|\/\.\.\/|%252e%252e%252f|\\etc\\passwd|\\win\.ini)/i, type: 'Path Traversal', confidence: 'high' },
            xss: { regex: /(<script>|alert\(|onerror=|onload=|javascript:|<iframe>|eval\(|document\.cookie|<svg\/onload)/i, type: 'Cross-Site Scripting (XSS)', confidence: 'medium' },
            automatedScan: { regex: /(nikto|sqlmap|nmap|wpscan|gobuster|feroxbuster|dirb|acunetix|metasploit)/i, type: 'Automated Scan Tool', confidence: 'high' }
        };
        this.ipRequestTimestamps = new Map();
        this.RATE_LIMIT_THRESHOLD = 10;
        this.RATE_LIMIT_WINDOW = 60 * 1000;
    }

    /**
     * ### FASE 1: ANALIZADOR LÉXICO ###
     */
    tokenize(line) {
        const tokens = [];
        let remainingLine = line.trim();

        while (remainingLine.length > 0) {
            let matched = false;
            for (const tokenDef of this.tokenDefinitions) {
                const match = remainingLine.match(tokenDef.regex);
                if (match) {
                    if (!tokenDef.ignore) {
                        tokens.push({ type: tokenDef.type, value: match[0] });
                    }
                    remainingLine = remainingLine.substring(match[0].length).trim();
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                throw new Error(`Carácter inesperado en la entrada: "${remainingLine[0]}"`);
            }
        }
        return tokens;
    }

    /**
     * ### FASE 2: ANALIZADOR SINTÁCTICO (Ajustado a los nuevos tokens) ###
     */
    parse(tokens) {
        let current = 0;

        const expect = (type) => {
            if (tokens[current] && tokens[current].type === type) {
                return tokens[current++];
            }
            throw new Error(`Se esperaba ${type} pero se encontró ${tokens[current]?.type || 'FIN DE ENTRADA'}`);
        };

        const expectOneOf = (types) => {
            if (tokens[current] && types.includes(tokens[current].type)) {
                return tokens[current++];
            }
            throw new Error(`Se esperaba uno de [${types.join(', ')}] pero se encontró ${tokens[current]?.type || 'FIN DE ENTRADA'}`);
        };

        const ast = {};
        
        ast.ip = expect('IP').value;
        ast.ident = expect('DASH').value;
        ast.user = expect('DASH').value;
        ast.timestamp = expect('TIMESTAMP').value.slice(1, -1);
        
        const requestString = expect('QUOTED_STRING').value.slice(1, -1);
        const requestParts = requestString.split(' ');
        
        ast.method = requestParts[0];
        ast.url = requestParts.slice(1, -1).join(' '); // Une la URL si tiene espacios
        ast.protocol = requestParts[requestParts.length - 1];

        ast.code = parseInt(expect('NUMBER').value, 10);
        
        const bytesToken = expectOneOf(['NUMBER', 'DASH']);
        ast.bytes = bytesToken.type === 'DASH' ? 0 : parseInt(bytesToken.value, 10);
        
        if (current < tokens.length) {
            ast.referer = expect('QUOTED_STRING').value.slice(1, -1);
            ast.userAgent = expect('QUOTED_STRING').value.slice(1, -1);
        } else {
            ast.referer = '-';
            ast.userAgent = '-';
        }
        
        return ast;
    }
    
    /**
     * ### FASE 3: ANALIZADOR SEMÁNTICO (con un pequeño ajuste) ###
     */
    analyzeSemantics(ast) {
        // ... (Este método casi no cambia, pero lo incluyo completo por claridad)
        const decodedUrl = decodeURIComponent(ast.url);

        for (const key in this.attackPatterns) {
            if (key === 'automatedScan') continue;
            const pattern = this.attackPatterns[key];
            const match = decodedUrl.match(pattern.regex);
            if (match) return { type: pattern.type, confidence: pattern.confidence, pattern: match[0] };
        }

        const uaPattern = this.attackPatterns.automatedScan;
        const uaMatch = ast.userAgent.match(uaPattern.regex);
        if (uaMatch) return { type: uaPattern.type, confidence: uaPattern.confidence, pattern: `User-Agent: ${uaMatch[0]}` };
        
        try {
            const timestamp = parseDate(ast.timestamp, "dd/MMM/yyyy:HH:mm:ss xx", new Date());
            if (timestamp.toString() === 'Invalid Date') return null; // Salida segura si la fecha es mala

            const now = timestamp.getTime();
            const ip = ast.ip;
            const pastTimestamps = (this.ipRequestTimestamps.get(ip) || []).filter(ts => (now - ts) < this.RATE_LIMIT_WINDOW);
            pastTimestamps.push(now);
            this.ipRequestTimestamps.set(ip, pastTimestamps);
            if (pastTimestamps.length > this.RATE_LIMIT_THRESHOLD) {
                return { type: 'Automated Scan (Rate Limit)', confidence: 'low', pattern: `> ${this.RATE_LIMIT_THRESHOLD} reqs/min` };
            }
        } catch(e) {
            // Ignorar errores en el análisis de rate-limit
        }

        return null;
    }
}

export default LogParser;