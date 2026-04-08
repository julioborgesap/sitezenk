// ==================== main.js ====================
// Inicialização da aplicação, troca de abas, eventos globais

document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados já estão no namespace

    // Configurar eventos de navegação por abas
    const abas = document.querySelectorAll('.nav-tabs li');
    const conteudos = document.querySelectorAll('.aba-conteudo');

    function ativarAba(idAba) {
        // Atualizar abas no menu
        abas.forEach(aba => {
            if (aba.getAttribute('data-tab') === idAba) {
                aba.classList.add('active');
            } else {
                aba.classList.remove('active');
            }
        });
        // Atualizar conteúdos
        conteudos.forEach(conteudo => {
            if (conteudo.id === idAba) {
                conteudo.classList.add('active');
            } else {
                conteudo.classList.remove('active');
            }
        });
        // Recarregar conteúdo da aba conforme necessário
        switch (idAba) {
            case 'dashboard':
                if (window.app.dashboard) window.app.dashboard.renderizarDashboard();
                break;
            case 'produtos':
                if (window.app.produtos) window.app.produtos.renderizarProdutos();
                break;
            case 'controle-estoque':
                if (window.app.controleEstoque) window.app.controleEstoque.renderizarControleEstoque();
                break;
            case 'gastos-producao':
                if (window.app.gastosProducao) window.app.gastosProducao.renderizarGastos();
                break;
            case 'configuracoes':
                if (window.app.configuracoes) window.app.configuracoes.renderizarConfiguracoes();
                break;
        }
    }

    abas.forEach(aba => {
        aba.addEventListener('click', (e) => {
            const idAba = aba.getAttribute('data-tab');
            ativarAba(idAba);
            // Fechar menu lateral em mobile
            if (window.innerWidth <= 768) {
                document.getElementById('menu-lateral').classList.remove('aberto');
            }
        });
        // ===== Fechamento do modal =====
        const modalGenerico = document.getElementById('modal-generico');
        const fecharModal = () => {
            modalGenerico.style.display = 'none';
        };

        // Botões de fechar (X e botão "Fechar")
        const modalCloseBtn = modalGenerico.querySelector('.modal-fechar');
        const modalFooterBtn = modalGenerico.querySelector('.btn-fechar-modal');
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', fecharModal);
        if (modalFooterBtn) modalFooterBtn.addEventListener('click', fecharModal);

        // Tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalGenerico.style.display === 'flex') {
                fecharModal();
            }
        });
    });


    // Menu hambúrguer
    const btnMenu = document.getElementById('menu-hamburguer');
    const menuLateral = document.getElementById('menu-lateral');
    btnMenu.addEventListener('click', () => {
        menuLateral.classList.toggle('aberto');
    });
    // Fechar menu ao clicar fora (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !menuLateral.contains(e.target) && !btnMenu.contains(e.target)) {
            menuLateral.classList.remove('aberto');
        }
    });

    // Botões de exportação (chamam funções de exports.js)
    document.getElementById('exportar-excel').addEventListener('click', () => {
        if (window.app.exports) window.app.exports.exportarExcel();
    });
    document.getElementById('exportar-json').addEventListener('click', () => {
        if (window.app.exports) window.app.exports.exportarJSON();
    });

    // ===== Fechamento do modal =====
    const modalGenerico = document.getElementById('modal-generico');
    const fecharModal = () => {
        modalGenerico.style.display = 'none';
    };

    const modalCloseBtn = modalGenerico.querySelector('.modal-fechar');
    const modalFooterBtn = modalGenerico.querySelector('.btn-fechar-modal');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', fecharModal);
    if (modalFooterBtn) modalFooterBtn.addEventListener('click', fecharModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalGenerico.style.display === 'flex') {
            fecharModal();
        }
    });

    // Inicializar primeira aba (dashboard)
    ativarAba('dashboard');

    // Evento para quando dados são atualizados (recarregar aba ativa)
    document.addEventListener('dadosAtualizados', () => {
        const abaAtiva = document.querySelector('.nav-tabs li.active').getAttribute('data-tab');
        ativarAba(abaAtiva);
    });
});