# Melhorias nos Gráficos - Chart Percentage Label Fixes

## Problema Identificado

As porcentagens escritas nos gráficos estavam bugadas, atravessando outros gráficos e causando uma aparência ruim. Os gráficos menores tinham porcentagens que se sobrepunham, tornando-os ilegíveis.

## Solução Implementada

### 1. Sistema Inteligente de Tamanhos de Gráficos

Criamos um sistema que ajusta automaticamente o tamanho dos gráficos com base na quantidade de dados:

#### **Gráficos Pequenos** (1-4 itens)
- Tamanho padrão
- Altura do canvas: 260px
- Porcentagens mostradas para fatias ≥ 5%
- Fonte das porcentagens: 13px
- Ideal para: gráficos de status simples (2-3 categorias)

#### **Gráficos Médios** (5-8 itens)
- Tamanho ligeiramente maior
- Altura do canvas: 320px
- Porcentagens mostradas para fatias ≥ 4%
- Fonte das porcentagens: 12px
- Ideal para: Top 8 especialidades, distribuições médias

#### **Gráficos Grandes** (9+ itens)
- Tamanho expandido (largura total)
- Altura do canvas: 380px
- Porcentagens mostradas para fatias ≥ 3%
- Fonte das porcentagens: 11px
- Ideal para: Top 10 setores, Top 10 salas, Top 10 tipos de itens

### 2. Configuração de Datalabels Melhorada

Adicionadas as seguintes melhorias nas labels de porcentagem:

```javascript
datalabels: {
    color: '#fff',
    font: {
        weight: 'bold',
        size: 13  // Varia por tamanho: 13, 12, ou 11
    },
    formatter: (value, context) => {
        const total = context.dataset.data.reduce((a, b) => a + b, 0);
        const percentage = ((value / total) * 100).toFixed(1);
        // Oculta porcentagens pequenas para evitar sobreposição
        if (parseFloat(percentage) < threshold) {
            return '';
        }
        return percentage + '%';
    },
    anchor: 'center',
    align: 'center',
    offset: 0,
    clamp: true  // Mantém labels dentro dos limites
}
```

### 3. Ajustes CSS

#### Novas Classes de Tamanho:
```css
.chart-size-small   /* Gráficos com poucos itens */
.chart-size-medium  /* Gráficos com quantidade média de itens */
.chart-size-large   /* Gráficos com muitos itens - largura total */
```

#### Layout Responsivo:
- Gráficos grandes ocupam 2 colunas (largura total)
- Gráficos médios e pequenos ocupam 1 coluna cada
- Em telas menores (< 1200px), todos os gráficos ocupam largura total

### 4. Aplicação por Tipo de Gráfico

#### Visão Geral (Overview):
- **Inventário por Status**: Pequeno (poucos itens)
- **Solicitações de Prontuários**: Pequeno
- **Inventário por Setor**: Grande (Top 10 - usa compact options)
- **Inventário por Andar**: Auto (ajusta conforme dados)
- **Especialidades**: Médio (Top 8)

#### Categorias Específicas:
- **Status simples**: Auto/Pequeno
- **Top 8 charts**: Médio
- **Top 10 charts**: Grande
- **Distribuições genéricas**: Auto

## Benefícios

### ✅ Melhor Legibilidade
- Porcentagens não se sobrepõem
- Texto maior em gráficos menores
- Texto menor em gráficos complexos

### ✅ Uso Otimizado do Espaço
- Gráficos com mais dados recebem mais espaço
- Gráficos simples não desperdiçam espaço
- Layout mais balanceado e profissional

### ✅ Prevenção de Overlaps
- Labels pequenas (<3-5%) são ocultadas
- Labels mantidas dentro dos limites do gráfico
- Tooltips ainda mostram todos os valores

### ✅ Consistência Visual
- Tamanhos de fonte apropriados
- Espaçamento adequado em legendas
- Cores e bordas uniformes

## Exemplos de Aplicação

### Antes:
```
[Gráfico Pequeno com 3 itens] - mesmo tamanho
[Gráfico Grande com 10 itens] - mesmo tamanho
Resultado: Labels sobrepostas no gráfico grande
```

### Depois:
```
[Gráfico Pequeno com 3 itens] - tamanho normal
[Gráfico Grande com 10 itens] - EXPANDIDO (2x largura)
Resultado: Labels claras e legíveis em ambos
```

## Arquivos Modificados

1. **js/script.js**
   - Funções `getPieChartOptions()`, `getPieChartOptionsMedium()`, `getPieChartOptionsCompact()`
   - Função `createPieChart()` com parâmetro de tamanho inteligente
   - Atualização de todos os gráficos do overview
   - Atualização de todos os gráficos de categorias

2. **css/styles.css**
   - Classes `.chart-size-small`, `.chart-size-medium`, `.chart-size-large`
   - Ajustes de altura de canvas por tamanho
   - Grid responsivo para category-charts
   - Media queries atualizadas

## Como Testar

1. Abra o dashboard em um navegador com as bibliotecas Chart.js e ChartDataLabels carregadas
2. Navegue para "Visão Geral" e observe:
   - Gráfico "Inventário por Setor" agora é maior (largura total)
   - Porcentagens pequenas não aparecem
3. Clique em "Inventário CeAC 2025" e observe:
   - "Top 10 Salas" e "Top 10 Tipos de Itens" ocupam largura total
   - Labels de porcentagem bem distribuídas
4. Redimensione a janela e observe:
   - Todos os gráficos se ajustam adequadamente
   - Mantém legibilidade em diferentes tamanhos

## Compatibilidade

- ✅ Chart.js 4.4.1
- ✅ ChartDataLabels 2.2.0
- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móveis e tablets
- ✅ Responsivo em todas as resoluções

## Observações Técnicas

- O threshold de porcentagem (3%, 4%, 5%) é automaticamente aplicado baseado no tamanho do gráfico
- Labels são ancoradas no centro para melhor distribuição
- A opção `clamp: true` garante que labels fiquem dentro do gráfico
- Gráficos vazios ou com erro continuam mostrando estado apropriado
