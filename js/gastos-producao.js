// ==================== gastos-producao.js ====================
// Controle de gastos de produção (tecido, botão, etc.)

window.app.gastosProducao = (function () {
    let graficoPizzaGastos, graficoBarraGastos;

    function renderizarGastos() {
        const container = document.getElementById('gastos-producao');
        if (!container) return;

        const dados = window.app.dados;
        const utils = window.app.utils;

        let html = `
            <div class="gastos-resumo">
                <div class="grafico-gastos" id="grafico-pizza-gastos">
                    <h4>Gastos por Categoria (Total = <span id="total-gastos-geral">R$ 0,00</span>)</h4>
                    <canvas id="pizza-gastos"></canvas>
                </div>
                <div class="grafico-gastos" id="grafico-barra-gastos">
                    <h4>Gastos por Produto</h4>
                    <canvas id="barra-gastos-produto"></canvas>
                </div>
            </div>
            <div class="form-gasto">
                <h3><i class="fas fa-plus-circle"></i> Adicionar Gasto de Produção</h3>
                <form id="form-gasto">
                    <div class="grupo-form">
                        <label>Produto *</label>
                        <select id="gasto-produto" required>
                            <option value="">Selecione</option>
                            ${dados.produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="grupo-form">
                        <label>Tipo de Gasto *</label>
                        <select id="gasto-tipo" required>
                            <option value="">Selecione</option>
                            ${dados.tiposGasto.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="grupo-form">
                        <label>Valor Total (R$) *</label>
                        <input type="number" step="0.01" id="gasto-valor" required>
                    </div>
                    <div class="grupo-form">
                        <label>Quantidade</label>
                        <input type="number" step="any" id="gasto-quantidade" placeholder="Ex: 10">
                    </div>
                    <div class="grupo-form">
                        <label>Unidade</label>
                        <input type="text" id="gasto-unidade" placeholder="Ex: kg, metro, un">
                    </div>
                    <div class="grupo-form">
                        <label>Fornecedor</label>
                        <input type="text" id="gasto-fornecedor">
                    </div>
                    <div class="grupo-form">
                        <label>Observações</label>
                        <textarea id="gasto-obs" rows="2"></textarea>
                    </div>
                    <button type="submit" class="btn-primario">Registrar Gasto</button>
                </form>
            </div>
            <div class="historico-gastos">
                <h3>Histórico de Gastos</h3>
                <div class="tabela-responsiva">
                    <table id="tabela-gastos">
                        <thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Valor Total</th><th>Quantidade</th><th>Unidade</th><th>Fornecedor</th><th>Obs</th><th>Ações</th></tr></thead>
                        <tbody id="lista-gastos"></tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;

        // Calcular total geral de gastos e exibir no span
        const totalGeral = dados.gastosProducao.reduce((soma, g) => soma + g.valorTotal, 0);
        const spanTotal = document.getElementById('total-gastos-geral');
        if (spanTotal) spanTotal.innerText = window.app.utils.formatarMoeda(totalGeral);

        // Preencher lista de gastos
        carregarListaGastos();

        // Inicializar gráficos
        atualizarGraficos();

        // Submissão do formulário
        document.getElementById('form-gasto').addEventListener('submit', (e) => {
            e.preventDefault();
            const produtoId = parseInt(document.getElementById('gasto-produto').value);
            const tipoGastoId = parseInt(document.getElementById('gasto-tipo').value);
            const valorTotal = parseFloat(document.getElementById('gasto-valor').value);
            const quantidade = parseFloat(document.getElementById('gasto-quantidade').value) || null;
            const unidade = document.getElementById('gasto-unidade').value || null;
            const fornecedor = document.getElementById('gasto-fornecedor').value || null;
            const observacao = document.getElementById('gasto-obs').value || null;

            if (!produtoId || !tipoGastoId || isNaN(valorTotal) || valorTotal <= 0) {
                utils.mostrarNotificacao('Preencha produto, tipo de gasto e valor total.', 'erro');
                return;
            }

            const novoGasto = {
                id: utils.gerarId(),
                produtoId,
                tipoGastoId,
                valorTotal,
                quantidade,
                unidade,
                fornecedor,
                observacao,
                data: new Date().toISOString()
            };
            dados.gastosProducao.push(novoGasto);
            window.app.salvarDados(dados);
            utils.mostrarNotificacao('Gasto registrado com sucesso.');
            carregarListaGastos();
            atualizarGraficos();
            document.getElementById('form-gasto').reset();
        });
    }

    function carregarListaGastos() {
        const dados = window.app.dados;
        const utils = window.app.utils;
        const tbody = document.getElementById('lista-gastos');
        if (!tbody) return;
        tbody.innerHTML = '';

        for (const gasto of dados.gastosProducao) {
            const produto = dados.produtos.find(p => p.id === gasto.produtoId);
            const produtoNome = produto ? produto.nome : 'Produto não encontrado';
            const tipoNome = utils.getTipoGastoNome(gasto.tipoGastoId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${utils.formatarData(gasto.data)}</td>
                <td>${produtoNome}</td>
                <td>${tipoNome}</td>
                <td>${utils.formatarMoeda(gasto.valorTotal)}</td>
                <td>${gasto.quantidade !== null ? gasto.quantidade : '-'}</td>
                <td>${gasto.unidade || '-'}</td>
                <td>${gasto.fornecedor || '-'}</td>
                <td>${gasto.observacao || '-'}</td>
                <td><button class="acao-botao excluir" data-id="${gasto.id}"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        }

        // Eventos de exclusão
        document.querySelectorAll('#lista-gastos .excluir').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                if (confirm('Excluir este gasto?')) {
                    dados.gastosProducao = dados.gastosProducao.filter(g => g.id !== id);
                    window.app.salvarDados(dados);
                    carregarListaGastos();
                    atualizarGraficos();
                }
            });
        });
    }

    function atualizarGraficos() {
        const dados = window.app.dados;
        const utils = window.app.utils;

        // Dados para gráfico de pizza por categoria (tipo de gasto)
        const gastosPorTipo = new Map();
        for (const gasto of dados.gastosProducao) {
            const tipoId = gasto.tipoGastoId;
            const tipoNome = utils.getTipoGastoNome(tipoId);
            gastosPorTipo.set(tipoNome, (gastosPorTipo.get(tipoNome) || 0) + gasto.valorTotal);
        }
        const labelsPizza = Array.from(gastosPorTipo.keys());
        const valoresPizza = Array.from(gastosPorTipo.values());

        const ctxPizza = document.getElementById('pizza-gastos')?.getContext('2d');
        if (ctxPizza) {
            if (graficoPizzaGastos) graficoPizzaGastos.destroy();
            graficoPizzaGastos = new Chart(ctxPizza, {
                type: 'pie',
                data: {
                    labels: labelsPizza,
                    datasets: [{
                        data: valoresPizza,
                        backgroundColor: ['#2c7da0', '#61a5c2', '#1f5068', '#89c2d9', '#a9d6e5', '#f1c40f', '#e67e22', '#e74c3c', '#2ecc71']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    onClick: (event, elements) => {
                        if (elements.length > 0) {
                            const index = elements[0].index;
                            const tipoNome = labelsPizza[index];
                            mostrarDetalhesPorTipo(tipoNome);
                        }
                    }
                }
            });
        }

        // Gráfico de barras: gastos por produto
        const gastosPorProduto = new Map();
        for (const gasto of dados.gastosProducao) {
            const produto = dados.produtos.find(p => p.id === gasto.produtoId);
            const produtoNome = produto ? produto.nome : 'Desconhecido';
            gastosPorProduto.set(produtoNome, (gastosPorProduto.get(produtoNome) || 0) + gasto.valorTotal);
        }
        const labelsBarra = Array.from(gastosPorProduto.keys());
        const valoresBarra = Array.from(gastosPorProduto.values());

        const ctxBarra = document.getElementById('barra-gastos-produto')?.getContext('2d');
        if (ctxBarra) {
            if (graficoBarraGastos) graficoBarraGastos.destroy();
            graficoBarraGastos = new Chart(ctxBarra, {
                type: 'bar',
                data: {
                    labels: labelsBarra,
                    datasets: [{
                        label: 'Total Gasto (R$)',
                        data: valoresBarra,
                        backgroundColor: '#2c7da0'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    onClick: (event, elements) => {
                        if (elements.length > 0) {
                            const index = elements[0].index;
                            const produtoNome = labelsBarra[index];
                            mostrarDetalhesPorProduto(produtoNome);
                        }
                    }
                }
            });
        }
    }

    function mostrarDetalhesPorTipo(tipoNome) {
        const dados = window.app.dados;
        const utils = window.app.utils;
        const tipoId = dados.tiposGasto.find(t => t.nome === tipoNome)?.id;
        if (!tipoId) return;

        const gastos = dados.gastosProducao.filter(g => g.tipoGastoId === tipoId);
        const totalGasto = gastos.reduce((acc, g) => acc + g.valorTotal, 0);

        let html = `
        <div style="margin-bottom: 15px; padding: 10px; background: var(--cinza-claro); border-radius: var(--borda-radius);">
            <strong>Total gasto nesta categoria:</strong> ${utils.formatarMoeda(totalGasto)}
        </div>
        <p><strong>Histórico de gastos:</strong></p>
        <ul>
    `;

        for (const g of gastos) {
            const produto = dados.produtos.find(p => p.id === g.produtoId);
            const produtoNome = produto ? produto.nome : 'Desconhecido';
            html += `<li>${utils.formatarData(g.data)} - Produto: ${produtoNome} - Valor: ${utils.formatarMoeda(g.valorTotal)} - Obs: ${g.observacao || ''}</li>`;
        }
        html += `</ul>`;

        const modal = document.getElementById('modal-generico');
        document.getElementById('modal-titulo').innerText = `Detalhes: ${tipoNome}`;
        document.getElementById('modal-corpo').innerHTML = html;
        modal.style.display = 'flex';
    }

    function mostrarDetalhesPorProduto(produtoNome) {
        const dados = window.app.dados;
        const utils = window.app.utils;
        const produto = dados.produtos.find(p => p.nome === produtoNome);
        if (!produto) return;

        const gastos = dados.gastosProducao.filter(g => g.produtoId === produto.id);
        const totalGasto = gastos.reduce((acc, g) => acc + g.valorTotal, 0);

        let html = `
        <div style="margin-bottom: 15px; padding: 10px; background: var(--cinza-claro); border-radius: var(--borda-radius);">
            <strong>Total gasto neste produto:</strong> ${utils.formatarMoeda(totalGasto)}
        </div>
        <p><strong>Histórico de gastos:</strong></p>
        <ul>
    `;

        for (const g of gastos) {
            const tipoNome = utils.getTipoGastoNome(g.tipoGastoId);
            html += `<li>${utils.formatarData(g.data)} - Tipo: ${tipoNome} - Valor: ${utils.formatarMoeda(g.valorTotal)} - Obs: ${g.observacao || ''}</li>`;
        }
        html += `</ul>`;

        const modal = document.getElementById('modal-generico');
        document.getElementById('modal-titulo').innerText = `Gastos com ${produtoNome}`;
        document.getElementById('modal-corpo').innerHTML = html;
        modal.style.display = 'flex';
    }

    return {
        renderizarGastos
    };
})();