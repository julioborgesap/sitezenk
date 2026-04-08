// ==================== exports.js ====================
// Funções de exportação (Excel e JSON)

window.app.exports = (function() {
    function exportarExcel() {
        const dados = window.app.dados;
        const utils = window.app.utils;

        // Preparar dados para planilha: cada variação de produto em uma linha
        const planilha = [];
        planilha.push(['Produto', 'Categoria', 'Subcategoria', 'Cor', 'Tamanho', 'Quantidade em Estoque', 'Preço Venda', 'Custo Unitário']);
        for (const produto of dados.produtos) {
            const catNome = utils.getCategoriaNome(produto.categoriaId);
            const subNome = utils.getSubcategoriaNome(produto.subcategoriaId);
            for (const variacao of produto.variacoes) {
                const corNome = utils.getCorNome(variacao.corId);
                const tamNome = utils.getTamanhoNome(variacao.tamanhoId);
                planilha.push([
                    produto.nome,
                    catNome,
                    subNome,
                    corNome,
                    tamNome,
                    variacao.quantidade,
                    produto.precoVenda,
                    produto.custoUnitario
                ]);
            }
        }
        const ws = XLSX.utils.aoa_to_sheet(planilha);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
        XLSX.writeFile(wb, `estoque_${new Date().toISOString().slice(0,19)}.xlsx`);
    }

    function exportarJSON() {
        const dados = window.app.dados;
        const dataStr = JSON.stringify(dados, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dados_estoque_${new Date().toISOString().slice(0,19)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return {
        exportarExcel,
        exportarJSON
    };
})();