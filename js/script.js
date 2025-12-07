// =====================================================
// Hospital das Clínicas CeAC Dashboard
// Professional Healthcare Dashboard
// =====================================================

// Configuration
const JSON_FILE_PATH = 'Banco De Dados.json';

// DOM Elements
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const dashboardElement = document.getElementById('dashboard');
const sidebarNav = document.getElementById('sidebar-nav');
const overviewSection = document.getElementById('overview-section');
const categorySection = document.getElementById('category-section');
const metricsGrid = document.getElementById('metrics-grid');
const headerStats = document.getElementById('header-stats');
const currentSectionBreadcrumb = document.getElementById('current-section');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');

// Global Data
let allData = null;
let currentView = 'overview';
let charts = {};

// Category Configuration
const dataCategories = {
    'InventarioCeaAC2025': {
        name: 'Inventário CeAC 2025',
        icon: '📦',
        color: '#1a91e7',
        bgColor: '#e8f4fd'
    },
    'SolicitacoesProntuarios': {
        name: 'Solicitações de Prontuários',
        icon: '📋',
        color: '#8b5cf6',
        bgColor: '#ede9fe'
    },
    'WSEngenhariaEquipe': {
        name: 'WS Engenharia - Equipe',
        icon: '👷',
        color: '#f59e0b',
        bgColor: '#fef3c7'
    },
    'WSEngenhariaMobiliarios ': {
        name: 'WS Engenharia - Mobiliários',
        icon: '🪑',
        color: '#ef4444',
        bgColor: '#fee2e2'
    },
    'PsicologiaEquipe': {
        name: 'Psicologia - Equipe',
        icon: '🧠',
        color: '#06b6d4',
        bgColor: '#cffafe'
    },
    'PsicologiaMobiliarios': {
        name: 'Psicologia - Mobiliários',
        icon: '🛋️',
        color: '#14b8a6',
        bgColor: '#ccfbf1'
    },
    'ControleInternoEquipe': {
        name: 'Controle Interno - Equipe',
        icon: '📊',
        color: '#10b981',
        bgColor: '#d1fae5'
    },
    'ControleInternoMobiliarios': {
        name: 'Controle Interno - Mobiliários',
        icon: '🗄️',
        color: '#22c55e',
        bgColor: '#dcfce7'
    },
    'QualidadeEquipe': {
        name: 'Qualidade - Equipe',
        icon: '⭐',
        color: '#eab308',
        bgColor: '#fef9c3'
    },
    'QualidadeMobiliarios': {
        name: 'Qualidade - Mobiliários',
        icon: '📐',
        color: '#f97316',
        bgColor: '#ffedd5'
    },
    'EngenhariaEquipe': {
        name: 'Engenharia - Equipe',
        icon: '⚙️',
        color: '#6366f1',
        bgColor: '#e0e7ff'
    },
    'EngenhariaMobiliarios': {
        name: 'Engenharia - Mobiliários',
        icon: '🔧',
        color: '#8b5cf6',
        bgColor: '#ede9fe'
    },
    'AssessoriaEquipe': {
        name: 'Assessoria - Equipe',
        icon: '💼',
        color: '#ec4899',
        bgColor: '#fce7f3'
    },
    'AssessoriaMobiliarios': {
        name: 'Assessoria - Mobiliários',
        icon: '📁',
        color: '#d946ef',
        bgColor: '#fae8ff'
    },
    'ComunicacaoEquipe': {
        name: 'Comunicação - Equipe',
        icon: '📢',
        color: '#0ea5e9',
        bgColor: '#e0f2fe'
    },
    'ComunicacaoMobiliarios': {
        name: 'Comunicação - Mobiliários',
        icon: '💻',
        color: '#0284c7',
        bgColor: '#e0f2fe'
    },
    'SalaReuniaoMobiliarios': {
        name: 'Sala de Reunião - Mobiliários',
        icon: '🏢',
        color: '#7c3aed',
        bgColor: '#ede9fe'
    },
    'Sala15Mobiliarios': {
        name: 'Sala 15 - Mobiliários',
        icon: '🚪',
        color: '#2563eb',
        bgColor: '#dbeafe'
    }
};

// Chart.js default configuration (if available)
function configureChartDefaults() {
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#64748b';
        
        // Register datalabels plugin if available
        if (typeof ChartDataLabels !== 'undefined') {
            try {
                Chart.register(ChartDataLabels);
            } catch (error) {
                console.warn('Falha ao registrar plugin ChartDataLabels:', error);
            }
        } else {
            console.warn('Plugin ChartDataLabels não está disponível. As porcentagens nos gráficos podem não ser exibidas.');
        }
    }
}

// Check if Chart.js is loaded
const isChartJsLoaded = () => typeof Chart !== 'undefined';

