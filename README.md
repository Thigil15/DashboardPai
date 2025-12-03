# DashboardPai

Dashboard em HTML, CSS e JavaScript que consome dados de uma planilha Google através do Google Apps Script.

## 📋 Estrutura do Projeto

```
DashboardPai/
├── index.html          # Página principal do dashboard
├── css/
│   └── styles.css      # Estilos do dashboard
├── js/
│   └── script.js       # Lógica para buscar e exibir dados
├── code.gs             # Google Apps Script para expor os dados
└── README.md           # Documentação
```

## 🚀 Como Configurar

### Passo 1: Preparar a Planilha Google

1. Crie ou abra uma planilha Google com seus dados
2. Certifique-se de que a **primeira linha** contém os **cabeçalhos** das colunas
3. Exemplo de estrutura:

| Nome | Valor | Data | Categoria |
|------|-------|------|-----------|
| Item 1 | 100 | 01/01/2024 | A |
| Item 2 | 200 | 02/01/2024 | B |

### Passo 2: Configurar o Google Apps Script

1. Na planilha Google, vá em **Extensões** > **Apps Script**
2. Apague qualquer código existente
3. Cole o conteúdo do arquivo `code.gs` deste repositório
4. Clique em **Salvar** (ou Ctrl+S)
5. Clique em **Implantar** > **Nova implantação**
6. Clique no ícone de engrenagem ⚙️ e selecione **Aplicativo da Web**
7. Configure:
   - **Descrição**: Dashboard API
   - **Executar como**: Eu (seu email)
   - **Quem pode acessar**: Qualquer pessoa
8. Clique em **Implantar**
9. **IMPORTANTE**: Copie a URL fornecida (será algo como `https://script.google.com/macros/s/...`)

### Passo 3: Configurar o Dashboard

1. Abra o arquivo `js/script.js`
2. Substitua `'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI'` pela URL copiada no passo anterior:

```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/SEU_ID_AQUI/exec';
```

### Passo 4: Visualizar o Dashboard

Abra o arquivo `index.html` no seu navegador ou hospede os arquivos em um servidor web.

#### Opção 1: Abrir localmente
Basta dar duplo clique no arquivo `index.html`

#### Opção 2: Usar o Live Server (VS Code)
1. Instale a extensão "Live Server" no VS Code
2. Clique com o botão direito no `index.html`
3. Selecione "Open with Live Server"

#### Opção 3: Hospedar no GitHub Pages
1. Faça push dos arquivos para um repositório GitHub
2. Vá em Settings > Pages
3. Selecione a branch e clique em Save

## ✨ Funcionalidades

- 📊 **Cards de Resumo**: Exibe totais e somas das colunas numéricas
- 📋 **Tabela de Dados**: Mostra todos os dados da planilha
- 🔄 **Atualização em Tempo Real**: Carrega dados diretamente da planilha
- 📱 **Responsivo**: Funciona em desktop, tablet e celular
- ⚡ **Loading States**: Indicadores de carregamento e erro

## 🔧 Personalização

### Alterar cores do tema
Edite o arquivo `css/styles.css` e modifique o gradiente:

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Ativar atualização automática
No arquivo `js/script.js`, descomente a última linha:

```javascript
startAutoRefresh(5); // Atualiza a cada 5 minutos
```

### Usar uma aba específica da planilha
Modifique a URL no `script.js` adicionando o parâmetro `?sheet=`:

```javascript
const SCRIPT_URL = 'https://script.google.com/.../exec?sheet=NomeDaAba';
```

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura da página
- **CSS3** - Estilização e responsividade
- **JavaScript (ES6+)** - Lógica e interatividade
- **Google Apps Script** - Backend para expor dados da planilha
- **Google Sheets** - Banco de dados

## 📝 Licença

Este projeto está sob a licença MIT.