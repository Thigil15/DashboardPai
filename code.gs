/**
 * @fileoverview Backend para servir dados do Google Sheets como API REST JSON.
 * @author Senior Developer Helper
 */

// =================================================================
// 1. WEB APP CONTROLLER (API ENDPOINT)
// =================================================================

/**
 * Ponto de entrada para requisições HTTP GET.
 * Permite filtrar dados via URL Query Parameters.
 * * Exemplo de uso:
 * - Todos os dados: https://.../exec
 * - Aba específica: https://.../exec?sheet=WSEngenhariaEquipe
 * - Filtro chave/valor: https://.../exec?sheet=WSEngenhariaEquipe&Instituto=ICHC
 * * @param {Object} e - O objeto de evento contendo parâmetros da requisição.
 */
function doGet(e) {
  const params = e.parameter;
  const response = {
    status: 'success',
    timestamp: new Date().toISOString(),
    data: null
  };

  try {
    // 1. Busca todos os dados (estratégia cache-first poderia ser aplicada aqui)
    const allData = getAllSheetsData();

    // 2. Roteamento baseado na URL
    if (params.sheet) {
      // Rota: /exec?sheet=NomeDaAba
      const sheetName = params.sheet;
      
      if (!allData[sheetName]) {
        throw new Error(`Aba '${sheetName}' não encontrada.`);
      }

      let sheetData = allData[sheetName];

      // 3. Filtragem adicional (Opcional: Filtra por coluna específica se passada na URL)
      // Ex: ?sheet=Engenharia&Instituto=ICHC
      Object.keys(params).forEach(key => {
        if (key !== 'sheet') {
          sheetData = sheetData.filter(row => String(row[key]) === String(params[key]));
        }
      });

      response.data = sheetData;
    } else {
      // Rota Default: Retorna tudo
      response.data = allData;
    }

  } catch (error) {
    response.status = 'error';
    response.message = error.toString();
  }

  // Retorna JSON puro com MimeType correto para consumo externo (React, Vue, cURL, etc)
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// =================================================================
// 2. UI INTERACTION (MENU & MODAL)
// =================================================================

function onOpen() {
  SpreadsheetApp.getUi().createMenu('⚡ Admin Tools')
    .addItem('Gerar JSON (Visualizar)', 'uiExportToJson')
    .addToUi();
}

/**
 * Wrapper para a UI. Chama o Service e exibe o modal.
 */
function uiExportToJson() {
  const data = getAllSheetsData();
  const jsonString = JSON.stringify(data, null, 2);
  console.log(jsonString);
  showOutputModal(jsonString);
}

// =================================================================
// 3. SERVICE LAYER (CORE LOGIC)
// =================================================================

/**
 * Função Pura: Lê todas as abas e retorna o Objeto estruturado.
 * Desacoplada da UI para ser usada tanto pelo Menu quanto pelo doGet.
 * * @return {Object} Objeto contendo arrays de dados por aba.
 */
function getAllSheetsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const payload = {};

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    
    // Pula abas ocultas se necessário
    // if (sheet.isSheetHidden()) return; 

    let data = getSheetDataAsJson(sheet);
    
    // Process special sheets for attendance tracking
    if (sheetName === 'EscalaTeoria') {
      data = processEscalaTeoria(data);
    } else if (sheetName === 'EscalaPratica') {
      data = processEscalaPratica(data);
    } else if (sheetName === 'RegistroPonto') {
      data = processRegistroPonto(data);
    }
    
    if (data && data.length > 0) {
      payload[sheetName] = data;
    }
  });

  return payload;
}

/**
 * Extrai dados de uma aba específica.
 */
function getSheetDataAsJson(sheet) {
  const range = sheet.getDataRange();
  const values = range.getValues();

  if (values.length < 2) return [];

  const headers = values[0].map(header => String(header).trim());
  const rows = values.slice(1);

  const sheetData = rows.map((row) => {
    const rowObject = {};
    let hasData = false;

    headers.forEach((header, columnIndex) => {
      if (header !== "") {
        const cellValue = row[columnIndex];
        // Tratamento de Data: Se for objeto Date, mantém. O JSON.stringify converte depois.
        rowObject[header] = cellValue;

        if (cellValue !== "" && cellValue !== null) {
          hasData = true;
        }
      }
    });

    return hasData ? rowObject : null;
  }).filter(item => item !== null);

  return sheetData;
}

