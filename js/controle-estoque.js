// ==================== controle-estoque.js ====================
// Controle de entrada e saída de estoque, histórico, estatísticas

window.app.controleEstoque = (function () {
    let carrinhoItens = []; // para saída múltipla

    function renderizarControleEstoque() {
        const container = document.getElementById('controle-estoque');
        if (!container) return;

        const dados = window.app.dados;
        const utils = window.app.utils;

        // Layout duas colunas: entrada e saída
        let html = `
            <div class="controle-duas-colunas">
                <div class="form-estoque">
                    <h3><i class="fas fa-arrow-down"></i> Entrada de Estoque</h3>
                    <form id="form-entrada">
                        <div class="grupo-form">
                            <label>Produto *</label>
                            <select id="entrada-produto" required>
                                <option value="">Selecione</option>
                                ${dados.produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('')}
                            </select>
                        </div>
                        <div class="grupo-form">
                            <label>Variação *</label>
                            <select id="entrada-variacao" required disabled>
                                <option value="">Selecione primeiro o produto</option>
                            </select>
                        </div>
                        <div class="grupo-form">
                            <label>Quantidade *</label>
                            <input type="number" id="entrada-quantidade" required min="1">
                        </div>
                        <div class="grupo-form">
                            <label>Preço Unitário (R$) *</label>
                            <input type="number" step="0.01" id="entrada-preco" required>
                        </div>
                        <div class="grupo-form">
                            <label>Observações</label>
                            <textarea id="entrada-obs" rows="2"></textarea>
                        </div>
                        <button type="submit" class="btn-primario">Registrar Entrada</button>
                    </form>
                </div>
                <div class="form-estoque">
                    <h3><i class="fas fa-arrow-up"></i> Saída (Venda/Perda)</h3>
                    <div id="carrinho-area">
                        <div class="grupo-form">
                            <label>Produto</label>
                            <select id="saida-produto">
                                <option value="">Selecione</option>
                                ${dados.produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('')}
                            </select>
                        </div>
                        <div class="grupo-form">
                            <label>Variação</label>
                            <select id="saida-variacao" disabled>
                                <option value="">Selecione primeiro o produto</option>
                            </select>
                        </div>
                        <div class="grupo-form">
                            <label>Quantidade</label>
                            <input type="number" id="saida-quantidade" min="1" value="1">
                        </div>
                        <button type="button" id="btn-adicionar-carrinho" class="btn-secundario">Adicionar ao Carrinho</button>
                    </div>
                    <div id="carrinho-itens" class="carrinho-itens">
                        <h4>Carrinho</h4>
                        <table class="tabela-carrinho">
                            <thead><tr><th>Produto</th><th>Variação</th><th>Qtd</th><th>Preço Unit.</th><th>Subtotal</th><th></th></tr></thead>
                            <tbody id="carrinho-tbody"></tbody>
                        </table>
                        <div class="total-carrinho" id="total-carrinho">Total: R$ 0,00</div>
                        <div class="grupo-form">
                            <label>Motivo da Saída *</label>
                            <select id="motivo-saida" required>
                                ${dados.motivosSaida.map(m => `<option value="${m.id}">${m.nome}</option>`).join('')}
                            </select>
                        </div>
                        <div class="grupo-form">
                            <label>Número do Pedido (opcional)</label>
                            <input type="text" id="numero-pedido">
                        </div>
                        <div class="grupo-form">
                            <label>Observações</label>
                            <textarea id="saida-obs" rows="2"></textarea>
                        </div>
                        <button id="btn-finalizar-venda" class="btn-primario">Finalizar Saída</button>
                    </div>
                </div>
            </div>
            <div class="abas-secundarias">
                <div class="botoes-abas">
                    <button class="btn-aba-historico ativo" data-aba="historico">Histórico</button>
                    <button class="btn-aba-estatisticas" data-aba="estatisticas">Estatísticas</button>
                </div>
                <div id="historico-area" class="aba-conteudo-interno ativo">
                    <div class="filtro-periodo">
                        <input type="date" id="filtro-data-inicio">
                        <input type="date" id="filtro-data-fim">
                        <button id="aplicar-filtro" class="btn-secundario">Filtrar</button>
                        <button id="limpar-filtro" class="btn-secundario">Limpar</button>
                    </div>
                    <div class="historico-tabela">
                        <table id="tabela-historico">
                            <thead><tr><th>Data/Hora</th><th>Tipo</th><th>Produto</th><th>Variação</th><th>Quantidade</th><th>Valor Unit.</th><th>Total</th><th>Obs</th></tr></thead>
                            <tbody id="historico-tbody"></tbody>
                        </table>
                    </div>
                </div>
                <div id="estatisticas-area" class="aba-conteudo-interno">
                    <div class="estatisticas-container">
                        <div class="grafico-card">
                            <h4>Entradas vs Saídas (unidades)</h4>
                            <canvas id="grafico-entradas-saidas"></canvas>
                        </div>
                        <div class="grafico-card">
                            <h4>Lucro/Prejuízo (considerando vendas)</h4>
                            <canvas id="grafico-lucro"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

        // Inicializar eventos
        inicializarEntrada();
        inicializarSaida();
        atualizarCarrinhoUI();
        carregarHistorico();

        // Abas internas
        document.querySelectorAll('.btn-aba-historico, .btn-aba-estatisticas').forEach(btn => {
            btn.addEventListener('click', () => {
                const aba = btn.getAttribute('data-aba');
                document.querySelectorAll('.btn-aba-historico, .btn-aba-estatisticas').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                document.getElementById('historico-area').classList.toggle('ativo', aba === 'historico');
                document.getElementById('estatisticas-area').classList.toggle('ativo', aba === 'estatisticas');
                if (aba === 'estatisticas') {
                    renderizarGraficosEstatisticas();
                }
            });
        });

        // Filtro histórico
        document.getElementById('aplicar-filtro').addEventListener('click', () => carregarHistorico());
        document.getElementById('limpar-filtro').addEventListener('click', () => {
            document.getElementById('filtro-data-inicio').value = '';
            document.getElementById('filtro-data-fim').value = '';
            carregarHistorico();
        });
    }

    // ========== ENTRADA ==========
    function inicializarEntrada() {
        const selectProduto = document.getElementById('entrada-produto');
        const selectVariacao = document.getElementById('entrada-variacao');
        const form = document.getElementById('form-entrada');

        selectProduto.addEventListener('change', () => {
            const produtoId = parseInt(selectProduto.value);
            const produto = window.app.dados.produtos.find(p => p.id === produtoId);
            if (produto) {
                selectVariacao.disabled = false;
                selectVariacao.innerHTML = '<option value="">Selecione</option>' + produto.variacoes.map(v => `<option value="${v.id}">${window.app.utils.getCorNome(v.corId)} / ${window.app.utils.getTamanhoNome(v.tamanhoId)}</option>`).join('');
                // Pré-preencher preço unitário com custoUnitario do produto
                document.getElementById('entrada-preco').value = produto.custoUnitario;
            } else {
                selectVariacao.disabled = true;
                selectVariacao.innerHTML = '<option value="">Selecione primeiro o produto</option>';
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const produtoId = parseInt(selectProduto.value);
            const variacaoId = parseInt(selectVariacao.value);
            const quantidade = parseInt(document.getElementById('entrada-quantidade').value);
            const precoUnitario = parseFloat(document.getElementById('entrada-preco').value);
            const obs = document.getElementById('entrada-obs').value;

            if (!produtoId || !variacaoId || isNaN(quantidade) || quantidade <= 0 || isNaN(precoUnitario) || precoUnitario <= 0) {
                window.app.utils.mostrarNotificacao('Preencha todos os campos corretamente.', 'erro');
                return;
            }

            // Encontrar produto e variação
            const produto = window.app.dados.produtos.find(p => p.id === produtoId);
            const variacao = produto.variacoes.find(v => v.id === variacaoId);
            if (!variacao) return;

            // Atualizar estoque
            variacao.quantidade += quantidade;

            // Registrar movimentação
            const novaMov = {
                id: window.app.utils.gerarId(),
                tipo: 'entrada',
                data: new Date().toISOString(),
                observacao: obs,
                itens: [{
                    produtoId: produtoId,
                    variacaoId: variacaoId,
                    quantidade: quantidade,
                    precoUnitario: precoUnitario
                }],
                valorTotal: quantidade * precoUnitario,
                motivoSaidaId: null,
                numeroPedido: null
            };
            window.app.dados.movimentacoes.push(novaMov);
            window.app.salvarDados(window.app.dados);
            window.app.utils.mostrarNotificacao('Entrada registrada com sucesso.');
            form.reset();
            selectVariacao.disabled = true;
            selectVariacao.innerHTML = '<option value="">Selecione primeiro o produto</option>';
            // Atualizar outras abas (ex: produtos)
            if (window.app.produtos) window.app.produtos.renderizarProdutos();
            carregarHistorico();
        });
    }

    // ========== SAÍDA (carrinho) ==========
    function inicializarSaida() {
        const selectProduto = document.getElementById('saida-produto');
        const selectVariacao = document.getElementById('saida-variacao');
        const btnAdd = document.getElementById('btn-adicionar-carrinho');

        selectProduto.addEventListener('change', () => {
            const produtoId = parseInt(selectProduto.value);
            const produto = window.app.dados.produtos.find(p => p.id === produtoId);
            if (produto) {
                selectVariacao.disabled = false;
                selectVariacao.innerHTML = '<option value="">Selecione</option>' + produto.variacoes.map(v => `<option value="${v.id}">${window.app.utils.getCorNome(v.corId)} / ${window.app.utils.getTamanhoNome(v.tamanhoId)} (Estoque: ${v.quantidade})</option>`).join('');
            } else {
                selectVariacao.disabled = true;
                selectVariacao.innerHTML = '<option value="">Selecione primeiro o produto</option>';
            }
        });

        btnAdd.addEventListener('click', () => {
            const produtoId = parseInt(selectProduto.value);
            const variacaoId = parseInt(selectVariacao.value);
            const quantidade = parseInt(document.getElementById('saida-quantidade').value);
            if (!produtoId || !variacaoId || isNaN(quantidade) || quantidade <= 0) {
                window.app.utils.mostrarNotificacao('Selecione produto, variação e quantidade válida.', 'erro');
                return;
            }
            const produto = window.app.dados.produtos.find(p => p.id === produtoId);
            const variacao = produto.variacoes.find(v => v.id === variacaoId);
            if (!variacao) return;
            // Verificar estoque atual (apenas para alerta, mas não impede de adicionar ao carrinho; a validação final ocorrerá na finalização)
            if (variacao.quantidade < quantidade) {
                window.app.utils.mostrarNotificacao(`Estoque insuficiente para ${produto.nome} (${window.app.utils.getCorNome(variacao.corId)}/${window.app.utils.getTamanhoNome(variacao.tamanhoId)}). Disponível: ${variacao.quantidade}`, 'erro');
                return;
            }
            // Adicionar ao carrinho
            const itemIndex = carrinhoItens.findIndex(item => item.produtoId === produtoId && item.variacaoId === variacaoId);
            if (itemIndex !== -1) {
                carrinhoItens[itemIndex].quantidade += quantidade;
            } else {
                carrinhoItens.push({
                    produtoId,
                    variacaoId,
                    quantidade,
                    precoUnitario: produto.precoVenda, // usa preço de venda do produto, mas pode ser editado depois?
                    produtoNome: produto.nome,
                    variacaoDesc: `${window.app.utils.getCorNome(variacao.corId)}/${window.app.utils.getTamanhoNome(variacao.tamanhoId)}`
                });
            }
            atualizarCarrinhoUI();
            // Limpar campos
            selectProduto.value = '';
            selectVariacao.disabled = true;
            selectVariacao.innerHTML = '<option value="">Selecione primeiro o produto</option>';
            document.getElementById('saida-quantidade').value = '1';
        });

        document.getElementById('btn-finalizar-venda').addEventListener('click', finalizarSaida);
    }

    function atualizarCarrinhoUI() {
        const tbody = document.getElementById('carrinho-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        let total = 0;
        for (let i = 0; i < carrinhoItens.length; i++) {
            const item = carrinhoItens[i];
            const subtotal = item.quantidade * item.precoUnitario;
            total += subtotal;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.produtoNome}</td>
                <td>${item.variacaoDesc}</td>
                <td><input type="number" min="1" value="${item.quantidade}" data-index="${i}" class="carrinho-qtd" style="width:70px"></td>
                <td><input type="number" step="0.01" value="${item.precoUnitario}" data-index="${i}" class="carrinho-preco" style="width:80px"></td>
                <td>${window.app.utils.formatarMoeda(subtotal)}</td>
                <td><button class="btn-remover-item" data-index="${i}"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        }
        document.getElementById('total-carrinho').innerHTML = `Total: ${window.app.utils.formatarMoeda(total)}`;

        // Eventos de alteração de quantidade/preço e remoção
        document.querySelectorAll('.carrinho-qtd').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(input.dataset.index);
                const novaQtd = parseInt(input.value);
                if (isNaN(novaQtd) || novaQtd < 1) {
                    input.value = carrinhoItens[idx].quantidade;
                    return;
                }
                carrinhoItens[idx].quantidade = novaQtd;
                atualizarCarrinhoUI();
            });
        });
        document.querySelectorAll('.carrinho-preco').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(input.dataset.index);
                const novoPreco = parseFloat(input.value);
                if (isNaN(novoPreco) || novoPreco < 0) {
                    input.value = carrinhoItens[idx].precoUnitario;
                    return;
                }
                carrinhoItens[idx].precoUnitario = novoPreco;
                atualizarCarrinhoUI();
            });
        });
        document.querySelectorAll('.btn-remover-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                carrinhoItens.splice(idx, 1);
                atualizarCarrinhoUI();
            });
        });
    }

    function finalizarSaida() {
        if (carrinhoItens.length === 0) {
            window.app.utils.mostrarNotificacao('Adicione itens ao carrinho.', 'erro');
            return;
        }
        const motivoSaidaId = parseInt(document.getElementById('motivo-saida').value);
        const numeroPedido = document.getElementById('numero-pedido').value;
        const obs = document.getElementById('saida-obs').value;
        if (!motivoSaidaId) {
            window.app.utils.mostrarNotificacao('Selecione o motivo da saída.', 'erro');
            return;
        }

        // Validação de estoque acumulada: verificar se todos os itens têm estoque suficiente
        const dados = window.app.dados;
        for (const item of carrinhoItens) {
            const produto = dados.produtos.find(p => p.id === item.produtoId);
            const variacao = produto.variacoes.find(v => v.id === item.variacaoId);
            if (!variacao || variacao.quantidade < item.quantidade) {
                window.app.utils.mostrarNotificacao(`Estoque insuficiente para ${item.produtoNome} (${item.variacaoDesc}). Disponível: ${variacao ? variacao.quantidade : 0}`, 'erro');
                return;
            }
        }

        // Deduzir estoque e registrar movimentação
        const itensMov = [];
        let valorTotal = 0;
        for (const item of carrinhoItens) {
            const produto = dados.produtos.find(p => p.id === item.produtoId);
            const variacao = produto.variacoes.find(v => v.id === item.variacaoId);
            variacao.quantidade -= item.quantidade;
            const subtotal = item.quantidade * item.precoUnitario;
            valorTotal += subtotal;
            itensMov.push({
                produtoId: item.produtoId,
                variacaoId: item.variacaoId,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario
            });
        }

        const novaMov = {
            id: window.app.utils.gerarId(),
            tipo: 'saida',
            data: new Date().toISOString(),
            observacao: obs,
            itens: itensMov,
            valorTotal: valorTotal,
            motivoSaidaId: motivoSaidaId,
            numeroPedido: numeroPedido || null
        };
        dados.movimentacoes.push(novaMov);
        window.app.salvarDados(dados);
        window.app.utils.mostrarNotificacao('Saída registrada com sucesso.');
        carrinhoItens = [];
        atualizarCarrinhoUI();
        document.getElementById('motivo-saida').value = '';
        document.getElementById('numero-pedido').value = '';
        document.getElementById('saida-obs').value = '';
        // Atualizar outras abas
        if (window.app.produtos) window.app.produtos.renderizarProdutos();
        carregarHistorico();
    }

    // ========== HISTÓRICO ==========
    // ========== HISTÓRICO COM EXCLUSÃO ==========
    function carregarHistorico() {
        const dados = window.app.dados;
        const utils = window.app.utils;
        const tbody = document.getElementById('historico-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        let movimentacoes = [...dados.movimentacoes];
        // Filtrar por data
        const inicio = document.getElementById('filtro-data-inicio').value;
        const fim = document.getElementById('filtro-data-fim').value;
        if (inicio) {
            movimentacoes = movimentacoes.filter(m => new Date(m.data) >= new Date(inicio));
        }
        if (fim) {
            movimentacoes = movimentacoes.filter(m => new Date(m.data) <= new Date(fim));
        }
        // Ordenar por data decrescente
        movimentacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

        for (const mov of movimentacoes) {
            // Para cada item na movimentação, exibir uma linha com botão de excluir
            for (const item of mov.itens) {
                const produto = dados.produtos.find(p => p.id === item.produtoId);
                if (!produto) continue;
                const variacao = produto.variacoes.find(v => v.id === item.variacaoId);
                const variacaoDesc = variacao ? `${utils.getCorNome(variacao.corId)}/${utils.getTamanhoNome(variacao.tamanhoId)}` : 'Variação não encontrada';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td>${utils.formatarData(mov.data)}</td>
                <td>${mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
                <td>${produto.nome}</td>
                <td>${variacaoDesc}</td>
                <td>${item.quantidade}</td>
                <td>${utils.formatarMoeda(item.precoUnitario)}</td>
                <td>${utils.formatarMoeda(item.quantidade * item.precoUnitario)}</td>
                <td>${mov.observacao || ''}</td>
                <td><button class="acao-botao excluir-mov" data-id="${mov.id}" title="Excluir movimentação"><i class="fas fa-trash"></i></button></td>
            `;
                tbody.appendChild(tr);
            }
        }

        // Adicionar eventos de exclusão
        document.querySelectorAll('.excluir-mov').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const movId = parseInt(btn.dataset.id);
                if (confirm('Excluir esta movimentação? O estoque será revertido ao estado anterior.')) {
                    excluirMovimentacao(movId);
                }
            });
        });
    }

    // ========== EXCLUIR MOVIMENTAÇÃO (COM REVERSÃO DE ESTOQUE) ==========
    function excluirMovimentacao(movId) {
        const dados = window.app.dados;
        const movIndex = dados.movimentacoes.findIndex(m => m.id === movId);
        if (movIndex === -1) return;

        const mov = dados.movimentacoes[movIndex];

        // Reverter o efeito no estoque
        for (const item of mov.itens) {
            const produto = dados.produtos.find(p => p.id === item.produtoId);
            if (!produto) continue;
            const variacao = produto.variacoes.find(v => v.id === item.variacaoId);
            if (!variacao) continue;

            if (mov.tipo === 'entrada') {
                // Entrada: subtrai a quantidade do estoque
                variacao.quantidade -= item.quantidade;
                if (variacao.quantidade < 0) variacao.quantidade = 0; // segurança
            } else if (mov.tipo === 'saida') {
                // Saída: adiciona de volta ao estoque
                variacao.quantidade += item.quantidade;
            }
        }

        // Remover a movimentação do array
        dados.movimentacoes.splice(movIndex, 1);

        // Salvar e atualizar interfaces
        window.app.salvarDados(dados);
        window.app.utils.mostrarNotificacao('Movimentação excluída e estoque corrigido.');

        // Recarregar histórico e outras abas afetadas
        carregarHistorico();
        if (window.app.produtos) window.app.produtos.renderizarProdutos();
        if (window.app.dashboard) window.app.dashboard.renderizarDashboard();
        renderizarGraficosEstatisticas(); // se existir
    }

    // ========== ESTATÍSTICAS ==========
    let graficoEntradasSaidas, graficoLucro;
    function renderizarGraficosEstatisticas() {
        const dados = window.app.dados;
        const utils = window.app.utils;

        // Total de entradas (unidades) e saídas (unidades)
        let totalEntradas = 0, totalSaidas = 0;
        let lucroTotal = 0;
        for (const mov of dados.movimentacoes) {
            let qtdTotal = mov.itens.reduce((sum, i) => sum + i.quantidade, 0);
            if (mov.tipo === 'entrada') {
                totalEntradas += qtdTotal;
            } else {
                totalSaidas += qtdTotal;
                // Cálculo de lucro: receita - custo dos produtos vendidos
                let custoVendido = 0;
                for (const item of mov.itens) {
                    const produto = dados.produtos.find(p => p.id === item.produtoId);
                    if (produto) {
                        custoVendido += item.quantidade * produto.custoUnitario;
                    }
                }
                lucroTotal += (mov.valorTotal - custoVendido);
            }
        }

        // Gráfico de barras entradas vs saídas
        const ctx1 = document.getElementById('grafico-entradas-saidas')?.getContext('2d');
        if (ctx1) {
            if (graficoEntradasSaidas) graficoEntradasSaidas.destroy();
            graficoEntradasSaidas = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: ['Entradas', 'Saídas'],
                    datasets: [{
                        label: 'Unidades',
                        data: [totalEntradas, totalSaidas],
                        backgroundColor: ['#2c7da0', '#0b8611']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    onClick: (event, elements) => {
                        if (elements.length > 0) {
                            const index = elements[0].index;
                            if (index === 0) mostrarDetalhesMovimentacoes('entrada');
                            else mostrarDetalhesMovimentacoes('saida');
                        }
                    }
                }
            });
        }

        // Gráfico de lucro (simples)
        const ctx2 = document.getElementById('grafico-lucro')?.getContext('2d');
        if (ctx2) {
            if (graficoLucro) graficoLucro.destroy();
            graficoLucro = new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: ['Lucro', 'Custo Total Vendido'],
                    datasets: [{
                        data: [lucroTotal, 0], // precisamos calcular custo total vendido
                        backgroundColor: ['#2ecc71', '#e67e22']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    onClick: (event, elements) => {
                        if (elements.length > 0) {
                            const index = elements[0].index;
                            if (index === 0) mostrarDetalhesLucro();
                            else mostrarDetalhesCustoVendido();
                        }
                    }
                }
            });
            // Atualizar dados reais
            let custoTotalVendido = 0;
            for (const mov of dados.movimentacoes) {
                if (mov.tipo === 'saida') {
                    for (const item of mov.itens) {
                        const produto = dados.produtos.find(p => p.id === item.produtoId);
                        if (produto) custoTotalVendido += item.quantidade * produto.custoUnitario;
                    }
                }
            }
            graficoLucro.data.datasets[0].data = [lucroTotal, custoTotalVendido];
            graficoLucro.update();
        }
    }

    function mostrarDetalhesMovimentacoes(tipo) {
        const dados = window.app.dados;
        const utils = window.app.utils;
        let titulo = tipo === 'entrada' ? 'Detalhes das Entradas' : 'Detalhes das Saídas';
        let html = '<ul>';
        for (const mov of dados.movimentacoes) {
            if (mov.tipo === tipo) {
                html += `<li>${utils.formatarData(mov.data)} - Valor: ${utils.formatarMoeda(mov.valorTotal)} - Obs: ${mov.observacao || ''}</li>`;
            }
        }
        html += '</ul>';
        const modal = document.getElementById('modal-generico');
        document.getElementById('modal-titulo').innerText = titulo;
        document.getElementById('modal-corpo').innerHTML = html;
        modal.style.display = 'flex';
    }

    function mostrarDetalhesLucro() {
        const dados = window.app.dados;
        const utils = window.app.utils;
        let html = '<p><strong>Detalhamento do Lucro por Venda:</strong></p><ul>';
        for (const mov of dados.movimentacoes) {
            if (mov.tipo === 'saida') {
                let custoVendido = 0;
                for (const item of mov.itens) {
                    const produto = dados.produtos.find(p => p.id === item.produtoId);
                    if (produto) custoVendido += item.quantidade * produto.custoUnitario;
                }
                const lucro = mov.valorTotal - custoVendido;
                html += `<li>${utils.formatarData(mov.data)} - Venda: ${utils.formatarMoeda(mov.valorTotal)} - Custo: ${utils.formatarMoeda(custoVendido)} - Lucro: ${utils.formatarMoeda(lucro)}</li>`;
            }
        }
        html += '</ul>';
        const modal = document.getElementById('modal-generico');
        document.getElementById('modal-titulo').innerText = 'Lucro por Venda';
        document.getElementById('modal-corpo').innerHTML = html;
        modal.style.display = 'flex';
    }

    function mostrarDetalhesCustoVendido() {
        const dados = window.app.dados;
        const utils = window.app.utils;
        let html = '<p><strong>Custo dos Produtos Vendidos por Venda:</strong></p><ul>';
        for (const mov of dados.movimentacoes) {
            if (mov.tipo === 'saida') {
                let custoVendido = 0;
                for (const item of mov.itens) {
                    const produto = dados.produtos.find(p => p.id === item.produtoId);
                    if (produto) custoVendido += item.quantidade * produto.custoUnitario;
                }
                html += `<li>${utils.formatarData(mov.data)} - Custo: ${utils.formatarMoeda(custoVendido)}</li>`;
            }
        }
        html += '</ul>';
        const modal = document.getElementById('modal-generico');
        document.getElementById('modal-titulo').innerText = 'Custo dos Produtos Vendidos';
        document.getElementById('modal-corpo').innerHTML = html;
        modal.style.display = 'flex';
    }

    return {
        renderizarControleEstoque
    };
})();