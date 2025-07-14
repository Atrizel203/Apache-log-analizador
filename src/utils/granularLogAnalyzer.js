// src/utils/granularLogAnalyzer.js

// ¡OJO! Este analizador es SOLO para demostración léxica.
// No funcionará con el analizador sintáctico actual.

class GranularLogAnalyzer {
    constructor() {
        // ### ANALIZADOR LÉXICO HIPER-GRANULAR ###
        // Descompone absolutamente todo.
        this.tokenDefinitions = [
            // Símbolos primero para que no sean capturados por 'WORD'
            { type: 'LBRACKET',     regex: /^\[/ },
            { type: 'RBRACKET',     regex: /^\]/ },
            { type: 'LPAREN',       regex: /^\(/ },
            { type: 'RPAREN',       regex: /^\)/ },
            { type: 'QUOTE',        regex: /^"/ },
            { type: 'SLASH',        regex: /^\// },
            { type: 'SEMICOLON',    regex: /^;/ },
            { type: 'COLON',        regex: /^:/ },
            { type: 'QUESTION',     regex: /^\?/ },
            { type: 'AMPERSAND',    regex: /^&/ },
            { type: 'EQUALS',       regex: /^=/ },
            
            // Reglas más específicas
            { type: 'IP',           regex: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/ },
            { type: 'NUMBER',       regex: /^\d+(\.\d+)?/ }, // Captura enteros y decimales
            { type: 'METHOD',       regex: /^(GET|POST|PUT|DELETE|HEAD|OPTIONS)/ },
            { type: 'DASH',         regex: /^-/ },
            { type: 'WORD',         regex: /^[a-zA-Z][a-zA-Z0-9_%]*/ }, // Palabras (incluye %)
            { type: 'WHITESPACE',   regex: /^\s+/, ignore: true },
        ];
    }
    
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
                    remainingLine = remainingLine.substring(match[0].length);
                    // No hacemos trim aquí para preservar los espacios como separadores implícitos
                    if (tokenDef.ignore) {
                        remainingLine = remainingLine.trimStart();
                    }
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
}

export default GranularLogAnalyzer;