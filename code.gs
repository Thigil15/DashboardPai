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

    const data = getSheetDataAsJson(sheet);
    
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
// 4. HELPERS
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
