// Caminho para o arquivo JSON local
const JSON_FILE_PATH = 'Banco De Dados.json';

// Elementos do DOM
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const dashboardElement = document.getElementById('dashboard');
const cardsContainer = document.getElementById('cards-container');
const tabsContainer = document.getElementById('tabs-container');
const tabContent = document.getElementById('tab-content');

// Dados globais
let allData = null;
let currentTab = null;

// Configuração das categorias de dados
const dataCategories = {
    'InventarioCeaAC2025': {
        name: 'Inventário CeAC 2025',
        icon: '📦',
        color: '#667eea'
    },
    'SolicitacoesProntuarios': {
        name: 'Solicitações de Prontuários',
        icon: '📋',
        color: '#764ba2'
    },
    'WSEngenhariaEquipe': {
        name: 'WS Engenharia - Equipe',
        icon: '👷',
        color: '#f093fb'
    },
    'WSEngenhariaMobiliarios ': {
        name: 'WS Engenharia - Mobiliários',
        icon: '🪑',
        color: '#f5576c'
    },
    'PsicologiaEquipe': {
        name: 'Psicologia - Equipe',
        icon: '🧠',
        color: '#4facfe'
    },
    'PsicologiaMobiliarios': {
        name: 'Psicologia - Mobiliários',
        icon: '🛋️',
        color: '#00f2fe'
    },
    'ControleInternoEquipe': {
        name: 'Controle Interno - Equipe',
        icon: '📊',
        color: '#43e97b'
    },
    'ControleInternoMobiliarios': {
        name: 'Controle Interno - Mobiliários',
        icon: '🗄️',
        color: '#38f9d7'
    },
    'QualidadeEquipe': {
        name: 'Qualidade - Equipe',
        icon: '⭐',
        color: '#fa709a'
    },
    'QualidadeMobiliarios': {
        name: 'Qualidade - Mobiliários',
        icon: '📐',
        color: '#fee140'
    },
    'EngenhariaEquipe': {
        name: 'Engenharia - Equipe',
        icon: '⚙️',
        color: '#30cfd0'
    },
    'EngenhariaMobiliarios': {
        name: 'Engenharia - Mobiliários',
        icon: '🔧',
        color: '#330867'
    },
    'AssessoriaEquipe': {
        name: 'Assessoria - Equipe',
        icon: '💼',
        color: '#a8edea'
    },
    'AssessoriaMobiliarios': {
        name: 'Assessoria - Mobiliários',
        icon: '📁',
        color: '#fed6e3'
    },
    'ComunicacaoEquipe': {
        name: 'Comunicação - Equipe',
        icon: '📢',
        color: '#d299c2'
    },
    'ComunicacaoMobiliarios': {
        name: 'Comunicação - Mobiliários',
        icon: '💻',
        color: '#fef9d7'
    },
    'SalaReuniaoMobiliarios': {
        name: 'Sala de Reunião - Mobiliários',
        icon: '🏢',
        color: '#89f7fe'
    },
    'Sala15Mobiliarios': {
        name: 'Sala 15 - Mobiliários',
        icon: '🚪',
        color: '#66a6ff'
    }
};

// Função para carregar os dados do arquivo JSON local
async function loadData() {
    showLoading();
    
    try {
        const response = await fetch(JSON_FILE_PATH);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar o arquivo JSON');
        }
        
        allData = await response.json();
        
        if (!allData || Object.keys(allData).length === 0) {
            throw new Error('Arquivo JSON vazio');
        }
        
        displayDashboard();
        showDashboard();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError();
    }
}

// Função para exibir o dashboard completo
function displayDashboard() {
    // Limpar containers
    cardsContainer.innerHTML = '';
    tabsContainer.innerHTML = '';
    tabContent.innerHTML = '';
    
    // Criar cards de resumo geral
    createGlobalSummaryCards();
    
    // Criar tabs para cada categoria
    createTabs();
    
    // Selecionar primeira tab
    const firstTab = Object.keys(allData)[0];
    if (firstTab) {
        selectTab(firstTab);
    }
}

