// ==================== utils.js ====================
// Funções auxiliares reutilizáveis

// Gerar ID único (timestamp + random)
function gerarId() {
    return Date.now() + Math.floor(Math.random() * 10000);
}

// Formatar moeda (Real)
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formatar data para DD/MM/YYYY HH:MM
function formatarData(dataISO) {
    const d = new Date(dataISO);
    return d.toLocaleString('pt-BR');
}

// Exibir notificação toast
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerText = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Obter nome de categoria por ID
function getCategoriaNome(id) {
    const categoria = window.app.dados.categorias.find(c => c.id === id);
    return categoria ? categoria.nome : 'Desconhecida';
}

// Obter nome de subcategoria por ID
function getSubcategoriaNome(id) {
    const sub = window.app.dados.subcategorias.find(s => s.id === id);
    return sub ? sub.nome : 'Desconhecida';
}

// Obter nome de cor por ID
function getCorNome(id) {
    const cor = window.app.dados.cores.find(c => c.id === id);
    return cor ? cor.nome : 'Desconhecida';
}

// Obter nome de tamanho por ID
function getTamanhoNome(id) {
    const tam = window.app.dados.tamanhos.find(t => t.id === id);
    return tam ? tam.nome : 'Desconhecido';
}

// Obter nome de tipo de gasto por ID
function getTipoGastoNome(id) {
    const tipo = window.app.dados.tiposGasto.find(t => t.id === id);
    return tipo ? tipo.nome : 'Desconhecido';
}

// Obter nome de motivo saída por ID
function getMotivoSaidaNome(id) {
    const motivo = window.app.dados.motivosSaida.find(m => m.id === id);
    return motivo ? motivo.nome : 'Desconhecido';
}

// Calcular valor total em estoque (soma quantidade * custoUnitario)
function calcularValorTotalEstoque() {
    let total = 0;
    for (const produto of window.app.dados.produtos) {
        for (const variacao of produto.variacoes) {
            total += variacao.quantidade * produto.custoUnitario;
        }
    }
    return total;
}

// Calcular total de vendas do mês atual
function calcularVendasMes() {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    let total = 0;
    for (const mov of window.app.dados.movimentacoes) {
        if (mov.tipo === 'saida' && mov.motivoSaidaId === 1) { // apenas vendas
            const dataMov = new Date(mov.data);
            if (dataMov.getMonth() === mesAtual && dataMov.getFullYear() === anoAtual) {
                total += mov.valorTotal;
            }
        }
    }
    return total;
}

// Calcular total de vendas do dia atual
function calcularVendasDia() {
    const hoje = new Date().toDateString();
    let total = 0;
    for (const mov of window.app.dados.movimentacoes) {
        if (mov.tipo === 'saida' && mov.motivoSaidaId === 1) {
            if (new Date(mov.data).toDateString() === hoje) {
                total += mov.valorTotal;
            }
        }
    }
    return total;
}

// Contar total de produtos (considerando variações como itens de estoque? Será a soma das quantidades)
function contarTotalUnidadesEstoque() {
    let total = 0;
    for (const produto of window.app.dados.produtos) {
        for (const variacao of produto.variacoes) {
            total += variacao.quantidade;
        }
    }
    return total;
}

// Expor utilitários
window.app.utils = {
    gerarId,
    formatarMoeda,
    formatarData,
    mostrarNotificacao,
    getCategoriaNome,
    getSubcategoriaNome,
    getCorNome,
    getTamanhoNome,
    getTipoGastoNome,
    getMotivoSaidaNome,
    calcularValorTotalEstoque,
    calcularVendasMes,
    calcularVendasDia,
    contarTotalUnidadesEstoque
};