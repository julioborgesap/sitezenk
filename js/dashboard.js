// ==================== dashboard.js ====================
// Renderiza o dashboard, gráficos e interatividade

window.app.dashboard = (function() {
    let graficoVendas, graficoCategorias, graficoBaixoEstoque;

    function renderizarDashboard() {
        const container = document.getElementById('dashboard');
        if (!container) return;

        const dados = window.app.dados;
        const utils = window.app.utils;

        const totalUnidades = utils.contarTotalUnidadesEstoque();
        const valorEstoque = utils.calcularValorTotalEstoque();
        const vendasMes = utils.calcularVendasMes();
        const vendasDia = utils.calcularVendasDia();

        // Produtos com estoque baixo (abaixo do mínimo)
        const produtosBaixoEstoque = [];
        for (const produto of dados.produtos) {
            for (const variacao of produto.variacoes) {
                if (variacao.quantidade <= produto.estoqueMinimo) {
                    produtosBaixoEstoque.push({
                        produtoNome: produto.nome,
                        cor: utils.getCorNome(variacao.corId),
                        tamanho: utils.getTamanhoNome(variacao.tamanhoId),
                        quantidade: variacao.quantidade,
                        minimo: produto.estoqueMinimo
                    });
                }
            }
        }

        // HTML do dashboard
        let html = `
            <div class="dashboard-cards">
                <div class="card-dashboard" data-tipo="total-produtos">
                    <h3><i class="fas fa-boxes"></i> Total em Estoque (unidades)</h3>
                    <div class="valor">${totalUnidades}</div>
                    <div class="detalhe">Clique para detalhes</div>
                </div>
                <div class="card-dashboard" data-tipo="valor-estoque">
                    <h3><i class="fas fa-dollar-sign"></i> Valor Total em Estoque</h3>
                    <div class="valor">${utils.formatarMoeda(valorEstoque)}</div>
                    <div class="detalhe">Clique para detalhes</div>
                </div>
                <div class="card-dashboard" data-tipo="vendas-mes">
                    <h3><i class="fas fa-calendar-alt"></i> Vendas no Mês</h3>
                    <div class="valor">${utils.formatarMoeda(vendasMes)}</div>
                    <div class="detalhe">Clique para detalhes</div>
                </div>
                <div class="card-dashboard" data-tipo="vendas-dia">
                    <h3><i class="fas fa-sun"></i> Vendas Hoje</h3>
                    <div class="valor">${utils.formatarMoeda(vendasDia)}</div>
                    <div class="detalhe">Clique para detalhes</div>
                </div>
            </div>
            <div class="alerta-estoque">
                <h3><i class="fas fa-exclamation-triangle"></i> Alertas de Estoque Baixo</h3>
                <div class="tabela-responsiva">
                    <table class="tabela-alerta">
                        <thead>
                            <tr><th>Produto</th><th>Cor</th><th>Tamanho</th><th>Quantidade</th><th>Mínimo</th></tr>
                        </thead>
                        <tbody>
        `;
        if (produtosBaixoEstoque.length === 0) {
            html += `<tr><td colspan="5">Nenhum produto com estoque baixo.</td></tr>`;
        } else {
            for (const item of produtosBaixoEstoque) {
                html += `<tr class="estoque-critico">
                            <td>${item.produtoNome}</td>
                            <td>${item.cor}</td>
                            <td>${item.tamanho}</td>
                            <td>${item.quantidade}</td>
                            <td>${item.minimo}</td>
                         </tr>`;
            }
        }
        html += `</tbody></table></div></div>`;

        // Gráficos
        html += `<div class="graficos-container">
                    <div class="grafico-card">
                        <h4>Estoque por Categoria</h4>
                        <canvas id="grafico-categorias"></canvas>
                    </div>
                    <div class="grafico-card">
                        <h4>Produtos Mais Vendidos (Geral)</h4>
                        <canvas id="grafico-mais-vendidos"></canvas>
                    </div>
                </div>`;

        container.innerHTML = html;

        // Adicionar eventos de clique nos cards
        document.querySelectorAll('.card-dashboard').forEach(card => {
            card.addEventListener('click', () => {
                const tipo = card.getAttribute('data-tipo');
                mostrarDetalhesCard(tipo);
            });
        });

        // Renderizar gráficos
        renderizarGraficoEstoquePorCategoria();
        renderizarGraficoMaisVendidos();
    }

    function renderizarGraficoEstoquePorCategoria() {
        const canvas = document.getElementById('grafico-categorias');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dados = window.app.dados;
        const utils = window.app.utils;

        // Agrupar por categoria: somar quantidade de todos os produtos e variações
        const categoriasMap = new Map();
        for (const produto of dados.produtos) {
            const catNome = utils.getCategoriaNome(produto.categoriaId);
            let totalQuantidade = 0;
            for (const variacao of produto.variacoes) {
                totalQuantidade += variacao.quantidade;
            }
            categoriasMap.set(catNome, (categoriasMap.get(catNome) || 0) + totalQuantidade);
        }
        const labels = Array.from(categoriasMap.keys());
        const valores = Array.from(categoriasMap.values());

        if (graficoCategorias) graficoCategorias.destroy();
        graficoCategorias = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade em Estoque',
                    data: valores,
                    backgroundColor: 'rgba(44, 125, 160, 0.6)',
                    borderColor: 'rgba(44, 125, 160, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const categoria = labels[index];
                        mostrarDetalhesCategoria(categoria);
                    }
                }
            }
        });
    }

    function renderizarGraficoMaisVendidos() {
        const canvas = document.getElementById('grafico-mais-vendidos');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dados = window.app.dados;
        const utils = window.app.utils;

        // Calcular vendas por produto (quantidade vendida)
        const vendasMap = new Map(); // key: produtoId, value: quantidade vendida
        for (const mov of dados.movimentacoes) {
            if (mov.tipo === 'saida' && mov.motivoSaidaId === 1) { // apenas vendas
                for (const item of mov.itens) {
                    const produto = dados.produtos.find(p => p.id === item.produtoId);
                    if (produto) {
                        vendasMap.set(produto.id, (vendasMap.get(produto.id) || 0) + item.quantidade);
                    }
                }
            }
        }
        // Ordenar e pegar top 5
        const sorted = Array.from(vendasMap.entries()).sort((a,b) => b[1] - a[1]).slice(0,5);
        const labels = sorted.map(([id, qtd]) => {
            const produto = dados.produtos.find(p => p.id === id);
            return produto ? produto.nome : 'Desconhecido';
        });
        const valores = sorted.map(([id, qtd]) => qtd);

        if (graficoVendas) graficoVendas.destroy();
        graficoVendas = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: ['#2c7da0', '#61a5c2', '#1f5068', '#89c2d9', '#a9d6e5']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const produtoId = sorted[index][0];
                        mostrarDetalhesProdutoVendido(produtoId);
                    }
                }
            }
        });
    }

    function mostrarDetalhesCard(tipo) {
        const utils = window.app.utils;
        let titulo = '';
        let conteudo = '';

        switch(tipo) {
            case 'total-produtos':
                titulo = 'Detalhamento de Unidades em Estoque';
                const produtosUnidades = [];
                for (const produto of window.app.dados.produtos) {
                    let total = 0;
                    for (const v of produto.variacoes) total += v.quantidade;
                    produtosUnidades.push({ nome: produto.nome, total });
                }
                conteudo = `<ul>${produtosUnidades.map(p => `<li><strong>${p.nome}</strong>: ${p.total} unidades</li>`).join('')}</ul>`;
                break;
            case 'valor-estoque':
                titulo = 'Valor em Estoque por Produto';
                const produtosValor = [];
                for (const produto of window.app.dados.produtos) {
                    let totalValor = 0;
                    for (const v of produto.variacoes) totalValor += v.quantidade * produto.custoUnitario;
                    produtosValor.push({ nome: produto.nome, valor: totalValor });
                }
                conteudo = `<ul>${produtosValor.map(p => `<li><strong>${p.nome}</strong>: ${utils.formatarMoeda(p.valor)}</li>`).join('')}</ul>`;
                break;
            case 'vendas-mes':
                titulo = 'Detalhamento das Vendas do Mês';
                const vendasMes = window.app.dados.movimentacoes.filter(m => {
                    if (m.tipo !== 'saida' || m.motivoSaidaId !== 1) return false;
                    const data = new Date(m.data);
                    const agora = new Date();
                    return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
                });
                if (vendasMes.length === 0) conteudo = '<p>Nenhuma venda registrada neste mês.</p>';
                else {
                    conteudo = `<ul>${vendasMes.map(m => `<li>${utils.formatarData(m.data)} - Valor: ${utils.formatarMoeda(m.valorTotal)} - Obs: ${m.observacao || ''}</li>`).join('')}</ul>`;
                }
                break;
            case 'vendas-dia':
                titulo = 'Vendas de Hoje';
                const hoje = new Date().toDateString();
                const vendasHoje = window.app.dados.movimentacoes.filter(m => {
                    if (m.tipo !== 'saida' || m.motivoSaidaId !== 1) return false;
                    return new Date(m.data).toDateString() === hoje;
                });
                if (vendasHoje.length === 0) conteudo = '<p>Nenhuma venda hoje.</p>';
                else {
                    conteudo = `<ul>${vendasHoje.map(m => `<li>${utils.formatarData(m.data)} - Valor: ${utils.formatarMoeda(m.valorTotal)} - Obs: ${m.observacao || ''}</li>`).join('')}</ul>`;
                }
                break;
            default: return;
        }

        const modal = document.getElementById('modal-generico');
        const modalTitulo = document.getElementById('modal-titulo');
        const modalCorpo = document.getElementById('modal-corpo');
        modalTitulo.innerText = titulo;
        modalCorpo.innerHTML = conteudo;
        modal.style.display = 'flex';
    }

    function mostrarDetalhesCategoria(categoriaNome) {
        const utils = window.app.utils;
        const dados = window.app.dados;
        const produtosCategoria = dados.produtos.filter(p => utils.getCategoriaNome(p.categoriaId) === categoriaNome);
        let html = '<ul>';
        for (const produto of produtosCategoria) {
            let totalQuant = 0;
            for (const v of produto.variacoes) totalQuant += v.quantidade;
            html += `<li><strong>${produto.nome}</strong>: ${totalQuant} unidades</li>`;
        }
        html += '</ul>';
        const modal = document.getElementById('modal-generico');
        document.getElementById('modal-titulo').innerText = `Estoque na categoria ${categoriaNome}`;
        document.getElementById('modal-corpo').innerHTML = html;
        modal.style.display = 'flex';
    }

    function mostrarDetalhesProdutoVendido(produtoId) {
        const utils = window.app.utils;
        const dados = window.app.dados;
        const produto = dados.produtos.find(p => p.id === produtoId);
        if (!produto) return;
        let vendasProduto = [];
        for (const mov of dados.movimentacoes) {
            if (mov.tipo === 'saida' && mov.motivoSaidaId === 1) {
                for (const item of mov.itens) {
                    if (item.produtoId === produtoId) {
                        vendasProduto.push({ data: mov.data, quantidade: item.quantidade, valor: item.precoUnitario * item.quantidade });
                    }
                }
            }
        }
        let html = `<p><strong>Produto:</strong> ${produto.nome}</p><ul>`;
        for (const v of vendasProduto) {
            html += `<li>${utils.formatarData(v.data)} - Quantidade: ${v.quantidade} - Valor: ${utils.formatarMoeda(v.valor)}</li>`;
        }
        html += '</ul>';
        const modal = document.getElementById('modal-generico');
        document.getElementById('modal-titulo').innerText = `Vendas do produto ${produto.nome}`;
        document.getElementById('modal-corpo').innerHTML = html;
        modal.style.display = 'flex';
    }

    return {
        renderizarDashboard
    };
})();