// Função para criar cards de resumo global
function createGlobalSummaryCards() {
    const categories = Object.keys(allData);
    
    // Card com total de categorias
    const categoriesCard = createCard('📂', categories.length, 'Categorias de Dados');
    cardsContainer.appendChild(categoriesCard);
    
    // Card com total de registros
    let totalRecords = 0;
    categories.forEach(cat => {
        if (Array.isArray(allData[cat])) {
            totalRecords += allData[cat].length;
        }
    });
    const recordsCard = createCard('📋', formatNumber(totalRecords), 'Total de Registros');
    cardsContainer.appendChild(recordsCard);
    
    // Cards específicos para dados importantes
    if (allData['InventarioCeaAC2025']) {
        const inventario = allData['InventarioCeaAC2025'];
        const emUso = inventario.filter(item => item['STATUS'] === 'EM USO').length;
        const inventarioCard = createCard('📦', formatNumber(emUso), 'Itens em Uso (Inventário)');
        cardsContainer.appendChild(inventarioCard);
    }
    
    if (allData['SolicitacoesProntuarios']) {
        const solicitacoes = allData['SolicitacoesProntuarios'];
        const pendentes = solicitacoes.filter(item => item['STATUS'] === 'PENDENTE').length;
        const enviados = solicitacoes.filter(item => item['STATUS'] === 'ENVIADO').length;
        
        const pendentesCard = createCard('⏳', formatNumber(pendentes), 'Solicitações Pendentes');
        cardsContainer.appendChild(pendentesCard);
        
        const enviadosCard = createCard('✅', formatNumber(enviados), 'Solicitações Enviadas');
        cardsContainer.appendChild(enviadosCard);
    }
    
    // Card de equipe total
    let totalEquipe = 0;
    categories.forEach(cat => {
        if (cat.includes('Equipe') && Array.isArray(allData[cat])) {
            allData[cat].forEach(item => {
                const qty = item['QuantidadePessoas'] || item['QuantidadePrestadores'] || 0;
                totalEquipe += parseInt(qty) || 0;
            });
        }
    });
    if (totalEquipe > 0) {
        const equipeCard = createCard('👥', formatNumber(totalEquipe), 'Total de Pessoas');
        cardsContainer.appendChild(equipeCard);
    }
}

// Função para criar tabs
function createTabs() {
    const categories = Object.keys(allData);
    
    categories.forEach(category => {
        const config = dataCategories[category] || {
            name: category,
            icon: '📄',
            color: '#667eea'
        };
        
        const tab = document.createElement('button');
        tab.className = 'tab-button';
        tab.dataset.category = category;
        tab.innerHTML = `<span class="tab-icon">${config.icon}</span> ${config.name}`;
        tab.style.setProperty('--tab-color', config.color);
        
        tab.addEventListener('click', () => selectTab(category));
        
        tabsContainer.appendChild(tab);
    });
}

// Função para selecionar uma tab
function selectTab(category) {
    currentTab = category;
    
    // Atualizar estado das tabs
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        }
    });
    
    // Exibir conteúdo da tab
    displayTabContent(category);
}

// Função para exibir conteúdo de uma tab
function displayTabContent(category) {
    tabContent.innerHTML = '';
    
    const data = allData[category];
    if (!Array.isArray(data) || data.length === 0) {
        tabContent.innerHTML = '<p class="no-data">Nenhum dado disponível para esta categoria.</p>';
        return;
    }
    
    const config = dataCategories[category] || { name: category, icon: '📄', color: '#667eea' };
    
    // Container para cards da categoria
    const categoryCardsContainer = document.createElement('div');
    categoryCardsContainer.className = 'category-cards';
    
    // Criar cards específicos para a categoria
    createCategoryCards(data, category, categoryCardsContainer);
    
    tabContent.appendChild(categoryCardsContainer);
    
    // Criar tabela
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    
    const tableTitle = document.createElement('h2');
    tableTitle.innerHTML = `${config.icon} ${config.name}`;
    tableContainer.appendChild(tableTitle);
    
    const table = document.createElement('table');
    table.id = 'data-table';
    
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Obter headers
    const headers = Object.keys(data[0]);
    
    // Criar cabeçalho
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    
    // Criar linhas de dados (limitado a 100 para performance)
    const displayData = data.slice(0, 100);
    displayData.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            let value = row[header];
            
            // Formatar valores especiais
            if (value === null || value === undefined || value === '') {
                value = '-';
            } else if (typeof value === 'boolean') {
                value = value ? 'Sim' : 'Não';
            } else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
                // Formatar data ISO
                try {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        value = date.toLocaleDateString('pt-BR');
                    }
                } catch (e) {
                    // Manter valor original se falhar
                }
            }
            
            td.textContent = value;
            
            // Aplicar estilo para status
            if (header === 'STATUS' || header === 'Status') {
                td.classList.add('status-cell');
                if (value === 'PENDENTE' || value === 'Pendente') {
                    td.classList.add('status-pending');
                } else if (value === 'ENVIADO' || value === 'Enviado' || value === 'Finalizado') {
                    td.classList.add('status-sent');
                } else if (value === 'EM USO' || value === 'Em uso') {
                    td.classList.add('status-in-use');
                }
            }
            
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    
    // Mostrar mensagem se houver mais dados
    if (data.length > 100) {
        const moreDataMsg = document.createElement('p');
        moreDataMsg.className = 'more-data-msg';
        moreDataMsg.textContent = `Mostrando 100 de ${data.length} registros.`;
        tableContainer.appendChild(moreDataMsg);
    }
    
    tabContent.appendChild(tableContainer);
}