// Get standard pie chart options with percentage labels (for small charts with few items)
function getPieChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return `${context.label}: ${context.raw} (${percentage}%)`;
                    }
                }
            },
            datalabels: {
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 13
                },
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    // Only show percentage if slice is at least 5% to avoid overlap in small charts
                    if (parseFloat(percentage) < 5) {
                        return '';
                    }
                    return percentage + '%';
                },
                anchor: 'center',
                align: 'center',
                offset: 0,
                clamp: true
            }
        }
    };
}

// Get pie chart options for medium-sized charts (5-8 items)
function getPieChartOptionsMedium() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 12,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return `${context.label}: ${context.raw} (${percentage}%)`;
                    }
                }
            },
            datalabels: {
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 12
                },
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    // Only show percentage if slice is at least 4% to avoid overlap in medium charts
                    if (parseFloat(percentage) < 4) {
                        return '';
                    }
                    return percentage + '%';
                },
                anchor: 'center',
                align: 'center',
                offset: 0,
                clamp: true
            }
        }
    };
}

// Get pie chart options with smaller legend (for large charts with many items)
function getPieChartOptionsCompact() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 8,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 10
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return `${context.label}: ${context.raw} (${percentage}%)`;
                    }
                }
            },
            datalabels: {
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 11
                },
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    // Only show percentage if slice is at least 3% to avoid overlap in large charts with many items
                    if (parseFloat(percentage) < 3) {
                        return '';
                    }
                    return percentage + '%';
                },
                anchor: 'center',
                align: 'center',
                offset: 0,
                clamp: true
            }
        }
    };
}

// =====================================================
// Data Loading
// =====================================================

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
        
        initializeDashboard();
        showDashboard();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError();
    }
}

// =====================================================
// Dashboard Initialization
// =====================================================

function initializeDashboard() {
    // Configure Chart.js if available
    configureChartDefaults();
    
    // Update last update time
    document.getElementById('last-update').textContent = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Build navigation
    buildNavigation();
    
    // Update header stats
    updateHeaderStats();
    
    // Show overview by default
    showOverview();
}

// =====================================================
// Navigation
// =====================================================

function buildNavigation() {
    sidebarNav.innerHTML = '';
    
    // Overview item
    const overviewItem = createNavItem('overview', '📊', 'Visão Geral', null, true);
    sidebarNav.appendChild(overviewItem);
    
    // Separator
    const separator = document.createElement('div');
    separator.style.cssText = 'height: 1px; background: rgba(255,255,255,0.1); margin: 12px 0;';
    sidebarNav.appendChild(separator);
    
    // Category items
    Object.keys(allData).forEach(category => {
        const config = dataCategories[category] || {
            name: category,
            icon: '📂',
            color: '#1a91e7'
        };
        
        const count = Array.isArray(allData[category]) ? allData[category].length : 0;
        const navItem = createNavItem(category, config.icon, config.name, count);
        sidebarNav.appendChild(navItem);
    });
}

function createNavItem(id, icon, label, badge, isActive = false) {
    const item = document.createElement('button');
    item.className = `nav-item${isActive ? ' active' : ''}`;
    item.dataset.category = id;
    
    item.innerHTML = `
        <span class="nav-icon">${icon}</span>
        <span class="nav-label">${label}</span>
        ${badge !== null ? `<span class="nav-badge">${formatNumber(badge)}</span>` : ''}
    `;
    
    item.addEventListener('click', () => {
        if (id === 'overview') {
            showOverview();
        } else {
            showCategory(id);
        }
    });
    
    return item;
}

function updateActiveNavItem(categoryId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === categoryId) {
            item.classList.add('active');
        }
    });
}

// =====================================================
// Header Stats
// =====================================================

function updateHeaderStats() {
    let totalRecords = 0;
    let totalCategories = Object.keys(allData).length;
    
    Object.values(allData).forEach(data => {
        if (Array.isArray(data)) {
            totalRecords += data.length;
        }
    });
    
    headerStats.innerHTML = `
        <div class="header-stat">
            <span class="header-stat-value">${formatNumber(totalRecords)}</span>
            <span class="header-stat-label">Registros</span>
        </div>
        <div class="header-stat">
            <span class="header-stat-value">${totalCategories}</span>
            <span class="header-stat-label">Categorias</span>
        </div>
    `;
}

// =====================================================
// Overview Section
// =====================================================

function showOverview() {
    currentView = 'overview';
    updateActiveNavItem('overview');
    currentSectionBreadcrumb.textContent = 'Visão Geral';
    
    overviewSection.style.display = 'block';
    categorySection.style.display = 'none';
    
    // Calculate totals
    let totalRecords = 0;
    Object.values(allData).forEach(data => {
        if (Array.isArray(data)) totalRecords += data.length;
    });
    
    document.getElementById('total-records-badge').textContent = `${formatNumber(totalRecords)} registros`;
    
    // Build metrics
    buildOverviewMetrics();
    
    // Build charts
    buildOverviewCharts();
}

