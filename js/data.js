// ==================== data.js ====================
// Gerencia todos os dados da aplicação, salvando e carregando do localStorage
// Versão 1.0

// Namespace principal
window.app = window.app || {};

// Dados padrão para inicialização (exemplo)
const dadosPadrao = {
    versao: "1.0",
    categorias: [
        { id: 1, nome: "Camisetas" },
        { id: 2, nome: "Camisas" },
        { id: 3, nome: "Shorts" },
        { id: 4, nome: "Regatas" } 
    ],
    subcategorias: [
        { id: 1, nome: "Peruana", categoriaId: 1 },
        { id: 2, nome: "100% Algodão", categoriaId: 1 },
        { id: 3, nome: "Canelada PV/PA", categoriaId: 2 },
        { id: 4, nome: "Alfaiataria", categoriaId: 3 },
        { id: 5, nome: "Confort", categoriaId: 3 },
        { id: 6, nome: "Canelada PA", categoriaId: 4 }
    ],
    cores: [
        { id: 1, nome: "Branco" },
        { id: 2, nome: "Preto" },
        { id: 3, nome: "Safari" },
        { id: 4, nome: "Azul Marinho" },
        { id: 5, nome: "Verde Musgo" },
        { id: 6, nome: "Vinho" },
        { id: 7, nome: "Rosa" },
        { id: 8, nome: "Caramelo" }
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
        { id: 2, nome: "Bordado" },
        { id: 3, nome: "Ribana" },
        { id: 4, nome: "Gola Polo + V" },
        { id: 5, nome: "Linha" },
        { id: 6, nome: "Botão" },
        { id: 7, nome: "Zíper" },
        { id: 8, nome: "Silk Tamanho (nuca, interior)" },
        { id: 9, nome: "Silk ZenK (nuca, exterior)" },
        { id: 10, nome: "Etiqueta Tamanho" },
        { id: 11, nome: "Etiqueta ZK (couro)" },
        { id: 12, nome: "Etiqueta Papel Couchê 300g" },
        { id: 13, nome: "Costureira" },
        { id: 14, nome: "Papel seda + cera" },
        { id: 15, nome: "ZipLock" },
        { id: 16, nome: "Frete" },
        { id: 17, nome: "Outros" }
    ],
    motivosSaida: [
        { id: 1, nome: "Venda" },
        { id: 2, nome: "Amostra/Perda" },
        { id: 3, nome: "Presente" }
    ],
    produtos: [], // será preenchido com exemplo
    movimentacoes: [], // histórico de entrada/saída
    gastosProducao: [],
    configuracoes: {
        estoqueMinimoPadrao: 4,
        // outras configurações futuras
    }
};

// Adicionar produtos de exemplo
function inicializarProdutosExemplo() {
    // Exemplo: Camisa Gola Polo
    const produto1 = {
        id: Date.now() + 1,
        nome: "Camiseta Gola Polo",
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
        nome: "Camiseta Essential",
        categoriaId: 1,
        subcategoriaId: 2,
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