// Função para criar cards específicos de cada categoria
function createCategoryCards(data, category, container) {
    const cards = [];
    
    // Card com total de registros
    cards.push(createCard('📋', data.length, 'Total de Registros'));
    
    // Cards específicos baseados na categoria
    if (category === 'InventarioCeaAC2025') {
        // Contar por status
        const statusCount = {};
        const setorCount = {};
        const andarCount = {};
        
        data.forEach(item => {
            const status = item['STATUS'] || 'N/A';
            const setor = item['SETOR'] || 'N/A';
            const andar = item['ANDAR'] || 'N/A';
            
            statusCount[status] = (statusCount[status] || 0) + 1;
            setorCount[setor] = (setorCount[setor] || 0) + 1;
            andarCount[andar] = (andarCount[andar] || 0) + 1;
        });
        
        // Top setores
        const topSetores = Object.entries(setorCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        topSetores.forEach((item, index) => {
            const icons = ['🥇', '🥈', '🥉'];
            cards.push(createCard(icons[index], item[1], `Setor: ${item[0]}`));
        });
        
    } else if (category === 'SolicitacoesProntuarios') {
        // Contar por status
        const statusCount = {};
        const especialidadeCount = {};
        
        data.forEach(item => {
            const status = item['STATUS'] || 'N/A';
            const especialidade = item['ESPECIALIDADE ASSISTENCIAL:'] || item['ESPECIALIDADE MEDICINA DO TRABALHO:'] || 'N/A';
            
            statusCount[status] = (statusCount[status] || 0) + 1;
            if (especialidade && especialidade !== 'N/A' && especialidade !== '') {
                especialidadeCount[especialidade] = (especialidadeCount[especialidade] || 0) + 1;
            }
        });
        
        Object.entries(statusCount).forEach(([status, count]) => {
            const icon = status === 'ENVIADO' ? '✅' : status === 'PENDENTE' ? '⏳' : '📄';
            cards.push(createCard(icon, count, status));
        });
        
    } else if (category.includes('Equipe')) {
        // Somar total de pessoas
        let totalPessoas = 0;
        const cargoCount = {};
        
        data.forEach(item => {
            const qty = parseInt(item['QuantidadePessoas'] || item['QuantidadePrestadores'] || 0);
            totalPessoas += qty;
            
            const cargo = item['Cargo'] || item['Especialidade'] || 'N/A';
            cargoCount[cargo] = (cargoCount[cargo] || 0) + qty;
        });
        
        cards.push(createCard('👥', totalPessoas, 'Total de Pessoas'));
        
    } else if (category.includes('Mobiliario')) {
        // Somar mobiliários
        let totalMesas = 0;
        let totalCadeiras = 0;
        let totalMicros = 0;
        
        data.forEach(item => {
            totalMesas += parseInt(item['QuantidadeMesa'] || 0);
            totalCadeiras += parseInt(item['QuantidadeCadeiras'] || 0);
            totalMicros += parseInt(item['QuantidadeMicrocomputadores'] || 0);
        });
        
        if (totalMesas > 0) cards.push(createCard('🪑', totalMesas, 'Mesas'));
        if (totalCadeiras > 0) cards.push(createCard('💺', totalCadeiras, 'Cadeiras'));
        if (totalMicros > 0) cards.push(createCard('🖥️', totalMicros, 'Computadores'));
    }
    
    cards.forEach(card => container.appendChild(card));
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
