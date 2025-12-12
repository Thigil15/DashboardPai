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
    'SolicitacaoDocumentos': {
        name: 'Solicitação de Documentos',
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
    },
    'ControleOS': {
        name: 'Controle de OS',
        icon: '🔧',
        color: '#f97316',
        bgColor: '#ffedd5'
    },
    'EscalaTeoria': {
        name: 'Escala Teoria',
        icon: '📚',
        color: '#3b82f6',
        bgColor: '#dbeafe'
    },
    'EscalaPratica': {
        name: 'Escala Prática',
        icon: '🔬',
        color: '#10b981',
        bgColor: '#d1fae5'
    },
    'RegistroPonto': {
        name: 'Registro de Ponto',
        icon: '⏰',
        color: '#8b5cf6',
        bgColor: '#ede9fe'
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

// Get standard pie chart options - percentages shown only in tooltip
function getPieChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            }
        },
        plugins: {
            legend: {
                display: false  // Hide default legend since we show custom percentage table
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
                display: false  // Hide percentages on the chart itself
            }
        }
    };
}

// Get pie chart options for medium-sized charts (5-8 items)
function getPieChartOptionsMedium() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            }
        },
        plugins: {
            legend: {
                display: false  // Hide default legend since we show custom percentage table
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
                display: false  // Hide percentages on the chart itself
            }
        }
    };
}

// Get pie chart options with smaller legend (for large charts with many items)
function getPieChartOptionsCompact() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            }
        },
        plugins: {
            legend: {
                display: false  // Hide default legend since we show custom percentage table
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
                display: false  // Hide percentages on the chart itself
            }
        }
    };
}

