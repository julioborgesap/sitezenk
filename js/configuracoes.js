// ==================== configuracoes.js ====================
// Configurações do sistema: categorias, subcategorias, cores, tamanhos, tipos de gasto, motivos, backup

window.app.configuracoes = (function() {
    function renderizarConfiguracoes() {
        const container = document.getElementById('configuracoes');
        if (!container) return;

        const dados = window.app.dados;
        const utils = window.app.utils;

        let html = `
            <div class="config-aba">
                <h3><i class="fas fa-tags"></i> Categorias</h3>
                <div class="config-lista">
                    <div id="lista-categorias"></div>
                    <div class="form-config">
                        <input type="text" id="nova-categoria" placeholder="Nova categoria">
                        <button id="btn-add-categoria" class="btn-secundario">Adicionar</button>
                    </div>
                </div>
            </div>
            <div class="config-aba">
                <h3><i class="fas fa-layer-group"></i> Subcategorias</h3>
                <div class="config-lista">
                    <div id="lista-subcategorias"></div>
                    <div class="form-config">
                        <select id="subcategoria-categoria"></select>
                        <input type="text" id="nova-subcategoria" placeholder="Nova subcategoria">
                        <button id="btn-add-subcategoria" class="btn-secundario">Adicionar</button>
                    </div>
                </div>
            </div>
            <div class="config-aba">
                <h3><i class="fas fa-palette"></i> Cores</h3>
                <div class="config-lista">
                    <div id="lista-cores"></div>
                    <div class="form-config">
                        <input type="text" id="nova-cor" placeholder="Nova cor">
                        <button id="btn-add-cor" class="btn-secundario">Adicionar</button>
                    </div>
                </div>
            </div>
            <div class="config-aba">
                <h3><i class="fas fa-ruler"></i> Tamanhos</h3>
                <div class="config-lista">
                    <div id="lista-tamanhos"></div>
                    <div class="form-config">
                        <input type="text" id="novo-tamanho" placeholder="Novo tamanho">
                        <select id="tipo-tamanho">
                            <option value="letra">Letra (P, M, G)</option>
                            <option value="numero">Número (36-48)</option>
                        </select>
                        <button id="btn-add-tamanho" class="btn-secundario">Adicionar</button>
                    </div>
                </div>
            </div>
            <div class="config-aba">
                <h3><i class="fas fa-coins"></i> Tipos de Gasto</h3>
                <div class="config-lista">
                    <div id="lista-tipos-gasto"></div>
                    <div class="form-config">
                        <input type="text" id="novo-tipo-gasto" placeholder="Novo tipo de gasto">
                        <button id="btn-add-tipo-gasto" class="btn-secundario">Adicionar</button>
                    </div>
                </div>
            </div>
            <div class="config-aba">
                <h3><i class="fas fa-sign-out-alt"></i> Motivos de Saída</h3>
                <div class="config-lista">
                    <div id="lista-motivos-saida"></div>
                    <div class="form-config">
                        <input type="text" id="novo-motivo" placeholder="Novo motivo">
                        <button id="btn-add-motivo" class="btn-secundario">Adicionar</button>
                    </div>
                </div>
            </div>
            <div class="config-aba">
                <h3><i class="fas fa-database"></i> Backup e Restauração</h3>
                <div class="config-lista">
                    <div class="backup-actions">
                        <button id="btn-backup-json" class="btn-primario"><i class="fas fa-download"></i> Exportar Backup (JSON)</button>
                        <input type="file" id="restaurar-json" accept=".json" style="display: none;">
                        <button id="btn-restaurar" class="btn-secundario"><i class="fas fa-upload"></i> Restaurar Backup</button>
                        <button id="btn-limpar-dados" class="btn-perigo-grande"><i class="fas fa-trash-alt"></i> Limpar Todos os Dados</button>
                    </div>
                </div>
            </div>
            <div class="config-aba">
                <h3><i class="fas fa-chart-line"></i> Configurações Gerais</h3>
                <div class="config-lista">
                    <div class="form-config">
                        <label>Estoque Mínimo Padrão:</label>
                        <input type="number" id="estoque-minimo-padrao" value="${dados.configuracoes.estoqueMinimoPadrao}">
                        <button id="salvar-config-geral" class="btn-secundario">Salvar</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

        // Carregar listas
        carregarListas();

        // Eventos de adição
        document.getElementById('btn-add-categoria').addEventListener('click', () => adicionarItem('categorias', 'nova-categoria', 'nome'));
        document.getElementById('btn-add-subcategoria').addEventListener('click', () => adicionarSubcategoria());
        document.getElementById('btn-add-cor').addEventListener('click', () => adicionarItem('cores', 'nova-cor', 'nome'));
        document.getElementById('btn-add-tamanho').addEventListener('click', () => adicionarTamanho());
        document.getElementById('btn-add-tipo-gasto').addEventListener('click', () => adicionarItem('tiposGasto', 'novo-tipo-gasto', 'nome'));
        document.getElementById('btn-add-motivo').addEventListener('click', () => adicionarItem('motivosSaida', 'novo-motivo', 'nome'));

        // Backup e restauração
        document.getElementById('btn-backup-json').addEventListener('click', () => exportarBackup());
        document.getElementById('btn-restaurar').addEventListener('click', () => document.getElementById('restaurar-json').click());
        document.getElementById('restaurar-json').addEventListener('change', (e) => restaurarBackup(e.target.files[0]));
        document.getElementById('btn-limpar-dados').addEventListener('click', () => limparTodosDados());

        // Configurações gerais
        document.getElementById('salvar-config-geral').addEventListener('click', () => {
            dados.configuracoes.estoqueMinimoPadrao = parseInt(document.getElementById('estoque-minimo-padrao').value);
            window.app.salvarDados(dados);
            utils.mostrarNotificacao('Configurações gerais salvas.');
        });
    }

    function carregarListas() {
        const dados = window.app.dados;
        const utils = window.app.utils;

        // Categorias
        const listaCats = document.getElementById('lista-categorias');
        listaCats.innerHTML = dados.categorias.map(cat => `
            <div class="config-item" data-id="${cat.id}" data-tipo="categoria">
                <span>${cat.nome}</span>
                <div class="acoes">
                    <button class="btn-remover" data-id="${cat.id}" data-tipo="categoria"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Subcategorias
        const listaSubs = document.getElementById('lista-subcategorias');
        listaSubs.innerHTML = dados.subcategorias.map(sub => {
            const catNome = dados.categorias.find(c => c.id === sub.categoriaId)?.nome || '?';
            return `
                <div class="config-item" data-id="${sub.id}" data-tipo="subcategoria">
                    <span>${sub.nome} (${catNome})</span>
                    <div class="acoes">
                        <button class="btn-remover" data-id="${sub.id}" data-tipo="subcategoria"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }).join('');
        // Preencher select de categoria para subcategoria
        const selectCat = document.getElementById('subcategoria-categoria');
        selectCat.innerHTML = dados.categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');

        // Cores
        const listaCores = document.getElementById('lista-cores');
        listaCores.innerHTML = dados.cores.map(cor => `
            <div class="config-item" data-id="${cor.id}" data-tipo="cor">
                <span>${cor.nome}</span>
                <div class="acoes">
                    <button class="btn-remover" data-id="${cor.id}" data-tipo="cor"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Tamanhos
        const listaTamanhos = document.getElementById('lista-tamanhos');
        listaTamanhos.innerHTML = dados.tamanhos.map(tam => `
            <div class="config-item" data-id="${tam.id}" data-tipo="tamanho">
                <span>${tam.nome} (${tam.tipo === 'letra' ? 'Letra' : 'Número'})</span>
                <div class="acoes">
                    <button class="btn-remover" data-id="${tam.id}" data-tipo="tamanho"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Tipos de Gasto
        const listaTipos = document.getElementById('lista-tipos-gasto');
        listaTipos.innerHTML = dados.tiposGasto.map(t => `
            <div class="config-item" data-id="${t.id}" data-tipo="tipoGasto">
                <span>${t.nome}</span>
                <div class="acoes">
                    <button class="btn-remover" data-id="${t.id}" data-tipo="tipoGasto"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Motivos Saída
        const listaMotivos = document.getElementById('lista-motivos-saida');
        listaMotivos.innerHTML = dados.motivosSaida.map(m => `
            <div class="config-item" data-id="${m.id}" data-tipo="motivoSaida">
                <span>${m.nome}</span>
                <div class="acoes">
                    <button class="btn-remover" data-id="${m.id}" data-tipo="motivoSaida"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Adicionar eventos de remoção
        document.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const tipo = btn.dataset.tipo;
                removerItem(tipo, id);
            });
        });
    }

    function adicionarItem(colecao, inputId, campoNome) {
        const dados = window.app.dados;
        const utils = window.app.utils;
        const nome = document.getElementById(inputId).value.trim();
        if (!nome) {
            utils.mostrarNotificacao('Digite um nome.', 'erro');
            return;
        }
        const novoItem = { id: utils.gerarId(), [campoNome]: nome };
        dados[colecao].push(novoItem);
        window.app.salvarDados(dados);
        document.getElementById(inputId).value = '';
        carregarListas();
        utils.mostrarNotificacao('Item adicionado.');
    }

    function adicionarSubcategoria() {
        const dados = window.app.dados;
        const utils = window.app.utils;
        const categoriaId = parseInt(document.getElementById('subcategoria-categoria').value);
        const nome = document.getElementById('nova-subcategoria').value.trim();
        if (!categoriaId || !nome) {
            utils.mostrarNotificacao('Selecione uma categoria e digite o nome da subcategoria.', 'erro');
            return;
        }
        const novaSub = { id: utils.gerarId(), nome, categoriaId };
        dados.subcategorias.push(novaSub);
        window.app.salvarDados(dados);
        document.getElementById('nova-subcategoria').value = '';
        carregarListas();
        utils.mostrarNotificacao('Subcategoria adicionada.');
    }

    function adicionarTamanho() {
        const dados = window.app.dados;
        const utils = window.app.utils;
        const nome = document.getElementById('novo-tamanho').value.trim();
        const tipo = document.getElementById('tipo-tamanho').value;
        if (!nome) {
            utils.mostrarNotificacao('Digite o tamanho.', 'erro');
            return;
        }
        const novoTam = { id: utils.gerarId(), nome, tipo };
        dados.tamanhos.push(novoTam);
        window.app.salvarDados(dados);
        document.getElementById('novo-tamanho').value = '';
        carregarListas();
        utils.mostrarNotificacao('Tamanho adicionado.');
    }

    function removerItem(tipo, id) {
        const dados = window.app.dados;
        const utils = window.app.utils;
        // Verificar dependências antes de remover (evitar quebra)
        let podeRemover = true;
        let mensagemErro = '';
        switch (tipo) {
            case 'categoria':
                if (dados.produtos.some(p => p.categoriaId === id)) {
                    podeRemover = false;
                    mensagemErro = 'Existem produtos associados a esta categoria. Remova ou altere os produtos primeiro.';
                }
                if (dados.subcategorias.some(s => s.categoriaId === id)) {
                    podeRemover = false;
                    mensagemErro = 'Existem subcategorias associadas a esta categoria. Remova as subcategorias primeiro.';
                }
                break;
            case 'subcategoria':
                if (dados.produtos.some(p => p.subcategoriaId === id)) {
                    podeRemover = false;
                    mensagemErro = 'Existem produtos associados a esta subcategoria.';
                }
                break;
            case 'cor':
                if (dados.produtos.some(p => p.variacoes.some(v => v.corId === id))) {
                    podeRemover = false;
                    mensagemErro = 'Existem variações de produtos com esta cor.';
                }
                break;
            case 'tamanho':
                if (dados.produtos.some(p => p.variacoes.some(v => v.tamanhoId === id))) {
                    podeRemover = false;
                    mensagemErro = 'Existem variações de produtos com este tamanho.';
                }
                break;
            case 'tipoGasto':
                if (dados.gastosProducao.some(g => g.tipoGastoId === id)) {
                    podeRemover = false;
                    mensagemErro = 'Existem gastos registrados com este tipo.';
                }
                break;
            case 'motivoSaida':
                if (dados.movimentacoes.some(m => m.motivoSaidaId === id)) {
                    podeRemover = false;
                    mensagemErro = 'Existem movimentações com este motivo.';
                }
                break;
        }
        if (!podeRemover) {
            utils.mostrarNotificacao(mensagemErro, 'erro');
            return;
        }
        if (confirm(`Remover este ${tipo}?`)) {
            dados[tipo === 'categoria' ? 'categorias' :
                  tipo === 'subcategoria' ? 'subcategorias' :
                  tipo === 'cor' ? 'cores' :
                  tipo === 'tamanho' ? 'tamanhos' :
                  tipo === 'tipoGasto' ? 'tiposGasto' : 'motivosSaida'] = dados[tipo === 'categoria' ? 'categorias' :
                  tipo === 'subcategoria' ? 'subcategorias' :
                  tipo === 'cor' ? 'cores' :
                  tipo === 'tamanho' ? 'tamanhos' :
                  tipo === 'tipoGasto' ? 'tiposGasto' : 'motivosSaida'].filter(i => i.id !== id);
            window.app.salvarDados(dados);
            carregarListas();
            utils.mostrarNotificacao('Item removido.');
        }
    }

    function exportarBackup() {
        const dados = window.app.dados;
        const dataStr = JSON.stringify(dados, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_estoque_${new Date().toISOString().slice(0,19)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function restaurarBackup(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const dadosImportados = JSON.parse(e.target.result);
                // Validação básica
                if (!dadosImportados.versao || !dadosImportados.produtos || !dadosImportados.movimentacoes) {
                    throw new Error('Arquivo inválido');
                }
                window.app.dados = dadosImportados;
                window.app.salvarDados(window.app.dados);
                window.app.utils.mostrarNotificacao('Backup restaurado com sucesso. Recarregando a página...');
                setTimeout(() => location.reload(), 1500);
            } catch (err) {
                window.app.utils.mostrarNotificacao('Erro ao restaurar backup: arquivo inválido.', 'erro');
            }
        };
        reader.readAsText(file);
    }

    function limparTodosDados() {
        if (confirm('ATENÇÃO: Isso apagará todos os dados (produtos, movimentações, gastos, configurações). Deseja continuar?')) {
            // Reiniciar com dados padrão
            window.app.dados = {
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
                produtos: [],
                movimentacoes: [],
                gastosProducao: [],
                configuracoes: {
                    estoqueMinimoPadrao: 5
                }
            };
            // Adicionar produtos de exemplo
            const utils = window.app.utils;
            const produto1 = {
                id: utils.gerarId(),
                nome: "Camisa Gola Polo",
                categoriaId: 1,
                subcategoriaId: 1,
                precoVenda: 89.90,
                custoUnitario: 45.00,
                estoqueMinimo: 3,
                variacoes: [
                    { id: utils.gerarId(), corId: 1, tamanhoId: 2, quantidade: 10 },
                    { id: utils.gerarId(), corId: 2, tamanhoId: 2, quantidade: 8 }
                ]
            };
            const produto2 = {
                id: utils.gerarId(),
                nome: "Camiseta Peruana",
                categoriaId: 2,
                subcategoriaId: 3,
                precoVenda: 59.90,
                custoUnitario: 28.50,
                estoqueMinimo: 5,
                variacoes: [
                    { id: utils.gerarId(), corId: 1, tamanhoId: 1, quantidade: 15 },
                    { id: utils.gerarId(), corId: 1, tamanhoId: 2, quantidade: 20 },
                    { id: utils.gerarId(), corId: 3, tamanhoId: 2, quantidade: 12 }
                ]
            };
            window.app.dados.produtos = [produto1, produto2];
            window.app.salvarDados(window.app.dados);
            window.app.utils.mostrarNotificacao('Todos os dados foram limpos. Recarregando...');
            setTimeout(() => location.reload(), 1000);
        }
    }

    return {
        renderizarConfiguracoes
    };
})();