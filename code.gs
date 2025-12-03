/**
 * Google Apps Script - code.gs
 * 
 * Este script expõe os dados de uma planilha Google como JSON
 * para ser consumido pelo dashboard HTML/JS.
 * 
 * INSTRUÇÕES DE USO:
 * 1. Abra sua planilha Google
 * 2. Vá em Extensões > Apps Script
 * 3. Cole este código no editor
 * 4. Clique em "Implantar" > "Nova implantação"
 * 5. Selecione "Aplicativo da Web"
 * 6. Configure:
 *    - Executar como: "Eu"
 *    - Quem pode acessar: "Qualquer pessoa"
 * 7. Copie a URL gerada e cole no arquivo script.js
 */

/**
 * Função principal que retorna os dados da planilha como JSON
 */
function doGet(e) {
  try {
    // Obtém a planilha ativa
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    // Obtém todos os dados
    const data = sheet.getDataRange().getValues();
    
    // A primeira linha contém os cabeçalhos
    const headers = data[0];
    
    // Converte os dados para um array de objetos
    const jsonData = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowData = {};
      
      for (let j = 0; j < headers.length; j++) {
        // Formata datas
        if (row[j] instanceof Date) {
          rowData[headers[j]] = Utilities.formatDate(row[j], Session.getScriptTimeZone(), "dd/MM/yyyy");
        } else {
          rowData[headers[j]] = row[j];
        }
      }
      
      jsonData.push(rowData);
    }
    
    // Retorna a resposta como JSON
    const response = {
      success: true,
      headers: headers,
      data: jsonData,
      lastUpdate: new Date().toISOString(),
      totalRows: jsonData.length
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Retorna erro em caso de falha
    const errorResponse = {
      success: false,
      error: error.message
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função para obter dados de uma aba específica
 * Pode ser chamada passando o parâmetro ?sheet=NomeDaAba na URL
 */
function doGetWithSheetName(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Obtém o nome da aba do parâmetro da URL ou usa a aba ativa
    const sheetName = e.parameter.sheet;
    const sheet = sheetName 
      ? spreadsheet.getSheetByName(sheetName) 
      : spreadsheet.getActiveSheet();
    
    if (!sheet) {
      throw new Error('Aba não encontrada: ' + sheetName);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const jsonData = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowData = {};
      
      for (let j = 0; j < headers.length; j++) {
        if (row[j] instanceof Date) {
          rowData[headers[j]] = Utilities.formatDate(row[j], Session.getScriptTimeZone(), "dd/MM/yyyy");
        } else {
          rowData[headers[j]] = row[j];
        }
      }
      
      jsonData.push(rowData);
    }
    
    const response = {
      success: true,
      sheetName: sheet.getName(),
      headers: headers,
      data: jsonData,
      lastUpdate: new Date().toISOString(),
      totalRows: jsonData.length
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.message
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função auxiliar para testar o script localmente
 * Execute esta função no editor do Apps Script para ver os dados
 */
function testGetData() {
  const result = doGet({});
  Logger.log(result.getContent());
}