// Create a legend table to show next to pie charts (circle + percentage only)
function createLegendTable(labels, dataValues, colors) {
    const total = dataValues.reduce((a, b) => a + b, 0);
    
    let tableHTML = '<div class="chart-legend-table"><table><tbody>';
    
    labels.forEach((label, index) => {
        const value = dataValues[index];
        const percentage = ((value / total) * 100).toFixed(1);
        const color = colors[index];
        
        tableHTML += `
            <tr>
                <td class="legend-color">
                    <span class="legend-color-box" style="background-color: ${color}"></span>
                </td>
                <td class="legend-value">${percentage}%</td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table></div>';
    return tableHTML;
}

// Create a legend labels section to show below pie charts (circle + name)
function createLegendLabels(labels, colors) {
    let labelsHTML = '<div class="chart-legend-labels">';
    
    labels.forEach((label, index) => {
        const color = colors[index];
        
        labelsHTML += `
            <div class="legend-label-item">
                <span class="legend-color-dot" style="background-color: ${color}"></span>
                <span class="legend-label-text">${label}</span>
            </div>
        `;
    });
    
    labelsHTML += '</div>';
    return labelsHTML;
}

// Get horizontal bar chart options (for charts with many items) - displays percentages
function getHorizontalBarChartOptions() {
    return {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return `${context.label}: ${percentage}% (${context.raw})`;
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
                    return `${percentage}%`;
                },
                anchor: 'end',
                align: 'start',
                offset: 4,
                clamp: true
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        // Hide raw values on axis, chart will display percentages on bars
                        return '';
                    }
                }
            },
            y: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            }
        }
    };
}

// Get vertical bar chart options (for medium-sized charts) - displays percentages
function getBarChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 30
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return `${context.label}: ${percentage}% (${context.raw})`;
                    }
                }
            },
            datalabels: {
                color: '#334155',
                font: {
                    weight: 'bold',
                    size: 10
                },
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${percentage}%`;
                },
                anchor: 'end',
                align: 'top',
                offset: 2
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 10
                    },
                    maxRotation: 45,
                    minRotation: 0
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        // Hide raw values on axis, chart will display percentages on bars
                        return '';
                    }
                }
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
    const solicitacoes = allData['SolicitacaoDocumentos'] || [];
    const registroPonto = allData['RegistroPonto'] || [];
    const escalaTeoria = allData['EscalaTeoria'] || [];
    const escalaPratica = allData['EscalaPratica'] || [];
    
    // Count inventory by status
    const emUso = inventario.filter(item => item['STATUS'] === 'EM USO').length;
    
    // Count requests by status
    const pendentes = solicitacoes.filter(item => item['STATUS'] === 'PENDENTE' || item['STATUS DA SOLICITAÇÃO'] === 'PENDENTE').length;
    const enviados = solicitacoes.filter(item => item['STATUS'] === 'ENVIADO' || item['STATUS DA SOLICITAÇÃO'] === 'ENVIADO').length;
    
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
    
    // Count attendance records by type
    let totalTeoria = 0;
    let totalPratica = 0;
    let atrasosTeoria = 0;
    
    registroPonto.forEach(item => {
        const tipo = determineAttendanceType(item);
        if (tipo === 'Teoria') {
            totalTeoria++;
            // Check for late arrivals in theory (after 18:10)
            const horario = item['HorarioEntrada'] || item['Horario'] || '';
            if (horario && checkIfLateForTeoria(horario, 18, 10)) {
                atrasosTeoria++;
            }
        } else {
            totalPratica++;
        }
    });
    
    // Build metrics HTML
    let metricsHTML = `
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
    
    // Add attendance metrics if data is available
    if (registroPonto.length > 0 || escalaTeoria.length > 0 || escalaPratica.length > 0) {
        metricsHTML += `
            <div class="metric-card" style="--metric-color: #3b82f6; --metric-bg: #dbeafe;">
                <div class="metric-header">
                    <div class="metric-icon">📚</div>
                </div>
                <div class="metric-value">${formatNumber(escalaTeoria.length || totalTeoria)}</div>
                <div class="metric-label">Aulas Teoria</div>
                <div class="metric-sublabel">Início: 18h (tolerância 10min)</div>
            </div>
            <div class="metric-card" style="--metric-color: #10b981; --metric-bg: #d1fae5;">
                <div class="metric-header">
                    <div class="metric-icon">🔬</div>
                </div>
                <div class="metric-value">${formatNumber(escalaPratica.length || totalPratica)}</div>
                <div class="metric-label">Aulas Prática</div>
                <div class="metric-sublabel">Horários variáveis</div>
            </div>
        `;
        
        if (registroPonto.length > 0) {
            metricsHTML += `
                <div class="metric-card" style="--metric-color: #8b5cf6; --metric-bg: #ede9fe;">
                    <div class="metric-header">
                        <div class="metric-icon">⏰</div>
                    </div>
                    <div class="metric-value">${formatNumber(registroPonto.length)}</div>
                    <div class="metric-label">Registros de Ponto</div>
                    <div class="metric-sublabel">${atrasosTeoria} atrasos em teoria</div>
                </div>
            `;
        }
    }
    
    metricsGrid.innerHTML = metricsHTML;
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
    const solicitacoes = allData['SolicitacaoDocumentos'] || [];
    
    // Chart 1: Inventory Status (Pie)
    const statusCount = {};
    inventario.forEach(item => {
        const status = item['STATUS'] || 'SEM STATUS';
        statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    const statusCtx = document.getElementById('inventoryStatusChart');
    if (statusCtx) {
        const statusLabels = Object.keys(statusCount);
        const statusValues = Object.values(statusCount);
        const statusItemCount = statusLabels.length;
        const statusColors = chartColors.slice(0, statusItemCount);
        
        // Small chart - few items (use standard options)
        charts.inventoryStatus = new Chart(statusCtx, {
            type: 'pie',
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusValues,
                    backgroundColor: statusColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: getPieChartOptions()
        });
        
        // Add legend table to the chart body
        const chartBody = statusCtx.closest('.chart-body');
        if (chartBody) {
            chartBody.classList.add('with-legend-table');
            const legendTable = createLegendTable(statusLabels, statusValues, statusColors);
            chartBody.insertAdjacentHTML('beforeend', legendTable);
            
            // Add legend labels below the chart
            const chartCard = statusCtx.closest('.chart-card');
            if (chartCard) {
                const legendLabels = createLegendLabels(statusLabels, statusColors);
                chartCard.insertAdjacentHTML('beforeend', legendLabels);
            }
        }
    }
    
    // Chart 2: Requests Status (Pie)
    const requestStatusCount = {};
    solicitacoes.forEach(item => {
        const status = item['STATUS DA SOLICITAÇÃO'] || item['STATUS'] || 'SEM STATUS';
        requestStatusCount[status] = (requestStatusCount[status] || 0) + 1;
    });
    
    const requestsCtx = document.getElementById('requestsStatusChart');
    if (requestsCtx && Object.keys(requestStatusCount).length > 0) {
        const reqLabels = Object.keys(requestStatusCount);
        const reqValues = Object.values(requestStatusCount);
        const reqItemCount = reqLabels.length;
        const reqColors = chartColors.slice(0, reqItemCount);
        
        // Small chart - few items (use standard options)
        charts.requestsStatus = new Chart(requestsCtx, {
            type: 'pie',
            data: {
                labels: reqLabels,
                datasets: [{
                    data: reqValues,
                    backgroundColor: reqColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: getPieChartOptions()
        });
        
        // Add legend table to the chart body
        const chartBody = requestsCtx.closest('.chart-body');
        if (chartBody) {
            chartBody.classList.add('with-legend-table');
            const legendTable = createLegendTable(reqLabels, reqValues, reqColors);
            chartBody.insertAdjacentHTML('beforeend', legendTable);
            
            // Add legend labels below the chart
            const chartCard = requestsCtx.closest('.chart-card');
            if (chartCard) {
                const legendLabels = createLegendLabels(reqLabels, reqColors);
                chartCard.insertAdjacentHTML('beforeend', legendLabels);
            }
        }
    }
    
    // Chart 3: Inventory by Sector (Horizontal Bar - Top 10)
    const sectorCount = {};
    inventario.forEach(item => {
        const setor = item['SETOR'] || 'SEM SETOR';
        sectorCount[setor] = (sectorCount[setor] || 0) + 1;
    });
    
    // Sort and get top 10
    const topSectors = Object.entries(sectorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const sectorCtx = document.getElementById('inventorySectorChart');
    if (sectorCtx && topSectors.length > 0) {
        charts.inventorySector = new Chart(sectorCtx, {
            type: 'bar',
            data: {
                labels: topSectors.map(s => s[0]),
                datasets: [{
                    data: topSectors.map(s => s[1]),
                    backgroundColor: chartColors.slice(0, topSectors.length),
                    borderWidth: 0
                }]
            },
            options: getHorizontalBarChartOptions()
        });
    }
    
    // Chart 4: Inventory by Floor (Bar Chart)
    const floorCount = {};
    inventario.forEach(item => {
        const andar = item['ANDAR'] || 'SEM ANDAR';
        floorCount[andar] = (floorCount[andar] || 0) + 1;
    });
    
    const floorCtx = document.getElementById('inventoryFloorChart');
    if (floorCtx) {
        const floorEntries = Object.entries(floorCount).sort((a, b) => b[1] - a[1]);
        charts.inventoryFloor = new Chart(floorCtx, {
            type: 'bar',
            data: {
                labels: floorEntries.map(f => f[0]),
                datasets: [{
                    data: floorEntries.map(f => f[1]),
                    backgroundColor: chartColors.slice(0, floorEntries.length),
                    borderWidth: 0
                }]
            },
            options: getBarChartOptions()
        });
    }
    
    // Chart 5: Top Specialties from Documents (Bar Chart)
    const specialtyCount = {};
    solicitacoes.forEach(item => {
        // Try different field names from SolicitacaoDocumentos
        const solicitacao = item['SOLICITAÇÃO:'] || '';
        if (solicitacao && solicitacao !== '' && solicitacao !== 'N/A') {
            // Extract the type (first part before " - ")
            const tipo = solicitacao.split(' - ')[0].trim();
            if (tipo) {
                specialtyCount[tipo] = (specialtyCount[tipo] || 0) + 1;
            }
        }
    });
    
    const topSpecialties = Object.entries(specialtyCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    const specialtiesCtx = document.getElementById('specialtiesChart');
    if (specialtiesCtx && topSpecialties.length > 0) {
        // Use horizontal bar chart for better label visibility
        charts.specialties = new Chart(specialtiesCtx, {
            type: 'bar',
            data: {
                labels: topSpecialties.map(s => s[0].length > 25 ? s[0].substring(0, 25) + '...' : s[0]),
                datasets: [{
                    data: topSpecialties.map(s => s[1]),
                    backgroundColor: chartColors.slice(0, topSpecialties.length),
                    borderWidth: 0
                }]
            },
            options: getHorizontalBarChartOptions()
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

// =====================================================
// Attendance Time Validation Functions
// =====================================================

/**
 * Checks if a student is late for Theory class
 * Theory classes start at 18:00, with a grace period until 18:10
 * @param {string} horarioEntrada - The check-in time (format: HH:MM or HH:MM:SS or ISO string)
 * @param {number} horaLimite - The hour limit (18 for 18:00)
 * @param {number} minutoLimite - The minute limit (10 for 18:10 tolerance)
 * @returns {boolean} - True if the student is late
 */
function checkIfLateForTeoria(horarioEntrada, horaLimite, minutoLimite) {
    if (!horarioEntrada) return false;
    
    try {
        let hora, minuto;
        
        // Handle different time formats
        if (typeof horarioEntrada === 'string') {
            if (horarioEntrada.includes('T')) {
                // ISO format (e.g., 2025-01-01T18:15:00.000Z)
                const date = new Date(horarioEntrada);
                hora = date.getHours();
                minuto = date.getMinutes();
            } else if (horarioEntrada.includes(':')) {
                // Time format (e.g., 18:15 or 18:15:00)
                const parts = horarioEntrada.split(':');
                hora = parseInt(parts[0], 10);
                minuto = parseInt(parts[1], 10);
            } else {
                return false;
            }
        } else if (horarioEntrada instanceof Date) {
            hora = horarioEntrada.getHours();
            minuto = horarioEntrada.getMinutes();
        } else {
            return false;
        }
        
        // Check if late (after 18:10 for theory)
        if (hora > horaLimite) {
            return true;
        } else if (hora === horaLimite && minuto > minutoLimite) {
            return true;
        }
        
        return false;
    } catch (e) {
        console.warn('Error parsing time:', horarioEntrada, e);
        return false;
    }
}

/**
 * Checks if a student is late for Practice class
 * Practice classes have variable start times based on schedule
 * @param {string} horarioEntrada - The check-in time
 * @param {string} horarioEscala - The scheduled start time
 * @param {number} toleranciaMinutos - Grace period in minutes (default: 10)
 * @returns {boolean} - True if the student is late
 */
function checkIfLateForPratica(horarioEntrada, horarioEscala, toleranciaMinutos = 10) {
    if (!horarioEntrada || !horarioEscala) return false;
    
    try {
        // Parse check-in time
        let horaEntrada, minutoEntrada;
        if (typeof horarioEntrada === 'string') {
            if (horarioEntrada.includes('T')) {
                const date = new Date(horarioEntrada);
                horaEntrada = date.getHours();
                minutoEntrada = date.getMinutes();
            } else if (horarioEntrada.includes(':')) {
                const parts = horarioEntrada.split(':');
                horaEntrada = parseInt(parts[0], 10);
                minutoEntrada = parseInt(parts[1], 10);
            } else {
                return false;
            }
        } else if (horarioEntrada instanceof Date) {
            horaEntrada = horarioEntrada.getHours();
            minutoEntrada = horarioEntrada.getMinutes();
        } else {
            return false;
        }
        
        // Parse scheduled time
        let horaEscala, minutoEscala;
        if (typeof horarioEscala === 'string') {
            if (horarioEscala.includes('T')) {
                const date = new Date(horarioEscala);
                horaEscala = date.getHours();
                minutoEscala = date.getMinutes();
            } else if (horarioEscala.includes(':')) {
                const parts = horarioEscala.split(':');
                horaEscala = parseInt(parts[0], 10);
                minutoEscala = parseInt(parts[1], 10);
            } else {
                return false;
            }
        } else if (horarioEscala instanceof Date) {
            horaEscala = horarioEscala.getHours();
            minutoEscala = horarioEscala.getMinutes();
        } else {
            return false;
        }
        
        // Calculate limit time with tolerance
        const limiteMinutos = minutoEscala + toleranciaMinutos;
        const horaLimite = horaEscala + Math.floor(limiteMinutos / 60);
        const minutoLimite = limiteMinutos % 60;
        
        // Check if late
        const entradaEmMinutos = horaEntrada * 60 + minutoEntrada;
        const limiteEmMinutos = horaLimite * 60 + minutoLimite;
        
        return entradaEmMinutos > limiteEmMinutos;
    } catch (e) {
        console.warn('Error parsing times:', horarioEntrada, horarioEscala, e);
        return false;
    }
}

/**
 * Determines if an attendance record belongs to Theory or Practice
 * This helps prevent duplication by properly categorizing records
 * 
 * Note: This function is duplicated in code.gs for server-side processing.
 * Both implementations are needed because:
 * - Frontend: Processes data when displayed in the dashboard (client-side)
 * - Backend (code.gs): Processes data when fetching from Google Sheets (server-side)
 * The logic must be consistent in both places.
 * 
 * @param {Object} record - The attendance record
 * @returns {string} - 'Teoria' or 'Prática'
 */
function determineAttendanceType(record) {
    // Check explicit type field first
    const tipo = (record.TipoAula || record.Tipo || '').toString().toLowerCase();
    
    if (tipo.includes('teoria') || tipo.includes('theory')) {
        return 'Teoria';
    }
    
    if (tipo.includes('pratica') || tipo.includes('prática') || tipo.includes('practice')) {
        return 'Prática';
    }
    
    // If no explicit type, try to infer from time
    // Theory classes are always at 18:00
    const horario = record.HorarioEscala || record.HorarioInicio || '';
    if (horario) {
        let hora;
        if (typeof horario === 'string') {
            if (horario.includes('T')) {
                hora = new Date(horario).getHours();
            } else if (horario.includes(':')) {
                hora = parseInt(horario.split(':')[0], 10);
            }
        }
        
        // If scheduled time is around 18:00, it's likely Theory
        if (hora === 18) {
            return 'Teoria';
        }
    }
    
    // Default to Practice if we can't determine
    return 'Prática';
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
        
        const colors = chartColors.slice(0, labels.length);
        
        const chartCard = document.createElement('div');
        chartCard.className = `chart-card chart-size-${chartSize}`;
        chartCard.innerHTML = `
            <div class="chart-header">
                <h3 class="chart-title">${title}</h3>
                <span class="chart-subtitle">${subtitle}</span>
            </div>
            <div class="chart-body with-legend-table">
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
                            backgroundColor: colors,
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: chartOptions
                });
                
                // Add legend table to the chart body
                const chartBody = ctx.closest('.chart-body');
                if (chartBody) {
                    const legendTable = createLegendTable(labels, dataValues, colors);
                    chartBody.insertAdjacentHTML('beforeend', legendTable);
                    
                    // Add legend labels below the chart
                    const legendLabels = createLegendLabels(labels, colors);
                    chartCard.insertAdjacentHTML('beforeend', legendLabels);
                }
                
                chartIndex++;
            }
        }, 100);
    }
    
    // Helper function to create a horizontal bar chart (for charts with many items)
    function createBarChart(title, subtitle, canvasId, labels, dataValues, horizontal = true) {
        const chartCard = document.createElement('div');
        chartCard.className = 'chart-card chart-wide';
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
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: dataValues,
                            backgroundColor: chartColors.slice(0, labels.length),
                            borderWidth: 0
                        }]
                    },
                    options: horizontal ? getHorizontalBarChartOptions() : getBarChartOptions()
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
            const status = item['STATUS'] || 'SEM STATUS';
            statusCount[status] = (statusCount[status] || 0) + 1;
            
            const setor = item['SETOR'] || 'SEM SETOR';
            setorCount[setor] = (setorCount[setor] || 0) + 1;
            
            const andar = item['ANDAR'] || 'SEM ANDAR';
            andarCount[andar] = (andarCount[andar] || 0) + 1;
            
            const patrimonio = item['PATRIMÔNIOS - CeAC'] || 'SEM PATRIMÔNIO';
            patrimonioCount[patrimonio] = (patrimonioCount[patrimonio] || 0) + 1;
            
            const predio = item['PRÉDIO'] || 'SEM PRÉDIO';
            predioCount[predio] = (predioCount[predio] || 0) + 1;
            
            const sala = item['SALA'] || 'SEM SALA';
            salaCount[sala] = (salaCount[sala] || 0) + 1;
            
            const situacao = item['SITUAÇÃO'] || 'SEM SITUAÇÃO';
            situacaoCount[situacao] = (situacaoCount[situacao] || 0) + 1;
            
            const descricao = item['DESCRIÇÃO DOS BENS'] || 'SEM DESCRIÇÃO';
            descricaoCount[descricao] = (descricaoCount[descricao] || 0) + 1;
        });
        
        createPieChart('Inventário por Status', 'Distribuição dos itens por status', 'inventarioStatusPie', Object.keys(statusCount), Object.values(statusCount), 'auto');
        
        // Top 8 sectors - use bar chart for better readability
        const topSetores = Object.entries(setorCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
        createBarChart('Top 8 Setores', 'Setores com mais itens', 'inventarioSetorBar', topSetores.map(s => s[0]), topSetores.map(s => s[1]), true);
        
        // Inventory by Floor - use bar chart
        const andarEntries = Object.entries(andarCount).sort((a, b) => b[1] - a[1]);
        createBarChart('Inventário por Andar', 'Distribuição dos itens por andar', 'inventarioAndarBar', andarEntries.map(s => s[0]), andarEntries.map(s => s[1]), false);
        
        createPieChart('Inventário por Tipo de Patrimônio', 'Tipos de patrimônio', 'inventarioPatrimonioPie', Object.keys(patrimonioCount), Object.values(patrimonioCount), 'auto');
        createPieChart('Inventário por Prédio', 'Distribuição por edifício', 'inventarioPredioPie', Object.keys(predioCount), Object.values(predioCount), 'auto');
        createPieChart('Inventário por Situação', 'Condição dos itens', 'inventarioSituacaoPie', Object.keys(situacaoCount), Object.values(situacaoCount), 'auto');
        
        // Top 10 rooms - use bar chart for better label visibility
        const topSalas = Object.entries(salaCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
        createBarChart('Top 10 Salas', 'Salas com mais itens', 'inventarioSalaBar', topSalas.map(s => s[0]), topSalas.map(s => s[1]), true);
        
        // Top 10 item descriptions - use bar chart for better label visibility
        const topDescricoes = Object.entries(descricaoCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
        createBarChart('Top 10 Tipos de Itens', 'Itens mais comuns no inventário', 'inventarioDescricaoBar', topDescricoes.map(s => s[0]), topDescricoes.map(s => s[1]), true);
    }
    
    // Solicitação de Documentos - Status charts
    if (categoryId === 'SolicitacaoDocumentos') {
        const statusCount = {};
        const tipoCount = {};
        
        data.forEach(item => {
            const status = item['STATUS DA SOLICITAÇÃO'] || item['STATUS'] || 'SEM STATUS';
            statusCount[status] = (statusCount[status] || 0) + 1;
            
            const tipo = item['SOLICITAÇÃO:'] || '';
            if (tipo && tipo !== '') {
                const shortTipo = tipo.split(' - ')[0].trim();
                tipoCount[shortTipo] = (tipoCount[shortTipo] || 0) + 1;
            } else {
                tipoCount['SEM TIPO'] = (tipoCount['SEM TIPO'] || 0) + 1;
            }
        });
        
        createPieChart('Solicitações por Status', 'Distribuição por status', 'solicitacoesStatusPie', Object.keys(statusCount), Object.values(statusCount), 'auto');
        
        // Use bar chart for types if there are more than 4
        const tipoEntries = Object.entries(tipoCount).sort((a, b) => b[1] - a[1]);
        if (tipoEntries.length > 4) {
            createBarChart('Solicitações por Tipo', 'Tipos de solicitação', 'solicitacoesTipoBar', tipoEntries.map(s => s[0]), tipoEntries.map(s => s[1]), true);
        } else {
            createPieChart('Solicitações por Tipo', 'Tipos de solicitação', 'solicitacoesTipoPie', tipoEntries.map(s => s[0]), tipoEntries.map(s => s[1]), 'auto');
        }
    }
    
    // WS Engenharia - Equipe
    if (categoryId === 'WSEngenhariaEquipe') {
        const localCount = {};
        data.forEach(item => {
            const local = item['LocalAtualInstituto'] || 'SEM LOCAL';
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
            const instituto = item['Instituto'] || 'SEM INSTITUTO';
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
            const esp = item['Especialidade'] || 'SEM ESPECIALIDADE';
            const qty = parseInt(item['QuantidadePessoas'] || 0);
            espCount[esp] = (espCount[esp] || 0) + qty;
            
            const local = item['LocalAtual'] || 'SEM LOCAL';
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
            
            const local = item['Local Atual'] || item['LocalAtual'] || 'SEM LOCAL';
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
    
    // ControleOS - Comprehensive analysis
    if (categoryId === 'ControleOS') {
        const statusCount = {};
        const especialidadeCount = {};
        const setorCount = {};
        const mesCount = {};
        const anoCount = {};
        const andarCount = {};
        let totalExecutado = 0;
        let totalForaDoPrazo = 0;
        let totalPendente = 0;
        
        // Clean and process data
        data.forEach(item => {
            // Clean status - handle empty values and skip #REF! errors
            let status = (item['Status'] || '').trim();
            
            // Skip Excel reference errors (not real data)
            if (status === '#REF!') {
                return; // Skip this record
            } else if (status === '' || status === ' ') {
                status = 'Sem Status';
            }
            
            statusCount[status] = (statusCount[status] || 0) + 1;
            
            // Track execution metrics
            if (status.toLowerCase().includes('executado')) {
                totalExecutado++;
                if (status.toLowerCase().includes('fora do prazo')) {
                    totalForaDoPrazo++;
                }
            } else if (status.toLowerCase().includes('pendente')) {
                totalPendente++;
            }
            
            // Count by specialty
            const especialidade = (item['Especialidade'] || '').trim() || 'Sem Especialidade';
            if (especialidade !== 'Sem Especialidade') {
                especialidadeCount[especialidade] = (especialidadeCount[especialidade] || 0) + 1;
            }
            
            // Count by sector
            const setor = (item['Setor'] || '').trim() || 'Sem Setor';
            if (setor !== 'Sem Setor') {
                setorCount[setor] = (setorCount[setor] || 0) + 1;
            }
            
            // Count by month
            const mes = (item['Mês'] || '').trim();
            if (mes) {
                mesCount[mes] = (mesCount[mes] || 0) + 1;
            }
            
            // Count by year
            const ano = (item['Ano'] || '').trim();
            if (ano) {
                anoCount[ano] = (anoCount[ano] || 0) + 1;
            }
            
            // Count by floor
            const andar = (item['Andar\nSolicitante'] || item['Andar'] || '').trim();
            if (andar) {
                andarCount[andar] = (andarCount[andar] || 0) + 1;
            }
        });
        
        // Chart 1: Status Distribution
        if (Object.keys(statusCount).length > 0) {
            createPieChart(
                'Distribuição por Status', 
                'Status das ordens de serviço',
                'controleOSStatusPie', 
                Object.keys(statusCount), 
                Object.values(statusCount), 
                'auto'
            );
        }
        
        // Chart 2: Top Specialties
        const topEspecialidades = Object.entries(especialidadeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        if (topEspecialidades.length > 0) {
            if (topEspecialidades.length > 6) {
                createBarChart(
                    'Top 10 Especialidades',
                    'Especialidades com mais solicitações',
                    'controleOSEspecialidadeBar',
                    topEspecialidades.map(e => e[0]),
                    topEspecialidades.map(e => e[1]),
                    true
                );
            } else {
                createPieChart(
                    'Distribuição por Especialidade',
                    'Especialidades solicitadas',
                    'controleOSEspecialidadePie',
                    topEspecialidades.map(e => e[0]),
                    topEspecialidades.map(e => e[1]),
                    'auto'
                );
            }
        }
        
        // Chart 3: Top Sectors
        const topSetores = Object.entries(setorCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        if (topSetores.length > 0) {
            createBarChart(
                'Top 10 Setores',
                'Setores com mais solicitações',
                'controleOSSetorBar',
                topSetores.map(s => s[0]),
                topSetores.map(s => s[1]),
                true
            );
        }
        
        // Chart 4: Distribution by Month
        const mesEntries = Object.entries(mesCount);
        if (mesEntries.length > 0) {
            // Order months chronologically
            const monthOrder = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 
                              'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
            const orderedMeses = mesEntries.sort((a, b) => {
                const indexA = monthOrder.indexOf(a[0].toUpperCase());
                const indexB = monthOrder.indexOf(b[0].toUpperCase());
                return indexA - indexB;
            });
            
            createBarChart(
                'Distribuição por Mês',
                'Volume de solicitações por mês',
                'controleOSMesBar',
                orderedMeses.map(m => m[0]),
                orderedMeses.map(m => m[1]),
                false
            );
        }
        
        // Chart 5: Distribution by Year
        const anoEntries = Object.entries(anoCount).sort((a, b) => a[0] - b[0]);
        if (anoEntries.length > 0) {
            createPieChart(
                'Distribuição por Ano',
                'Volume de solicitações por ano',
                'controleOSAnoPie',
                anoEntries.map(a => a[0]),
                anoEntries.map(a => a[1]),
                'auto'
            );
        }
        
        // Chart 6: Distribution by Floor
        const andarEntries = Object.entries(andarCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (andarEntries.length > 0) {
            createBarChart(
                'Distribuição por Andar',
                'Solicitações por andar',
                'controleOSAndarBar',
                andarEntries.map(a => a[0]),
                andarEntries.map(a => a[1]),
                true
            );
        }
    }
    
    // SolicitacaoDocumentos
    if (categoryId === 'SolicitacaoDocumentos') {
        const statusCount = {};
        
        data.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key.toLowerCase().includes('status')) {
                    const status = item[key] || 'SEM STATUS';
                    statusCount[status] = (statusCount[status] || 0) + 1;
                }
            });
        });
        
        if (Object.keys(statusCount).length > 0) {
            createPieChart('Distribuição por Status', 'Status das solicitações', 'solDocStatusPie', Object.keys(statusCount), Object.values(statusCount), 'auto');
        }
    }
    
    // EscalaTeoria - Theory Schedule Analysis
    if (categoryId === 'EscalaTeoria') {
        const alunoCount = {};
        const diaCount = {};
        const presencaCount = { 'Escalado': 0 };
        
        data.forEach(item => {
            // Count students
            const aluno = item['Aluno'] || item['Nome'] || 'Sem Nome';
            alunoCount[aluno] = (alunoCount[aluno] || 0) + 1;
            
            // Count by day
            const dia = item['Dia'] || item['DiaSemana'] || 'Sem Dia';
            diaCount[dia] = (diaCount[dia] || 0) + 1;
            
            // In theory, all students are scheduled regardless of F in scale
            presencaCount['Escalado'] = presencaCount['Escalado'] + 1;
        });
        
        if (Object.keys(diaCount).length > 0) {
            createPieChart('Distribuição por Dia da Semana', 'Aulas de Teoria por dia', 'escalaTeoriaDiaPie', Object.keys(diaCount), Object.values(diaCount), 'auto');
        }
        
        if (Object.keys(alunoCount).length > 0) {
            const topAlunos = Object.entries(alunoCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
            createBarChart('Top 10 Alunos', 'Alunos com mais aulas de Teoria', 'escalaTeoriaAlunoBar', topAlunos.map(a => a[0]), topAlunos.map(a => a[1]), true);
        }
    }
    
    // EscalaPratica - Practice Schedule Analysis
    if (categoryId === 'EscalaPratica') {
        const alunoCount = {};
        const diaCount = {};
        const statusCount = { 'Escalado': 0, 'Folga (F)': 0 };
        
        data.forEach(item => {
            // Count students
            const aluno = item['Aluno'] || item['Nome'] || 'Sem Nome';
            alunoCount[aluno] = (alunoCount[aluno] || 0) + 1;
            
            // Count by day
            const dia = item['Dia'] || item['DiaSemana'] || 'Sem Dia';
            diaCount[dia] = (diaCount[dia] || 0) + 1;
            
            // In practice, F means day off
            const escala = (item['Escala'] || item['Status'] || '').toString().toUpperCase();
            if (escala === 'F' || escala === 'FOLGA') {
                statusCount['Folga (F)'] = statusCount['Folga (F)'] + 1;
            } else {
                statusCount['Escalado'] = statusCount['Escalado'] + 1;
            }
        });
        
        createPieChart('Status da Escala', 'Escalados vs Folga', 'escalaPraticaStatusPie', Object.keys(statusCount), Object.values(statusCount), 'auto');
        
        if (Object.keys(diaCount).length > 0) {
            createPieChart('Distribuição por Dia da Semana', 'Aulas de Prática por dia', 'escalaPraticaDiaPie', Object.keys(diaCount), Object.values(diaCount), 'auto');
        }
        
        if (Object.keys(alunoCount).length > 0) {
            const topAlunos = Object.entries(alunoCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
            createBarChart('Top 10 Alunos', 'Alunos com mais aulas de Prática', 'escalaPraticaAlunoBar', topAlunos.map(a => a[0]), topAlunos.map(a => a[1]), true);
        }
    }
    
    // RegistroPonto - Attendance Records Analysis with Theory/Practice separation
    if (categoryId === 'RegistroPonto') {
        const tipoAulaCount = { 'Teoria': 0, 'Prática': 0 };
        const statusTeoriaCount = { 'No Horário': 0, 'Atraso': 0, 'Falta': 0 };
        const statusPraticaCount = { 'No Horário': 0, 'Atraso': 0, 'Falta': 0 };
        const alunoCount = {};
        const diaCount = {};
        
        // Theory fixed time: 18:00, late threshold: 18:10
        const TEORIA_HORA_LIMITE = 18;
        const TEORIA_MINUTO_LIMITE = 10;
        
        data.forEach(item => {
            // Use determineAttendanceType function for consistent classification
            const tipoAula = item['TipoAula'] || item['Tipo'] ? 
                (item['TipoAula'] || item['Tipo']).toString() : 
                determineAttendanceType(item);
            const aluno = item['Aluno'] || item['Nome'] || 'Sem Nome';
            const horario = item['HorarioEntrada'] || item['Horario'] || '';
            const dia = item['Dia'] || item['Data'] || 'Sem Data';
            const presente = item['Presente'] !== false && item['Presente'] !== 'N' && item['Presente'] !== 'Não';
            
            // Count by type
            if (tipoAula.toLowerCase().includes('teoria') || tipoAula.toLowerCase().includes('theory')) {
                tipoAulaCount['Teoria']++;
                
                // Check if late for theory class (after 18:10)
                if (presente && horario) {
                    const isLate = checkIfLateForTeoria(horario, TEORIA_HORA_LIMITE, TEORIA_MINUTO_LIMITE);
                    if (isLate) {
                        statusTeoriaCount['Atraso']++;
                    } else {
                        statusTeoriaCount['No Horário']++;
                    }
                } else if (!presente) {
                    statusTeoriaCount['Falta']++;
                }
            } else {
                tipoAulaCount['Prática']++;
                
                // For practice, use the scheduled time from scale
                const horaEscalada = item['HorarioEscala'] || item['HorarioInicio'] || '';
                if (presente && horario && horaEscalada) {
                    const isLate = checkIfLateForPratica(horario, horaEscalada);
                    if (isLate) {
                        statusPraticaCount['Atraso']++;
                    } else {
                        statusPraticaCount['No Horário']++;
                    }
                } else if (!presente) {
                    statusPraticaCount['Falta']++;
                } else {
                    statusPraticaCount['No Horário']++;
                }
            }
            
            // Count by student
            alunoCount[aluno] = (alunoCount[aluno] || 0) + 1;
            
            // Count by day
            diaCount[dia] = (diaCount[dia] || 0) + 1;
        });
        
        // Chart 1: Distribution by type (Theory vs Practice)
        createPieChart('Registros por Tipo de Aula', 'Teoria vs Prática', 'registroPontoTipoPie', Object.keys(tipoAulaCount), Object.values(tipoAulaCount), 'auto');
        
        // Chart 2: Theory attendance status
        if (tipoAulaCount['Teoria'] > 0) {
            createPieChart('Status Teoria', 'Pontualidade nas aulas de Teoria (início: 18h, tolerância até 18:10)', 'registroPontoTeoriaStatusPie', Object.keys(statusTeoriaCount), Object.values(statusTeoriaCount), 'auto');
        }
        
        // Chart 3: Practice attendance status
        if (tipoAulaCount['Prática'] > 0) {
            createPieChart('Status Prática', 'Pontualidade nas aulas de Prática', 'registroPontoPraticaStatusPie', Object.keys(statusPraticaCount), Object.values(statusPraticaCount), 'auto');
        }
        
        // Chart 4: Top students
        if (Object.keys(alunoCount).length > 0) {
            const topAlunos = Object.entries(alunoCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
            createBarChart('Top 10 Alunos', 'Alunos com mais registros', 'registroPontoAlunoBar', topAlunos.map(a => a[0]), topAlunos.map(a => a[1]), true);
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