function buildOverviewMetrics() {
    const inventario = allData['InventarioCeaAC2025'] || [];
    const solicitacoes = allData['SolicitacoesProntuarios'] || [];
    
    // Count inventory by status
    const emUso = inventario.filter(item => item['STATUS'] === 'EM USO').length;
    
    // Count requests by status
    const pendentes = solicitacoes.filter(item => item['STATUS'] === 'PENDENTE').length;
    const enviados = solicitacoes.filter(item => item['STATUS'] === 'ENVIADO').length;
    
    // Count total staff
    let totalEquipe = 0;
    Object.keys(allData).forEach(key => {
        if (key.includes('Equipe') && Array.isArray(allData[key])) {
            allData[key].forEach(item => {
                const qty = parseInt(item['QuantidadePessoas'] || item['QuantidadePrestadores'] || 0);
                totalEquipe += qty;
            });
        }
    });
    
    // Count furniture
    let totalMesas = 0, totalCadeiras = 0, totalComputadores = 0;
    Object.keys(allData).forEach(key => {
        if (key.includes('Mobiliario') && Array.isArray(allData[key])) {
            allData[key].forEach(item => {
                totalMesas += parseInt(item['QuantidadeMesa'] || 0);
                totalCadeiras += parseInt(item['QuantidadeCadeiras'] || 0);
                totalComputadores += parseInt(item['QuantidadeMicrocomputadores'] || 0);
            });
        }
    });
    
    metricsGrid.innerHTML = `
        <div class="metric-card" style="--metric-color: #1a91e7; --metric-bg: #e8f4fd;">
            <div class="metric-header">
                <div class="metric-icon">📦</div>
            </div>
            <div class="metric-value">${formatNumber(inventario.length)}</div>
            <div class="metric-label">Itens no Inventário</div>
            <div class="metric-sublabel">${formatNumber(emUso)} em uso</div>
        </div>
        <div class="metric-card" style="--metric-color: #8b5cf6; --metric-bg: #ede9fe;">
            <div class="metric-header">
                <div class="metric-icon">📋</div>
            </div>
            <div class="metric-value">${formatNumber(solicitacoes.length)}</div>
            <div class="metric-label">Solicitações</div>
            <div class="metric-sublabel">${formatNumber(pendentes)} pendentes</div>
        </div>
        <div class="metric-card" style="--metric-color: #10b981; --metric-bg: #d1fae5;">
            <div class="metric-header">
                <div class="metric-icon">✅</div>
            </div>
            <div class="metric-value">${formatNumber(enviados)}</div>
            <div class="metric-label">Solicitações Enviadas</div>
            <div class="metric-sublabel">${((enviados / (solicitacoes.length || 1)) * 100).toFixed(1)}% do total</div>
        </div>
        <div class="metric-card" style="--metric-color: #f59e0b; --metric-bg: #fef3c7;">
            <div class="metric-header">
                <div class="metric-icon">👥</div>
            </div>
            <div class="metric-value">${formatNumber(totalEquipe)}</div>
            <div class="metric-label">Colaboradores</div>
            <div class="metric-sublabel">Em todas as equipes</div>
        </div>
        <div class="metric-card" style="--metric-color: #06b6d4; --metric-bg: #cffafe;">
            <div class="metric-header">
                <div class="metric-icon">🖥️</div>
            </div>
            <div class="metric-value">${formatNumber(totalComputadores)}</div>
            <div class="metric-label">Computadores</div>
            <div class="metric-sublabel">Equipamentos de TI</div>
        </div>
        <div class="metric-card" style="--metric-color: #ec4899; --metric-bg: #fce7f3;">
            <div class="metric-header">
                <div class="metric-icon">🪑</div>
            </div>
            <div class="metric-value">${formatNumber(totalMesas + totalCadeiras)}</div>
            <div class="metric-label">Mobiliário</div>
            <div class="metric-sublabel">${totalMesas} mesas, ${totalCadeiras} cadeiras</div>
        </div>
    `;
}