// =================================================================
// 4. ATTENDANCE PROCESSING FUNCTIONS
// =================================================================

/**
 * Processa dados da aba EscalaTeoria.
 * Em Teoria, todos os alunos estão escalados independente do F na escala.
 * O horário é fixo: 18h (tolerância até 18:10).
 * @param {Array} data - Array de objetos com dados da escala de teoria
 * @return {Array} Dados processados
 */
function processEscalaTeoria(data) {
  if (!data || data.length === 0) return data;
  
  return data.map(item => {
    // Clone the item to avoid mutation
    const processed = Object.assign({}, item);
    
    // Set type as Theory
    processed.TipoAula = 'Teoria';
    
    // In theory, all students are scheduled regardless of F
    // Override any "F" status - everyone must attend
    processed.Escalado = true;
    
    // Set fixed time for theory classes: 18:00
    processed.HorarioInicio = '18:00';
    processed.HorarioLimite = '18:10'; // Grace period
    
    return processed;
  });
}

/**
 * Processa dados da aba EscalaPratica.
 * Em Prática, F na escala significa folga (aluno não precisa comparecer).
 * @param {Array} data - Array de objetos com dados da escala prática
 * @return {Array} Dados processados
 */
function processEscalaPratica(data) {
  if (!data || data.length === 0) return data;
  
  return data.map(item => {
    // Clone the item to avoid mutation
    const processed = Object.assign({}, item);
    
    // Set type as Practice
    processed.TipoAula = 'Prática';
    
    // Check if student has "F" (Folga/day off)
    const escala = String(item.Escala || item.Status || '').toUpperCase();
    processed.Escalado = escala !== 'F' && escala !== 'FOLGA';
    
    return processed;
  });
}

/**
 * Processa dados da aba RegistroPonto.
 * Separa registros entre Teoria e Prática para evitar duplicação.
 * Aplica regras de atraso apropriadas para cada tipo.
 * @param {Array} data - Array de objetos com registros de ponto
 * @return {Array} Dados processados sem duplicação
 */
function processRegistroPonto(data) {
  if (!data || data.length === 0) return data;
  
  // Use a Map to track unique records and prevent duplication
  const uniqueRecords = new Map();
  
  data.forEach(item => {
    // Create a unique key based on student, date, and type
    const aluno = item.Aluno || item.Nome || '';
    const data = item.Data || item.Dia || '';
    const tipo = determineAttendanceType(item);
    const uniqueKey = `${aluno}_${data}_${tipo}`;
    
    // Only add if not already exists (prevents duplication)
    if (!uniqueRecords.has(uniqueKey)) {
      // Clone and process the item
      const processed = Object.assign({}, item);
      
      // Set the determined type
      processed.TipoAula = tipo;
      
      // Calculate lateness based on type
      const horarioEntrada = item.HorarioEntrada || item.Horario || '';
      
      if (tipo === 'Teoria') {
        // Theory: fixed time 18:00, late if after 18:10
        processed.Atraso = isLateForTeoria(horarioEntrada);
        processed.HorarioEscala = '18:00';
        processed.ToleranciaAte = '18:10';
      } else {
        // Practice: use scheduled time
        const horarioEscala = item.HorarioEscala || item.HorarioInicio || '';
        processed.Atraso = isLateForPratica(horarioEntrada, horarioEscala);
      }
      
      uniqueRecords.set(uniqueKey, processed);
    }
  });
  
  return Array.from(uniqueRecords.values());
}

/**
 * Determina o tipo de aula baseado nos dados do registro.
 * @param {Object} item - Registro de ponto
 * @return {string} 'Teoria' ou 'Prática'
 */
