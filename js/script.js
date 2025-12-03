// URL do Google Apps Script - Substitua pela URL do seu script publicado
const SCRIPT_URL = 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI';

// Elementos do DOM
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const dashboardElement = document.getElementById('dashboard');
const cardsContainer = document.getElementById('cards-container');
const tableHead = document.getElementById('table-head');
const tableBody = document.getElementById('table-body');

// Função para carregar os dados
async function loadData() {
    showLoading();
    
    // Configura timeout de 30 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
        const response = await fetch(SCRIPT_URL, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        displayData(data);
        showDashboard();
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('Timeout ao carregar dados');
        } else {
            console.error('Erro ao carregar dados:', error);
        }
        showError();
    }
}

// Função para exibir os dados
function displayData(data) {
    // Limpar containers
    cardsContainer.innerHTML = '';
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    
    // Verificar se há dados
    if (!data || !data.data || data.data.length === 0) {
        showError();
        return;
    }
    
    const rows = data.data;
    const headers = data.headers || Object.keys(rows[0]);
    
    // Criar cards de resumo
    createSummaryCards(rows, headers);
    
    // Criar tabela
    createTable(rows, headers);
}

// Função para criar cards de resumo
function createSummaryCards(rows, headers) {
    const icons = ['📈', '📊', '💰', '👥', '📦', '⭐', '🎯', '📝'];
    
    // Card com total de registros
    const totalCard = createCard('📋', rows.length, 'Total de Registros');
    cardsContainer.appendChild(totalCard);
    
    // Criar cards para colunas numéricas (soma ou média)
    headers.forEach((header, index) => {
        const numericValues = rows
            .map(row => parseFloat(row[header]))
            .filter(val => !isNaN(val));
        
        if (numericValues.length > 0) {
            const sum = numericValues.reduce((a, b) => a + b, 0);
            const icon = icons[index % icons.length];
            
            const card = createCard(icon, formatNumber(sum), `Total ${header}`);
            cardsContainer.appendChild(card);
        }
    });
}

// Função para criar um card
function createCard(icon, value, label) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-icon">${icon}</div>
        <div class="card-value">${value}</div>
        <div class="card-label">${label}</div>
    `;
    return card;
}

// Função para criar a tabela
function createTable(rows, headers) {
    // Criar cabeçalho
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);
    
    // Criar linhas de dados
    rows.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header] ?? '';
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// Função para formatar números
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

// Funções de controle de exibição
function showLoading() {
    loadingElement.style.display = 'flex';
    errorElement.style.display = 'none';
    dashboardElement.style.display = 'none';
}

function showError() {
    loadingElement.style.display = 'none';
    errorElement.style.display = 'block';
    dashboardElement.style.display = 'none';
}

function showDashboard() {
    loadingElement.style.display = 'none';
    errorElement.style.display = 'none';
    dashboardElement.style.display = 'block';
}

// Carregar dados quando a página carregar
document.addEventListener('DOMContentLoaded', loadData);

// ID do intervalo de atualização automática
let autoRefreshIntervalId = null;

// Função para atualizar dados automaticamente (opcional)
function startAutoRefresh(intervalMinutes = 5) {
    // Limpa intervalo anterior se existir
    if (autoRefreshIntervalId) {
        clearInterval(autoRefreshIntervalId);
    }
    autoRefreshIntervalId = setInterval(loadData, intervalMinutes * 60 * 1000);
    return autoRefreshIntervalId;
}

// Função para parar a atualização automática
function stopAutoRefresh() {
    if (autoRefreshIntervalId) {
        clearInterval(autoRefreshIntervalId);
        autoRefreshIntervalId = null;
    }
}

// Descomente a linha abaixo para ativar atualização automática a cada 5 minutos
// startAutoRefresh(5);