function buildOverviewCharts() {
    // Check if Chart.js is loaded
    if (!isChartJsLoaded()) {
        console.warn('Chart.js não está disponível. Gráficos não serão exibidos.');
        // Hide chart containers or show fallback
        document.querySelectorAll('.chart-card').forEach(card => {
            card.querySelector('.chart-body').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <p>Gráfico disponível em breve</p>
                </div>
            `;
        });
        return;
    }
    
    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    charts = {};
    
    const chartColors = ['#1a91e7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
    const inventario = allData['InventarioCeaAC2025'] || [];
    const solicitacoes = allData['SolicitacoesProntuarios'] || [];
    
    // Chart 1: Inventory Status (Pie)
    const statusCount = {};
    inventario.forEach(item => {
        const status = item['STATUS'] || 'N/A';
        statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    const statusCtx = document.getElementById('inventoryStatusChart');
    if (statusCtx) {
        const statusItemCount = Object.keys(statusCount).length;
        // Small chart - few items (use standard options)
        charts.inventoryStatus = new Chart(statusCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(statusCount),
                datasets: [{
                    data: Object.values(statusCount),
                    backgroundColor: chartColors.slice(0, statusItemCount),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: getPieChartOptions()
        });
    }
    
    // Chart 2: Requests Status (Pie)
    const requestStatusCount = {};
    solicitacoes.forEach(item => {
        const status = item['STATUS'] || 'N/A';
        requestStatusCount[status] = (requestStatusCount[status] || 0) + 1;
    });
    
    const requestsCtx = document.getElementById('requestsStatusChart');
    if (requestsCtx && Object.keys(requestStatusCount).length > 0) {
        const reqItemCount = Object.keys(requestStatusCount).length;
        // Small chart - few items (use standard options)
        charts.requestsStatus = new Chart(requestsCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(requestStatusCount),
                datasets: [{
                    data: Object.values(requestStatusCount),
                    backgroundColor: chartColors.slice(0, reqItemCount),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: getPieChartOptions()
        });
    }
    
    // Chart 3: Inventory by Sector (Pie - Top 10)
    const sectorCount = {};
    inventario.forEach(item => {
        const setor = item['SETOR'] || 'N/A';
        sectorCount[setor] = (sectorCount[setor] || 0) + 1;
    });
    
    // Sort and get top 10
    const topSectors = Object.entries(sectorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const sectorCtx = document.getElementById('inventorySectorChart');
    if (sectorCtx && topSectors.length > 0) {
        charts.inventorySector = new Chart(sectorCtx, {
            type: 'pie',
            data: {
                labels: topSectors.map(s => s[0]),
                datasets: [{
                    data: topSectors.map(s => s[1]),
                    backgroundColor: chartColors.slice(0, topSectors.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: getPieChartOptionsCompact()
        });
    }
    
    // Chart 4: Inventory by Floor (Pie)
    const floorCount = {};
    inventario.forEach(item => {
        const andar = item['ANDAR'] || 'N/A';
        floorCount[andar] = (floorCount[andar] || 0) + 1;
    });
    
    const floorCtx = document.getElementById('inventoryFloorChart');
    if (floorCtx) {
        const floorItemCount = Object.keys(floorCount).length;
        // Use appropriate options based on number of items
        const floorOptions = floorItemCount > 5 ? getPieChartOptionsMedium() : getPieChartOptions();
        charts.inventoryFloor = new Chart(floorCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(floorCount),
                datasets: [{
                    data: Object.values(floorCount),
                    backgroundColor: chartColors.slice(0, floorItemCount),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: floorOptions
        });
    }
    
    // Chart 5: Top Specialties (Pie)
    const specialtyCount = {};
    solicitacoes.forEach(item => {
        const esp = item['ESPECIALIDADE ASSISTENCIAL:'] || item['ESPECIALIDADE MEDICINA DO TRABALHO:'];
        if (esp && esp !== '' && esp !== 'N/A') {
            specialtyCount[esp] = (specialtyCount[esp] || 0) + 1;
        }
    });
    
    const topSpecialties = Object.entries(specialtyCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    const specialtiesCtx = document.getElementById('specialtiesChart');
    if (specialtiesCtx && topSpecialties.length > 0) {
        // Medium chart - 8 items (use medium options)
        charts.specialties = new Chart(specialtiesCtx, {
            type: 'pie',
            data: {
                labels: topSpecialties.map(s => s[0].length > 15 ? s[0].substring(0, 15) + '...' : s[0]),
                datasets: [{
                    data: topSpecialties.map(s => s[1]),
                    backgroundColor: chartColors.slice(0, topSpecialties.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: getPieChartOptionsMedium()
        });
    }
}

// =====================================================
// Category Section
// =====================================================

function showCategory(categoryId) {
    currentView = categoryId;
    updateActiveNavItem(categoryId);
    
    const config = dataCategories[categoryId] || { name: categoryId, icon: '📂' };
    currentSectionBreadcrumb.textContent = config.name;
    
    overviewSection.style.display = 'none';
    categorySection.style.display = 'block';
    
    const data = allData[categoryId] || [];
    
    // Update header
    document.getElementById('category-name').textContent = config.name;
    document.querySelector('#category-title .section-icon').textContent = config.icon;
    document.getElementById('category-records-badge').textContent = `${formatNumber(data.length)} registros`;
    
    // Build category-specific content
    buildCategoryMetrics(categoryId, data);
    buildCategoryCharts(categoryId, data);
    buildCategoryTable(categoryId, data);
}

function buildCategoryMetrics(categoryId, data) {
    // Clear metrics container - we'll use charts only
    const metricsContainer = document.getElementById('category-metrics');
    metricsContainer.innerHTML = '';
}

function buildCategoryCharts(categoryId, data) {
    const chartsContainer = document.getElementById('category-charts');
    chartsContainer.innerHTML = '';
    
    if (!Array.isArray(data) || data.length === 0) return;
    
    // Check if Chart.js is loaded
    if (!isChartJsLoaded()) {
        return;
    }
    
    // Destroy existing category charts
    Object.keys(charts).forEach(key => {
        if (key.startsWith('categoryChart') && charts[key] && typeof charts[key].destroy === 'function') {
            charts[key].destroy();
            delete charts[key];
        }
    });
    
    const chartColors = ['#1a91e7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
    let chartIndex = 1;
    
    // Helper function to create a pie chart with intelligent sizing
    function createPieChart(title, subtitle, canvasId, labels, dataValues, sizeHint = 'auto') {
        const itemCount = labels.length;
        
        // Determine chart size and options based on number of items
        let chartSize = 'normal';
        let chartOptions;
        
        if (sizeHint === 'auto') {
            if (itemCount <= 4) {
                chartSize = 'small';
                chartOptions = getPieChartOptions();
            } else if (itemCount <= 8) {
                chartSize = 'medium';
                chartOptions = getPieChartOptionsMedium();
            } else {
                chartSize = 'large';
                chartOptions = getPieChartOptionsCompact();
            }
        } else if (sizeHint === 'small') {
            chartSize = 'small';
            chartOptions = getPieChartOptions();
        } else if (sizeHint === 'medium') {
            chartSize = 'medium';
            chartOptions = getPieChartOptionsMedium();
        } else if (sizeHint === 'large') {
            chartSize = 'large';
            chartOptions = getPieChartOptionsCompact();
        }
        
        const chartCard = document.createElement('div');
        chartCard.className = `chart-card chart-size-${chartSize}`;
        chartCard.innerHTML = `
            <div class="chart-header">
                <h3 class="chart-title">${title}</h3>
                <span class="chart-subtitle">${subtitle}</span>
            </div>
            <div class="chart-body">
                <canvas id="${canvasId}"></canvas>
            </div>
        `;
        chartsContainer.appendChild(chartCard);
        
        setTimeout(() => {
            const ctx = document.getElementById(canvasId);
            if (ctx && labels.length > 0) {
                charts['categoryChart' + chartIndex] = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: dataValues,
                            backgroundColor: chartColors.slice(0, labels.length),
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: chartOptions
                });
                chartIndex++;
            }
        }, 100);
    }
    
    // Inventory - Status pie chart
    if (categoryId === 'InventarioCeaAC2025') {
        const statusCount = {};
        const setorCount = {};
        const andarCount = {};
        const patrimonioCount = {};
        const predioCount = {};
        const salaCount = {};
        const situacaoCount = {};
        const descricaoCount = {};
        
        data.forEach(item => {
            const status = item['STATUS'] || 'N/A';
            statusCount[status] = (statusCount[status] || 0) + 1;
            
            const setor = item['SETOR'] || 'N/A';
            setorCount[setor] = (setorCount[setor] || 0) + 1;
            
            const andar = item['ANDAR'] || 'N/A';
            andarCount[andar] = (andarCount[andar] || 0) + 1;
            
            const patrimonio = item['PATRIMÔNIOS - CeAC'] || 'N/A';
            patrimonioCount[patrimonio] = (patrimonioCount[patrimonio] || 0) + 1;
            
            const predio = item['PRÉDIO'] || 'N/A';
            predioCount[predio] = (predioCount[predio] || 0) + 1;
            
            const sala = item['SALA'] || 'N/A';
            salaCount[sala] = (salaCount[sala] || 0) + 1;
            
            const situacao = item['SITUAÇÃO'] || 'N/A';
            situacaoCount[situacao] = (situacaoCount[situacao] || 0) + 1;
            
            const descricao = item['DESCRIÇÃO DOS BENS'] || 'N/A';
            descricaoCount[descricao] = (descricaoCount[descricao] || 0) + 1;
        });
        
        createPieChart('Inventário por Status', 'Distribuição dos itens por status', 'inventarioStatusPie', Object.keys(statusCount), Object.values(statusCount), 'auto');
        createPieChart('Inventário por Andar', 'Distribuição dos itens por andar', 'inventarioAndarPie', Object.keys(andarCount), Object.values(andarCount), 'auto');
        createPieChart('Inventário por Tipo de Patrimônio', 'Tipos de patrimônio', 'inventarioPatrimonioPie', Object.keys(patrimonioCount), Object.values(patrimonioCount), 'auto');
        createPieChart('Inventário por Prédio', 'Distribuição por edifício', 'inventarioPredioPie', Object.keys(predioCount), Object.values(predioCount), 'auto');
        createPieChart('Inventário por Situação', 'Condição dos itens', 'inventarioSituacaoPie', Object.keys(situacaoCount), Object.values(situacaoCount), 'auto');
        
        // Top 8 sectors - medium size
        const topSetores = Object.entries(setorCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
        createPieChart('Top 8 Setores', 'Setores com mais itens', 'inventarioSetorPie', topSetores.map(s => s[0]), topSetores.map(s => s[1]), 'medium');
        
        // Top 10 rooms - large size
        const topSalas = Object.entries(salaCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
        createPieChart('Top 10 Salas', 'Salas com mais itens', 'inventarioSalaPie', topSalas.map(s => s[0]), topSalas.map(s => s[1]), 'large');
        
        // Top 10 item descriptions - large size
        const topDescricoes = Object.entries(descricaoCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
        createPieChart('Top 10 Tipos de Itens', 'Itens mais comuns no inventário', 'inventarioDescricaoPie', topDescricoes.map(s => s[0]), topDescricoes.map(s => s[1]), 'large');
    }
    
    // Solicitações - Status pie chart
    if (categoryId === 'SolicitacoesProntuarios') {
        const statusCount = {};
        const tipoCount = {};
        const especialidadeCount = {};
        
        data.forEach(item => {
            const status = item['STATUS'] || 'N/A';
            statusCount[status] = (statusCount[status] || 0) + 1;
            
            const tipo = item['SOLICITAÇÃO:'] || 'N/A';
            if (tipo !== 'N/A') {
                const shortTipo = tipo.split(' - ')[0];
                tipoCount[shortTipo] = (tipoCount[shortTipo] || 0) + 1;
            }
            
            const esp = item['ESPECIALIDADE ASSISTENCIAL:'] || item['ESPECIALIDADE MEDICINA DO TRABALHO:'];
            if (esp && esp !== '') {
                especialidadeCount[esp] = (especialidadeCount[esp] || 0) + 1;
            }
        });
        
        createPieChart('Solicitações por Status', 'Distribuição por status', 'solicitacoesStatusPie', Object.keys(statusCount), Object.values(statusCount), 'auto');
        createPieChart('Solicitações por Tipo', 'Tipos de solicitação', 'solicitacoesTipoPie', Object.keys(tipoCount), Object.values(tipoCount), 'auto');
        
        // Top 8 especialidades - medium size
        const topEsp = Object.entries(especialidadeCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
        if (topEsp.length > 0) {
            createPieChart('Top 8 Especialidades', 'Especialidades mais solicitadas', 'solicitacoesEspPie', topEsp.map(s => s[0]), topEsp.map(s => s[1]), 'medium');
        }
    }
    
    // WS Engenharia - Equipe
    if (categoryId === 'WSEngenhariaEquipe') {
        const localCount = {};
        data.forEach(item => {
            const local = item['LocalAtualInstituto'] || 'N/A';
            const qty = parseInt(item['QuantidadePrestadores'] || 0);
            localCount[local] = (localCount[local] || 0) + qty;
        });
        
        createPieChart('Pessoas por Instituto', 'Quantidade de prestadores por local atual', 'wsEquipePie', Object.keys(localCount), Object.values(localCount), 'auto');
    }
    
    // WS Engenharia - Mobiliários
    if (categoryId === 'WSEngenhariaMobiliarios ') {
        // By Instituto
        const institutoTotals = {};
        let totalMesas = 0, totalCadeiras = 0, totalMicros = 0, totalImpressoras = 0, totalGaveteiros = 0, totalArmarios = 0;
        
        data.forEach(item => {
            const instituto = item['Instituto'] || 'N/A';
            const total = parseInt(item['QuantidadeMesa'] || 0) + 
                          parseInt(item['QuantidadeCadeiras'] || 0) + 
                          parseInt(item['QuantidadeMicrocomputadores'] || 0);
            institutoTotals[instituto] = (institutoTotals[instituto] || 0) + total;
            
            totalMesas += parseInt(item['QuantidadeMesa'] || 0);
            totalCadeiras += parseInt(item['QuantidadeCadeiras'] || 0);
            totalMicros += parseInt(item['QuantidadeMicrocomputadores'] || 0);
            totalImpressoras += parseInt(item['QuantidadeImpressora'] || 0);
            totalGaveteiros += parseInt(item['Quantidadegaveteiro'] || 0);
            totalArmarios += parseInt(item['QuantidadeArmário'] || 0);
        });
        
        createPieChart('Itens por Instituto', 'Total de mobiliário por instituto', 'wsMobInstitutoPie', Object.keys(institutoTotals), Object.values(institutoTotals), 'auto');
        
        const tipoItems = {};
        if (totalMesas > 0) tipoItems['Mesas'] = totalMesas;
        if (totalCadeiras > 0) tipoItems['Cadeiras'] = totalCadeiras;
        if (totalMicros > 0) tipoItems['Microcomputadores'] = totalMicros;
        if (totalImpressoras > 0) tipoItems['Impressoras'] = totalImpressoras;
        if (totalGaveteiros > 0) tipoItems['Gaveteiros'] = totalGaveteiros;
        if (totalArmarios > 0) tipoItems['Armários'] = totalArmarios;
        
        createPieChart('Tipos de Mobiliário', 'Distribuição por tipo de item', 'wsMobTipoPie', Object.keys(tipoItems), Object.values(tipoItems), 'auto');
    }
    
    // Psicologia - Equipe
    if (categoryId === 'PsicologiaEquipe') {
        const espCount = {};
        const localCount = {};
        data.forEach(item => {
            const esp = item['Especialidade'] || 'N/A';
            const qty = parseInt(item['QuantidadePessoas'] || 0);
            espCount[esp] = (espCount[esp] || 0) + qty;
            
            const local = item['LocalAtual'] || 'N/A';
            localCount[local] = (localCount[local] || 0) + qty;
        });
        
        createPieChart('Pessoas por Especialidade', 'Distribuição da equipe', 'psicologiaEspPie', Object.keys(espCount), Object.values(espCount), 'auto');
        createPieChart('Pessoas por Local', 'Local atual da equipe', 'psicologiaLocalPie', Object.keys(localCount), Object.values(localCount), 'auto');
    }
    
    // Psicologia - Mobiliários
    if (categoryId === 'PsicologiaMobiliarios') {
        let mesas = 0, micros = 0, cadeiras = 0, cadeirasFix = 0;
        data.forEach(item => {
            mesas += parseInt(item['QuantidadeMesa'] || 0);
            micros += parseInt(item['QuantidadeMicrocomputadores'] || 0);
            cadeiras += parseInt(item['QuantidadeCadeiras'] || 0);
            cadeirasFix += parseInt(item['QuantidadeCadeirasfixas'] || 0);
        });
        
        const items = {};
        if (mesas > 0) items['Mesas'] = mesas;
        if (micros > 0) items['Microcomputadores'] = micros;
        if (cadeiras > 0) items['Cadeiras Giratórias'] = cadeiras;
        if (cadeirasFix > 0) items['Cadeiras Fixas'] = cadeirasFix;
        
        createPieChart('Tipos de Mobiliário', 'Distribuição por tipo', 'psicologiaMobPie', Object.keys(items), Object.values(items), 'auto');
    }
    
    // Generic Equipe categories
    if (categoryId.includes('Equipe') && !['WSEngenhariaEquipe', 'PsicologiaEquipe'].includes(categoryId)) {
        const cargoCount = {};
        const localCount = {};
        data.forEach(item => {
            const cargo = item['Cargo'] || item['Especialidade'] || 'Outros';
            const qty = parseInt(item['QuantidadePessoas'] || item['QuantidadePrestadores'] || 0);
            cargoCount[cargo] = (cargoCount[cargo] || 0) + qty;
            
            const local = item['Local Atual'] || item['LocalAtual'] || 'N/A';
            localCount[local] = (localCount[local] || 0) + qty;
        });
        
        createPieChart('Pessoas por Cargo', 'Distribuição da equipe por função', 'equipeCargoPie', Object.keys(cargoCount), Object.values(cargoCount), 'auto');
        createPieChart('Pessoas por Local', 'Local atual da equipe', 'equipeLocalPie', Object.keys(localCount), Object.values(localCount), 'auto');
    }
    
    // Generic Mobiliários categories
    if (categoryId.includes('Mobiliario') && !['WSEngenhariaMobiliarios ', 'PsicologiaMobiliarios'].includes(categoryId)) {
        let mesas = 0, cadeiras = 0, micros = 0, impressoras = 0, tvs = 0;
        data.forEach(item => {
            mesas += parseInt(item['QuantidadeMesa'] || 0);
            cadeiras += parseInt(item['QuantidadeCadeiras'] || 0);
            micros += parseInt(item['QuantidadeMicrocomputadores'] || 0);
            impressoras += parseInt(item['QuantidadeImpressora'] || item['QunatidadeImpressora'] || 0);
            tvs += parseInt(item['TV'] || 0);
        });
        
        const items = {};
        if (mesas > 0) items['Mesas'] = mesas;
        if (cadeiras > 0) items['Cadeiras'] = cadeiras;
        if (micros > 0) items['Microcomputadores'] = micros;
        if (impressoras > 0) items['Impressoras'] = impressoras;
        if (tvs > 0) items['TVs'] = tvs;
        
        createPieChart('Tipos de Mobiliário', 'Distribuição por tipo de item', 'mobiliarioPie', Object.keys(items), Object.values(items), 'auto');
    }
    
    // ControleOS - if exists
    if (categoryId === 'ControleOS') {
        const statusCount = {};
        const tipoCount = {};
        
        data.forEach(item => {
            // Try to find status and type fields
            Object.keys(item).forEach(key => {
                if (key.toLowerCase().includes('status')) {
                    const status = item[key] || 'N/A';
                    statusCount[status] = (statusCount[status] || 0) + 1;
                }
                if (key.toLowerCase().includes('tipo')) {
                    const tipo = item[key] || 'N/A';
                    tipoCount[tipo] = (tipoCount[tipo] || 0) + 1;
                }
            });
        });
        
        if (Object.keys(statusCount).length > 0) {
            createPieChart('Distribuição por Status', 'Status dos registros', 'controleOSStatusPie', Object.keys(statusCount), Object.values(statusCount), 'auto');
        }
        if (Object.keys(tipoCount).length > 0) {
            createPieChart('Distribuição por Tipo', 'Tipos de registros', 'controleOSTipoPie', Object.keys(tipoCount), Object.values(tipoCount), 'auto');
        }
    }
    
    // SolicitacaoDocumentos
    if (categoryId === 'SolicitacaoDocumentos') {
        const statusCount = {};
        
        data.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key.toLowerCase().includes('status')) {
                    const status = item[key] || 'N/A';
                    statusCount[status] = (statusCount[status] || 0) + 1;
                }
            });
        });
        
        if (Object.keys(statusCount).length > 0) {
            createPieChart('Distribuição por Status', 'Status das solicitações', 'solDocStatusPie', Object.keys(statusCount), Object.values(statusCount), 'auto');
        }
    }
}

function buildCategoryTable(categoryId, data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '';
    
    if (!Array.isArray(data) || data.length === 0) {
        tableContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>Nenhum dado disponível</h3>
                <p>Esta categoria não possui registros.</p>
            </div>
        `;
        return;
    }
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Get headers (first 8 columns max for better display)
    const allHeaders = Object.keys(data[0]);
    const headers = allHeaders.slice(0, 8);
    
    // Create header row
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.length > 25 ? header.substring(0, 25) + '...' : header;
        th.title = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    
    // Create data rows (limit to 100 for performance)
    const displayData = data.slice(0, 100);
    displayData.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            let value = row[header];
            
            // Format value
            if (value === null || value === undefined || value === '') {
                value = '-';
            } else if (typeof value === 'boolean') {
                value = value ? 'Sim' : 'Não';
            } else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
                try {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        value = date.toLocaleDateString('pt-BR');
                    }
                } catch (e) { /* keep original */ }
            }
            
            // Apply status badge
            if (header === 'STATUS' || header === 'Status') {
                const statusClass = getStatusClass(value);
                td.innerHTML = `<span class="status-badge ${statusClass}">${value}</span>`;
            } else {
                td.textContent = typeof value === 'string' && value.length > 50 
                    ? value.substring(0, 50) + '...' 
                    : value;
                td.title = value;
            }
            
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    
    // Add footer if there's more data
    if (data.length > 100) {
        const footer = document.createElement('div');
        footer.className = 'table-footer';
        footer.innerHTML = `
            <span>Mostrando 100 de ${formatNumber(data.length)} registros</span>
            <span>Para ver todos os dados, exporte para planilha</span>
        `;
        tableContainer.appendChild(footer);
    }
    
    // Setup search
    setupTableSearch();
}

