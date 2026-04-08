// ==================== produtos.js ====================
// CRUD de produtos, variações, validações

window.app.produtos = (function() {
    function renderizarProdutos() {
        const container = document.getElementById('produtos');
        if (!container) return;

        const dados = window.app.dados;
        const utils = window.app.utils;

        let html = `
            <div class="barra-ferramentas">
                <button class="btn-primario" id="btn-adicionar-produto"><i class="fas fa-plus"></i> Adicionar Produto</button>
                <div class="filtro-produtos">
                    <input type="text" id="filtro-produto" placeholder="Buscar produto..." autocomplete="off">
                    <select id="filtro-categoria">
                        <option value="">Todas categorias</option>
                        ${dados.categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="tabela-responsiva">
                <table id="tabela-produtos">
                    <thead>
                        <tr><th>Nome</th><th>Categoria</th><th>Subcategoria</th><th>Preço Venda</th><th>Custo Unitário</th><th>Estoque Total</th><th>Ações</th></tr>
                    </thead>
                    <tbody id="lista-produtos">
                    </tbody>
                </table>
            </div>
        `;
        container.innerHTML = html;

        // Preencher tabela com dados
        const tbody = document.getElementById('lista-produtos');
        const produtos = dados.produtos;
        for (const prod of produtos) {
            const totalEstoque = prod.variacoes.reduce((sum, v) => sum + v.quantidade, 0);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${prod.nome}</td>
                <td>${utils.getCategoriaNome(prod.categoriaId)}</td>
                <td>${utils.getSubcategoriaNome(prod.subcategoriaId)}</td>
                <td>${utils.formatarMoeda(prod.precoVenda)}</td>
                <td>${utils.formatarMoeda(prod.custoUnitario)}</td>
                <td>${totalEstoque}</td>
                <td>
                    <button class="acao-botao ver" data-id="${prod.id}" title="Ver"><i class="fas fa-eye"></i></button>
                    <button class="acao-botao editar" data-id="${prod.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="acao-botao excluir" data-id="${prod.id}" title="Excluir"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        }

        // Adicionar eventos de filtro
        document.getElementById('filtro-produto').addEventListener('input', filtrarProdutos);
        document.getElementById('filtro-categoria').addEventListener('change', filtrarProdutos);

        // Botão adicionar
        document.getElementById('btn-adicionar-produto').addEventListener('click', () => abrirModalProduto());

        // Eventos delegados para ações
        document.getElementById('tabela-produtos').addEventListener('click', (e) => {
            const btn = e.target.closest('.acao-botao');
            if (!btn) return;
            const id = parseInt(btn.getAttribute('data-id'));
            if (btn.classList.contains('ver')) {
                visualizarProduto(id);
            } else if (btn.classList.contains('editar')) {
                editarProduto(id);
            } else if (btn.classList.contains('excluir')) {
                excluirProduto(id);
            }
        });
    }

    function filtrarProdutos() {
        const filtroNome = document.getElementById('filtro-produto').value.toLowerCase();
        const filtroCategoria = document.getElementById('filtro-categoria').value;
        const rows = document.querySelectorAll('#lista-produtos tr');
        for (const row of rows) {
            const nome = row.cells[0].innerText.toLowerCase();
            const categoriaId = parseInt(row.cells[1].getAttribute('data-categoria-id') || window.app.dados.produtos.find(p => p.nome === row.cells[0].innerText)?.categoriaId);
            // melhor seria obter categoriaId do produto, mas simplificamos:
            // recalculamos por dados
            const prod = window.app.dados.produtos.find(p => p.nome === row.cells[0].innerText);
            if (!prod) continue;
            const matchNome = nome.includes(filtroNome);
            const matchCat = !filtroCategoria || prod.categoriaId == filtroCategoria;
            row.style.display = (matchNome && matchCat) ? '' : 'none';
        }
    }

    function abrirModalProduto(produto = null) {
        const modal = document.getElementById('modal-generico');
        const modalTitulo = document.getElementById('modal-titulo');
        const modalCorpo = document.getElementById('modal-corpo');
        const dados = window.app.dados;
        const utils = window.app.utils;

        // Preparar formulário
        let html = `
            <form id="form-produto" class="form-produto">
                <div class="grupo-form">
                    <label>Nome do Produto *</label>
                    <input type="text" name="nome" required value="${produto ? produto.nome : ''}">
                </div>
                <div class="grupo-form">
                    <label>Categoria *</label>
                    <select name="categoriaId" id="categoriaSelect" required>
                        <option value="">Selecione</option>
                        ${dados.categorias.map(c => `<option value="${c.id}" ${produto && produto.categoriaId === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
                    </select>
                </div>
                <div class="grupo-form">
                    <label>Subcategoria *</label>
                    <select name="subcategoriaId" id="subcategoriaSelect" required>
                        <option value="">Selecione primeiro a categoria</option>
                    </select>
                </div>
                <div class="grupo-form">
                    <label>Preço de Venda (R$) *</label>
                    <input type="number" step="0.01" name="precoVenda" required value="${produto ? produto.precoVenda : ''}">
                </div>
                <div class="grupo-form">
                    <label>Custo Unitário (R$) *</label>
                    <input type="number" step="0.01" name="custoUnitario" required value="${produto ? produto.custoUnitario : ''}">
                </div>
                <div class="grupo-form">
                    <label>Estoque Mínimo *</label>
                    <input type="number" name="estoqueMinimo" required value="${produto ? produto.estoqueMinimo : dados.configuracoes.estoqueMinimoPadrao}">
                </div>
                <div class="variacoes-area">
                    <label>Variações (Cor/Tamanho)</label>
                    <div id="lista-variacoes">
                        ${produto ? produto.variacoes.map((v, idx) => `
                            <div class="variacao-item" data-idx="${idx}">
                                <select name="corId" required>
                                    <option value="">Cor</option>
                                    ${dados.cores.map(c => `<option value="${c.id}" ${v.corId === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
                                </select>
                                <select name="tamanhoId" required>
                                    <option value="">Tamanho</option>
                                    ${dados.tamanhos.map(t => `<option value="${t.id}" ${v.tamanhoId === t.id ? 'selected' : ''}>${t.nome}</option>`).join('')}
                                </select>
                                <input type="number" name="quantidade" placeholder="Quantidade" required value="${v.quantidade}">
                                <button type="button" class="btn-remover-variacao">X</button>
                            </div>
                        `).join('') : ''}
                    </div>
                    <button type="button" id="btn-adicionar-variacao" class="btn-adicionar-variacao">+ Adicionar Variação</button>
                </div>
                <div class="modal-footer" style="margin-top: 20px;">
                    <button type="submit" class="btn-primario">Salvar</button>
                    <button type="button" class="btn-fechar-modal">Cancelar</button>
                </div>
            </form>
        `;
        modalTitulo.innerText = produto ? 'Editar Produto' : 'Novo Produto';
        modalCorpo.innerHTML = html;
        modal.style.display = 'flex';

        // Atualizar subcategorias conforme categoria selecionada
        const categoriaSelect = document.getElementById('categoriaSelect');
        const subcategoriaSelect = document.getElementById('subcategoriaSelect');
        function atualizarSubcategorias() {
            const catId = parseInt(categoriaSelect.value);
            const subcategoriasFiltradas = dados.subcategorias.filter(s => s.categoriaId === catId);
            subcategoriaSelect.innerHTML = '<option value="">Selecione</option>' + subcategoriasFiltradas.map(s => `<option value="${s.id}" ${produto && produto.subcategoriaId === s.id ? 'selected' : ''}>${s.nome}</option>`).join('');
            subcategoriaSelect.disabled = subcategoriasFiltradas.length === 0;
        }
        categoriaSelect.addEventListener('change', atualizarSubcategorias);
        if (produto) atualizarSubcategorias(); else subcategoriaSelect.disabled = true;

        // Adicionar variação dinamicamente
        const btnAddVariacao = document.getElementById('btn-adicionar-variacao');
        const listaVariacoes = document.getElementById('lista-variacoes');
        btnAddVariacao.addEventListener('click', () => {
            const idx = listaVariacoes.children.length;
            const div = document.createElement('div');
            div.className = 'variacao-item';
            div.setAttribute('data-idx', idx);
            div.innerHTML = `
                <select name="corId" required><option value="">Cor</option>${dados.cores.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}</select>
                <select name="tamanhoId" required><option value="">Tamanho</option>${dados.tamanhos.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}</select>
                <input type="number" name="quantidade" placeholder="Quantidade" required value="0">
                <button type="button" class="btn-remover-variacao">X</button>
            `;
            listaVariacoes.appendChild(div);
            // Evento de remover
            div.querySelector('.btn-remover-variacao').addEventListener('click', () => div.remove());
        });

        // Adicionar eventos de remoção para variações existentes
        document.querySelectorAll('.variacao-item .btn-remover-variacao').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.variacao-item').remove();
            });
        });

        // Submissão do formulário
        const form = document.getElementById('form-produto');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const nome = formData.get('nome');
            const categoriaId = parseInt(formData.get('categoriaId'));
            const subcategoriaId = parseInt(formData.get('subcategoriaId'));
            const precoVenda = parseFloat(formData.get('precoVenda'));
            const custoUnitario = parseFloat(formData.get('custoUnitario'));
            const estoqueMinimo = parseInt(formData.get('estoqueMinimo'));

            if (!nome || !categoriaId || !subcategoriaId || isNaN(precoVenda) || isNaN(custoUnitario) || isNaN(estoqueMinimo)) {
                utils.mostrarNotificacao('Preencha todos os campos obrigatórios.', 'erro');
                return;
            }

            // Coletar variações
            const variacoes = [];
            const variacaoDivs = document.querySelectorAll('#lista-variacoes .variacao-item');
            for (let div of variacaoDivs) {
                const corId = parseInt(div.querySelector('[name="corId"]').value);
                const tamanhoId = parseInt(div.querySelector('[name="tamanhoId"]').value);
                const quantidade = parseInt(div.querySelector('[name="quantidade"]').value);
                if (isNaN(corId) || isNaN(tamanhoId) || isNaN(quantidade)) {
                    utils.mostrarNotificacao('Preencha todas as variações corretamente.', 'erro');
                    return;
                }
                variacoes.push({
                    id: utils.gerarId(),
                    corId,
                    tamanhoId,
                    quantidade
                });
            }
            if (variacoes.length === 0) {
                utils.mostrarNotificacao('Adicione pelo menos uma variação.', 'erro');
                return;
            }

            if (produto) {
                // Editar produto existente
                produto.nome = nome;
                produto.categoriaId = categoriaId;
                produto.subcategoriaId = subcategoriaId;
                produto.precoVenda = precoVenda;
                produto.custoUnitario = custoUnitario;
                produto.estoqueMinimo = estoqueMinimo;
                produto.variacoes = variacoes;
                window.app.atualizarDados({ produtos: window.app.dados.produtos });
                utils.mostrarNotificacao('Produto atualizado com sucesso.');
            } else {
                // Novo produto
                const novoProduto = {
                    id: utils.gerarId(),
                    nome,
                    categoriaId,
                    subcategoriaId,
                    precoVenda,
                    custoUnitario,
                    estoqueMinimo,
                    variacoes
                };
                window.app.dados.produtos.push(novoProduto);
                window.app.salvarDados(window.app.dados);
                utils.mostrarNotificacao('Produto adicionado com sucesso.');
            }
            modal.style.display = 'none';
            renderizarProdutos(); // recarregar tabela
        });

        // Fechar modal
        document.querySelectorAll('.modal-fechar, .btn-fechar-modal').forEach(el => {
            el.addEventListener('click', () => modal.style.display = 'none');
        });
    }

    function visualizarProduto(id) {
        const produto = window.app.dados.produtos.find(p => p.id === id);
        if (!produto) return;
        const utils = window.app.utils;
        let html = `
            <p><strong>Nome:</strong> ${produto.nome}</p>
            <p><strong>Categoria:</strong> ${utils.getCategoriaNome(produto.categoriaId)}</p>
            <p><strong>Subcategoria:</strong> ${utils.getSubcategoriaNome(produto.subcategoriaId)}</p>
            <p><strong>Preço Venda:</strong> ${utils.formatarMoeda(produto.precoVenda)}</p>
            <p><strong>Custo Unitário:</strong> ${utils.formatarMoeda(produto.custoUnitario)}</p>
            <p><strong>Estoque Mínimo:</strong> ${produto.estoqueMinimo}</p>
            <p><strong>Variações:</strong></p>
            <ul>
        `;
        for (const v of produto.variacoes) {
            html += `<li>${utils.getCorNome(v.corId)} / ${utils.getTamanhoNome(v.tamanhoId)} - Quantidade: ${v.quantidade}</li>`;
        }
        html += `</ul>`;
        const modal = document.getElementById('modal-generico');
        document.getElementById('modal-titulo').innerText = `Detalhes do Produto`;
        document.getElementById('modal-corpo').innerHTML = html;
        modal.style.display = 'flex';
    }

    function editarProduto(id) {
        const produto = window.app.dados.produtos.find(p => p.id === id);
        if (produto) abrirModalProduto(produto);
    }

    function excluirProduto(id) {
        if (confirm('Tem certeza que deseja excluir este produto? Todas as variações e movimentações associadas serão perdidas.')) {
            window.app.dados.produtos = window.app.dados.produtos.filter(p => p.id !== id);
            // Remover movimentações que referenciam este produto? Por consistência, removemos também.
            window.app.dados.movimentacoes = window.app.dados.movimentacoes.filter(m => !m.itens.some(i => i.produtoId === id));
            window.app.salvarDados(window.app.dados);
            utils.mostrarNotificacao('Produto excluído.');
            renderizarProdutos();
        }
    }

    return {
        renderizarProdutos
    };
})();