function determineAttendanceType(item) {
  // Check explicit type field first
  const tipo = String(item.TipoAula || item.Tipo || '').toLowerCase();
  
  if (tipo.includes('teoria') || tipo.includes('theory')) {
    return 'Teoria';
  }
  
  if (tipo.includes('pratica') || tipo.includes('prática') || tipo.includes('practice')) {
    return 'Prática';
  }
  
  // If no explicit type, try to infer from scheduled time
  // Theory classes are always at 18:00
  const horario = item.HorarioEscala || item.HorarioInicio || '';
  if (horario) {
    const hora = parseHour(horario);
    if (hora === 18) {
      return 'Teoria';
    }
  }
  
  // Default to Practice
  return 'Prática';
}

/**
 * Verifica se houve atraso em aula de Teoria.
 * Teoria começa às 18h, tolerância até 18:10.
 * @param {string|Date} horario - Horário de entrada
 * @return {boolean} True se atrasou
 */
function isLateForTeoria(horario) {
  if (!horario) return false;
  
  const hora = parseHour(horario);
  const minuto = parseMinute(horario);
  
  // Late if after 18:10
  if (hora > 18) return true;
  if (hora === 18 && minuto > 10) return true;
  
  return false;
}

/**
 * Verifica se houve atraso em aula Prática.
 * @param {string|Date} horarioEntrada - Horário de entrada
 * @param {string|Date} horarioEscala - Horário escalado
 * @param {number} tolerancia - Tolerância em minutos (default: 10)
 * @return {boolean} True se atrasou
 */
function isLateForPratica(horarioEntrada, horarioEscala, tolerancia) {
  tolerancia = tolerancia || 10;
  
  if (!horarioEntrada || !horarioEscala) return false;
  
  const horaEntrada = parseHour(horarioEntrada);
  const minutoEntrada = parseMinute(horarioEntrada);
  
  const horaEscala = parseHour(horarioEscala);
  const minutoEscala = parseMinute(horarioEscala);
  
  // Calculate limit time with tolerance
  const limiteMinutos = minutoEscala + tolerancia;
  const horaLimite = horaEscala + Math.floor(limiteMinutos / 60);
  const minutoLimite = limiteMinutos % 60;
  
  // Compare
  const entradaEmMinutos = horaEntrada * 60 + minutoEntrada;
  const limiteEmMinutos = horaLimite * 60 + minutoLimite;
  
  return entradaEmMinutos > limiteEmMinutos;
}

/**
 * Extrai a hora de uma string de horário ou Date.
 * @param {string|Date} horario
 * @return {number} Hora (0-23)
 */
function parseHour(horario) {
  if (horario instanceof Date) {
    return horario.getHours();
  }
  
  const str = String(horario);
  
  // ISO format
  if (str.includes('T')) {
    return new Date(str).getHours();
  }
  
  // HH:MM format
  if (str.includes(':')) {
    return parseInt(str.split(':')[0], 10) || 0;
  }
  
  return 0;
}

/**
 * Extrai os minutos de uma string de horário ou Date.
 * @param {string|Date} horario
 * @return {number} Minutos (0-59)
 */
function parseMinute(horario) {
  if (horario instanceof Date) {
    return horario.getMinutes();
  }
  
  const str = String(horario);
  
  // ISO format
  if (str.includes('T')) {
    return new Date(str).getMinutes();
  }
  
  // HH:MM format
  if (str.includes(':')) {
    const parts = str.split(':');
    return parseInt(parts[1], 10) || 0;
  }
  
  return 0;
}

// =================================================================
// 5. HELPERS
// =================================================================

function showOutputModal(content) {
  const htmlOutput = HtmlService.createHtmlOutput(`
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', monospace; background: #f4f4f4; padding: 15px; }
          textarea { width: 100%; height: 300px; border: 1px solid #ddd; padding: 10px; border-radius: 4px; font-family: monospace; }
          .btn { background: #2196F3; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 10px; }
          .btn:hover { background: #1976D2; }
        </style>
      </head>
      <body>
        <h3>Payload JSON Gerado</h3>
        <textarea id="jsonArea" readonly>${content}</textarea>
        <button class="btn" onclick="copyToClipboard()">Copiar JSON</button>
        <script>
          function copyToClipboard() {
            document.getElementById("jsonArea").select();
            document.execCommand("copy");
          }
        </script>
      </body>
    </html>
  `).setWidth(600).setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Visualizador de Dados');
}