function getStatusClass(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'enviado' || statusLower === 'finalizado' || statusLower === 'em uso') {
        return 'success';
    } else if (statusLower === 'pendente') {
        return 'warning';
    } else if (statusLower === 'erro' || statusLower === 'cancelado') {
        return 'danger';
    }
    return 'info';
}

function setupTableSearch() {
    const searchInput = document.getElementById('table-search');
    if (!searchInput) return;
    
    // Remove existing listener by replacing the element with a clone
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    newSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#table-container tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// =====================================================
// Utility Functions
// =====================================================

function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    num = parseInt(num);
    if (isNaN(num)) return '0';
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('pt-BR');
}

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

// =====================================================
// Mobile Menu Toggle
// =====================================================

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        
        // Create/toggle overlay
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }
        overlay.classList.toggle('active');
    });
}

// Track viewport size for mobile detection
let isMobileView = window.innerWidth < 992;
window.addEventListener('resize', () => {
    isMobileView = window.innerWidth < 992;
});

// Close sidebar on nav item click (mobile)
sidebarNav.addEventListener('click', (e) => {
    if (isMobileView && e.target.closest('.nav-item')) {
        sidebar.classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('active');
    }
});

// =====================================================
// Initialize
// =====================================================

document.addEventListener('DOMContentLoaded', loadData);
