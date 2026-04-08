// ==================== data.js ====================
// Gerencia todos os dados da aplicação, salvando e carregando do localStorage
// Versão 1.0

// Namespace principal
window.app = window.app || {};

// Dados padrão para inicialização (exemplo)
const dadosPadrao = {
    versao: "1.0",
    categorias: [
        { id: 1, nome: "Camisas" },
        { id: 2, nome: "Camisetas" },
        { id: 3, nome: "Shorts" },
        { id: 4, nome: "Regatas" }
    ],
    subcategorias: [
        { id: 1, nome: "Gola Polo", categoriaId: 1 },
        { id: 2, nome: "Manga Longa", categoriaId: 1 },
        { id: 3, nome: "Peruana", categoriaId: 2 },
        { id: 4, nome: "100% Algodão", categoriaId: 2 },
        { id: 5, nome: "Alfaiataria", categoriaId: 3 },
        { id: 6, nome: "Confort", categoriaId: 3 },
        { id: 7, nome: "Regata Básica", categoriaId: 4 }
    ],
    cores: [
        { id: 1, nome: "Preto" },
        { id: 2, nome: "Branco" },
        { id: 3, nome: "Azul" },
        { id: 4, nome: "Vermelho" },
        { id: 5, nome: "Verde" }
    ],
    tamanhos: [
        { id: 1, nome: "P", tipo: "letra" },
        { id: 2, nome: "M", tipo: "letra" },
        { id: 3, nome: "G", tipo: "letra" },
        { id: 4, nome: "GG", tipo: "letra" },
        { id: 5, nome: "36", tipo: "numero" },
        { id: 6, nome: "38", tipo: "numero" },
        { id: 7, nome: "40", tipo: "numero" },
        { id: 8, nome: "42", tipo: "numero" },
        { id: 9, nome: "44", tipo: "numero" },
        { id: 10, nome: "46", tipo: "numero" },
        { id: 11, nome: "48", tipo: "numero" }
    ],
    tiposGasto: [
        { id: 1, nome: "Tecido" },
        { id: 2, nome: "Botão" },
        { id: 3, nome: "Zíper" },
        { id: 4, nome: "Linha" },
        { id: 5, nome: "Etiqueta" },
        { id: 6, nome: "Bordado" },
        { id: 7, nome: "Ribana" },
        { id: 8, nome: "Costureira" },
        { id: 9, nome: "Embalagem" }
    ],
    motivosSaida: [
        { id: 1, nome: "Venda" },
        { id: 2, nome: "Perda" },
        { id: 3, nome: "Amostra" }
    ],
    produtos: [], // será preenchido com exemplo
    movimentacoes: [], // histórico de entrada/saída
    gastosProducao: [],
    configuracoes: {
        estoqueMinimoPadrao: 5,
        // outras configurações futuras
    }
};

// Adicionar produtos de exemplo
function inicializarProdutosExemplo() {
    // Exemplo: Camisa Gola Polo
    const produto1 = {
        id: Date.now() + 1,
        nome: "Camisa Gola Polo",
        categoriaId: 1,
        subcategoriaId: 1,
        precoVenda: 89.90,
        custoUnitario: 45.00,
        estoqueMinimo: 3,
        variacoes: [
            { id: Date.now() + 101, corId: 1, tamanhoId: 2, quantidade: 10 },
            { id: Date.now() + 102, corId: 2, tamanhoId: 2, quantidade: 8 }
        ]
    };
    const produto2 = {
        id: Date.now() + 2,
        nome: "Camiseta Peruana",
        categoriaId: 2,
        subcategoriaId: 3,
        precoVenda: 59.90,
        custoUnitario: 28.50,
        estoqueMinimo: 5,
        variacoes: [
            { id: Date.now() + 201, corId: 1, tamanhoId: 1, quantidade: 15 },
            { id: Date.now() + 202, corId: 1, tamanhoId: 2, quantidade: 20 },
            { id: Date.now() + 203, corId: 3, tamanhoId: 2, quantidade: 12 }
        ]
    };
    dadosPadrao.produtos = [produto1, produto2];
}

// Carregar dados do localStorage ou inicializar com padrão
function carregarDados() {
    const dadosSalvos = localStorage.getItem("estoqueAppData");
    if (dadosSalvos) {
        try {
            const dados = JSON.parse(dadosSalvos);
            // Verificar versão (simples)
            if (dados.versao === "1.0") {
                return dados;
            } else {
                console.warn("Versão de dados diferente, recriando dados padrão.");
                inicializarProdutosExemplo();
                return dadosPadrao;
            }
        } catch (e) {
            console.error("Erro ao carregar dados", e);
            inicializarProdutosExemplo();
            return dadosPadrao;
        }
    } else {
        inicializarProdutosExemplo();
        return dadosPadrao;
    }
}

// Salvar dados no localStorage
function salvarDados(dados) {
    localStorage.setItem("estoqueAppData", JSON.stringify(dados));
    // Atualizar referência global
    window.app.dados = dados;
}

// Atualizar uma parte dos dados e salvar
function atualizarDados(novaParte) {
    const dados = window.app.dados;
    Object.assign(dados, novaParte);
    salvarDados(dados);
    // Disparar evento de atualização global (opcional)
    document.dispatchEvent(new CustomEvent('dadosAtualizados'));
}

// Expor funções no namespace
window.app.carregarDados = carregarDados;
window.app.salvarDados = salvarDados;
window.app.atualizarDados = atualizarDados;

// Inicialização: carrega dados e expõe globalmente
window.app.dados = carregarDados();