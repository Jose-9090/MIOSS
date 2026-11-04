       function handleLogin() {
            document.getElementById('login-view').style.display = 'none';
            document.getElementById('app-layout').style.display = 'grid';
            registrarAtividade('Sessão iniciada', 'Login realizado no painel como ' + atividadeState.usuario + '.', 'Sistema');
        }

        function logout() {
            document.getElementById('app-layout').style.display = 'none';
            document.getElementById('login-view').style.display = 'grid';
            registrarAtividade('Sessão encerrada', 'Logout realizado por ' + atividadeState.usuario + '.', 'Sistema');
        }

        function switchTab(viewId) {
            // Esconde todas as views
            const views = document.querySelectorAll('.view-panel');
            views.forEach(v => v.classList.remove('active'));

            // Remove classe active do menu
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(n => n.classList.remove('active'));
            // Cockpit é detalhamento de Campanhas: o item pai permanece ativo.
            const navPai = { 'cockpit': 'campanhas' };
            const navView = navPai[viewId] || viewId;
            const navAtivo = document.querySelector('.nav-item[data-view="' + navView + '"]');
            if (navAtivo) navAtivo.classList.add('active');

            // Mostra a view selecionada
            const targetView = document.getElementById('view-' + viewId);
            if (targetView) {
                targetView.classList.add('active');
            }

            // Atualiza Breadcrumb e Título
            const titles = {
                'dashboard': 'Centro de operações',
                'sala-diretor': 'Diretoria',
                'digital-twin': 'Digital twin',
                'campanhas': 'Campanhas',
                'cockpit': 'Cockpit da campanha',
                'simulador': 'Simulador',
                'timeline': 'Timeline',
                'copilot': 'Copilot',
                'analytics': 'Analytics',
                'knowledge-graph': 'Grafo de relacionamentos',
                'mapa': 'Cobertura Piauí',
                'alertas': 'Alertas',
                'equipes': 'Equipes',
                'logs': 'Logs de auditoria',
                'configuracoes': 'Configurações'
            };

            gerenciarAtualizacaoDashboard(viewId === 'dashboard');
            gerenciarAtualizacaoTimeline(viewId === 'timeline');
            gerenciarAtualizacaoCopilot(viewId === 'copilot');

            if (titles[viewId]) {
                const crumb = viewId === 'cockpit' ? 'Campanhas / Cockpit' : titles[viewId];
                document.getElementById('header-page-title').innerText = titles[viewId];
                document.getElementById('breadcrumb-current').innerText = crumb;
                if (viewId !== 'timeline') {
                    registrarAtividade('Acesso ao módulo: ' + titles[viewId], 'Visualização registrada na linha do tempo operacional.', 'Navegação');
                }
            }
        }

        // REGISTRO DE ATIVIDADES - LINHA DO TEMPO EM TEMPO REAL
        const ATIVIDADES_KEY = 'virtex_atividades_v1';
        const LIMITE_ATIVIDADES = 50;

        const atividadeState = {
            itens: [],
            timer: null,
            usuario: 'diretoria@virtex.com.br',
            parametros: {},
            sementeFeita: false
        };

        function escaparHtml(texto) {
            return String(texto == null ? '' : texto)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        function salvarAtividades() {
            try {
                localStorage.setItem(ATIVIDADES_KEY, JSON.stringify(atividadeState.itens));
            } catch (e) { /* storage indisponivel: segue apenas em memoria */ }
        }

        function semearAtividades() {
            if (atividadeState.itens.length || atividadeState.sementeFeita) return;
            const hoje = new Date();
            const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
            registrarAtividade('Lançamento da Campanha Fibra 1Gbps em Picos', 'Ativação de mídia paga no Facebook, Instagram e outdoors na Av. Getúlio Vargas.', 'Campanhas', inicioHoje + 14 * 3600000 + 30 * 60000, true);
            registrarAtividade('Aprovação de Kit de Patrocínio Feira Tech Teresina', 'Contrato assinado pelo setor financeiro.', 'Campanhas', inicioHoje - 24 * 3600000 + 9 * 3600000 + 15 * 60000, true);
            registrarAtividade('Otimização de palavra-chave no Google Ads Sync', 'Ajustes de lances em Picos e Teresina.', 'Mídia', inicioHoje - 24 * 3600000 + 11 * 3600000 + 15 * 60000, true);
        }

        function carregarAtividades() {
            let bruto = null;
            try {
                bruto = localStorage.getItem(ATIVIDADES_KEY);
            } catch (e) {
                return;
            }
            if (!bruto) return;

            try {
                const lista = JSON.parse(bruto);
                if (!Array.isArray(lista)) return;
                atividadeState.itens = lista.filter(i => i && typeof i.ts === 'number' && isFinite(i.ts) && typeof i.titulo === 'string')
                    .slice(0, LIMITE_ATIVIDADES)
                    .map(i => ({
                        ts: i.ts,
                        titulo: i.titulo,
                        detalhe: typeof i.detalhe === 'string' ? i.detalhe : '',
                        modulo: typeof i.modulo === 'string' ? i.modulo : 'Sistema'
                    }));
                atividadeState.sementeFeita = true;
            } catch (e) { /* historico corrompido: recomeca do zero */ }
        }

        function registrarAtividade(titulo, detalhe, modulo, ts, semRender) {
            atividadeState.itens.unshift({
                ts: typeof ts === 'number' ? ts : Date.now(),
                titulo: titulo,
                detalhe: detalhe || '',
                modulo: modulo || 'Sistema'
            });
            if (atividadeState.itens.length > LIMITE_ATIVIDADES) {
                atividadeState.itens.length = LIMITE_ATIVIDADES;
            }
            salvarAtividades();
            if (!semRender) renderTimeline();
        }

        function dataCurta(d) {
            return d.toLocaleDateString('pt-BR');
        }

        function tempoRelativo(ts) {
            const seg = Math.max(0, Math.round((Date.now() - ts) / 1000));
            if (seg < 10) return 'agora mesmo';
            if (seg < 60) return 'há ' + seg + ' segundos';
            const min = Math.round(seg / 60);
            if (min < 60) return 'há ' + min + (min === 1 ? ' minuto' : ' minutos');
            const hora = Math.round(min / 60);
            if (hora < 24) return 'há ' + hora + (hora === 1 ? ' hora' : ' horas');
            const dia = Math.round(hora / 24);
            return 'há ' + dia + (dia === 1 ? ' dia' : ' dias');
        }

        function rotuloData(ts) {
            const d = new Date(ts);
            const hoje = new Date();
            const ontem = new Date();
            ontem.setDate(hoje.getDate() - 1);
            const mesmoDia = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
            const hora = d.toLocaleTimeString('pt-BR');
            if (mesmoDia(d, hoje)) return 'Hoje, ' + hora;
            if (mesmoDia(d, ontem)) return 'Ontem, ' + hora;
            return dataCurta(d) + ' ' + hora;
        }

        function renderTimeline() {
            const lista = document.getElementById('timeline-lista');
            if (!lista) return;

            if (!atividadeState.itens.length) {
                lista.innerHTML = '<p class="empty">Nenhuma ação registrada ainda.</p>';
            } else {
                lista.innerHTML = atividadeState.itens.map(item =>
                    '<article class="timeline-item">' +
                        '<p class="timeline-when"><span>' + escaparHtml(rotuloData(item.ts)) + '</span>' +
                        '<span>' + escaparHtml(tempoRelativo(item.ts)) + '</span></p>' +
                        '<p class="timeline-title">' + escaparHtml(item.titulo) + '</p>' +
                        (item.detalhe ? '<p class="timeline-detail">' + escaparHtml(item.detalhe) + '</p>' : '') +
                        '<span class="timeline-module">' + escaparHtml(item.modulo) + '</span>' +
                    '</article>'
                ).join('');
            }

            const contador = document.getElementById('timeline-contador');
            if (contador) contador.innerText = atividadeState.itens.length;

            const relogio = document.getElementById('timeline-relogio');
            if (relogio) relogio.innerText = new Date().toLocaleTimeString('pt-BR');

            renderLogsAuditoria();
        }

        function renderLogsAuditoria() {
            const corpo = document.getElementById('logs-tbody');
            if (!corpo) return;
            if (!atividadeState.itens.length) {
                corpo.innerHTML = '<tr><td colspan="4" class="empty">Nenhum registro de auditoria.</td></tr>';
                return;
            }
            corpo.innerHTML = atividadeState.itens.slice(0, 25).map(item =>
                '<tr><td class="num">' + escaparHtml(rotuloData(item.ts)) + '</td>' +
                '<td>' + escaparHtml(atividadeState.usuario) + '</td>' +
                '<td>' + escaparHtml(item.titulo) + (item.detalhe ? ' - ' + escaparHtml(item.detalhe) : '') + '</td>' +
                '<td>' + escaparHtml(item.modulo) + '</td></tr>'
            ).join('');
        }

        function gerenciarAtualizacaoTimeline(ativo) {
            if (atividadeState.timer) {
                clearInterval(atividadeState.timer);
                atividadeState.timer = null;
            }
            if (ativo) {
                renderTimeline();
                atividadeState.timer = setInterval(renderTimeline, 15000);
            }
        }

        function limparTimeline() {
            atividadeState.itens = [];
            salvarAtividades();
            renderTimeline();
        }

        // Registro de alteracoes de parametro do Simulador IA
        function registrarParametroSim(nome) {
            const estado = {
                'Investimento Planejado': 'sim-budget',
                'Cidade Alvo': 'sim-cidade',
                'Distribuição Meta vs Google': 'sim-split',
                'Objetivo Principal': 'sim-objetivo',
                'Público-Alvo': 'sim-publico',
                'Duração da Campanha': 'sim-duracao',
                'Nível de Criativo': 'sim-criativo'
            };
            const id = estado[nome];
            if (!id) return;

            const el = document.getElementById(id);
            if (!el) return;

            let valor = el.value;
            if (id === 'sim-budget') valor = 'R$ ' + parseInt(valor).toLocaleString('pt-BR');
            else if (id === 'sim-split') valor = valor + '% Meta / ' + (100 - parseInt(valor)) + '% Google';
            else if (id === 'sim-duracao') valor = valor + (parseInt(valor) === 1 ? ' semana' : ' semanas');
            else if (id === 'sim-criativo') valor = 'Nível ' + valor;
            else {
                const sel = el.selectedIndex;
                const opcao = el.options && el.options[sel];
                valor = opcao && opcao.text ? opcao.text : el.value;
            }

            const anterior = atividadeState.parametros[nome];
            atividadeState.parametros[nome] = valor;

            const anteriorTexto = anterior != null ? anterior : 'valor inicial';
            const mudou = anterior != null && anterior !== valor;

            registrarAtividade(
                'Parâmetro alterado: ' + nome,
                (mudou ? 'De "' + anteriorTexto + '" para "' + valor + '".' : 'Valor definido em "' + valor + '".') +
                ' Resultado projetado: ROI ' + document.getElementById('sim-res-roi').innerText +
                ', ' + document.getElementById('sim-res-leads').innerText + ' leads.',
                'Simulador');
        }

        // ATUALIZACAO AUTOMATICA - SOMENTE CENTRO DE OPERACOES
        const CHART_DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const STORAGE_KEY = 'virtex_dashboard_v1';
        const LIMITES = { roi: [3.2, 9.5], leads: 250000, investimento: 5000000, cac: [28, 70], barra: [6, 99] };

        const dashboardState = {
            timer: null,
            roi: 6.84,
            leads: 4290,
            investimento: 184500,
            cac: 43.00,
            metas: [40, 65, 50, 85, 95, 70, 30],
            barras: [40, 65, 50, 85, 95, 70, 30],
            diaAtual: null,
            registrado: false,
            pico: 4
        };

        const FEED_MODELO = [
            { texto: '<strong>Campanha Picos 1Gbps</strong> atingiu nova cota diária de leads no Meta Ads.' },
            { texto: '<strong>CPM em Teresina</strong> oscilou no Google Ads. Otimização sugerida.' },
            { texto: '<strong>Evento Parnaíba Tech</strong> teve material gráfico liberado pelo Almoxarifado.' },
            { texto: '<strong>Expansão Teresina Sul</strong> subiu posição no ranking regional de adesões.' },
            { texto: '<strong>Equipe de campo Picos</strong> registrou 42 novos contratos na fibra.' }
        ];

        const brl = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
        const jitter = (v, pct) => v * (1 + (Math.random() * 2 - 1) * pct);
        const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

        // PERSISTENCIA DO ESTADO DO CENTRO DE OPERACOES
        function salvarEstadoDashboard() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    barras: dashboardState.barras,
                    metas: dashboardState.metas,
                    diaAtual: dashboardState.diaAtual,
                    roi: dashboardState.roi,
                    leads: dashboardState.leads,
                    investimento: dashboardState.investimento,
                    cac: dashboardState.cac,
                    ts: Date.now()
                }));
            } catch (e) { /* storage indisponivel: segue apenas em memoria */ }
        }

        function carregarEstadoDashboard() {
            let bruto = null;
            try {
                bruto = localStorage.getItem(STORAGE_KEY);
            } catch (e) {
                return;
            }
            if (!bruto) return;

            try {
                const s = JSON.parse(bruto);
                const numeros = v => Array.isArray(v) && v.length === 7 && v.every(n => typeof n === 'number' && isFinite(n));

                if (numeros(s.barras)) dashboardState.barras = s.barras.map(n => clamp(n, LIMITES.barra[0], LIMITES.barra[1]));
                if (numeros(s.metas)) dashboardState.metas = s.metas.map(n => clamp(n, LIMITES.barra[0], LIMITES.barra[1]));
                if (typeof s.diaAtual === 'number' && s.diaAtual >= 0 && s.diaAtual <= 6) dashboardState.diaAtual = s.diaAtual;

                if (typeof s.roi === 'number' && isFinite(s.roi)) dashboardState.roi = clamp(s.roi, LIMITES.roi[0], LIMITES.roi[1]);
                if (typeof s.leads === 'number' && isFinite(s.leads)) dashboardState.leads = clamp(s.leads, 0, LIMITES.leads);
                if (typeof s.investimento === 'number' && isFinite(s.investimento)) dashboardState.investimento = clamp(s.investimento, 0, LIMITES.investimento);
                if (typeof s.cac === 'number' && isFinite(s.cac)) dashboardState.cac = clamp(s.cac, LIMITES.cac[0], LIMITES.cac[1]);
            } catch (e) { /* dado corrompido: mantem os valores padrao */ }
        }

        function gerenciarAtualizacaoDashboard(ativo) {
            if (dashboardState.timer) {
                clearInterval(dashboardState.timer);
                dashboardState.timer = null;
            }
            if (ativo) {
                atualizarDashboard();
                dashboardState.timer = setInterval(atualizarDashboard, 4000);
                if (!dashboardState.registrado) {
                    dashboardState.registrado = true;
                    registrarAtividade('Monitoramento do Centro de Operações ativado', 'Atualização automática a cada 4s; gráfico movimentando apenas ' + CHART_DIAS[diaDaSemana()] + '.', 'Centro de Operações');
                }
            }
        }

        function atualizarDashboard() {
            // KPIs
            dashboardState.roi = clamp(jitter(dashboardState.roi, 0.03), LIMITES.roi[0], LIMITES.roi[1]);
            dashboardState.leads = clamp(dashboardState.leads + Math.round(Math.random() * 14), 0, LIMITES.leads);
            dashboardState.investimento = clamp(dashboardState.investimento + Math.round(Math.random() * 900), 0, LIMITES.investimento);
            dashboardState.cac = clamp(jitter(dashboardState.cac, 0.05), LIMITES.cac[0], LIMITES.cac[1]);

            const set = (id, valor) => {
                const el = document.getElementById(id);
                if (el) el.innerText = valor;
            };

            set('kpi-roi', dashboardState.roi.toFixed(2).replace('.', ',') + 'x');
            const deltaRoi = dashboardState.roi - 6.5;
            set('kpi-roi-trend', (deltaRoi >= 0 ? '+' : '') + deltaRoi.toFixed(1).replace('.', ',') + '%');
            set('kpi-investimento', brl(dashboardState.investimento));
            set('kpi-leads', dashboardState.leads.toLocaleString('pt-BR'));
            set('kpi-cac', 'R$ ' + dashboardState.cac.toFixed(2).replace('.', ','));

            // Grafico: somente a barra do dia corrente se movimenta
            atualizarGraficoDia();

            // ROIs das campanhas
            document.querySelectorAll('#view-dashboard .roi-cell').forEach(el => {
                const atual = parseFloat(el.innerText.replace('x', '').replace(',', '.'));
                if (!isNaN(atual)) el.innerText = Math.min(9.9, Math.max(2.0, jitter(atual, 0.04))).toFixed(1).replace('.', ',') + 'x';
            });

            // Live feed
            dashboardState.pico = (dashboardState.pico + 1) % FEED_MODELO.length;
            const item = FEED_MODELO[dashboardState.pico];
            const feed = document.getElementById('live-feed');
            if (feed) {
                const linha = feed.firstElementChild;
                const corpo = linha ? linha.querySelector('.event-body') : null;
                if (corpo) {
                    corpo.innerHTML = '<span class="event-time">Agora</span><p>' + item.texto + '</p>';
                }
            }

            // Timestamp
            set('dashboard-last-update', new Date().toLocaleTimeString('pt-BR'));

            // Persistencia para sobreviver ao recarregamento
            salvarEstadoDashboard();
        }

        // Grafico semanal: apenas o dia de hoje recebe atualizacao
        function diaDaSemana() {
            return (new Date().getDay() + 6) % 7;
        }

        function atualizarGraficoDia() {
            const barras = document.querySelectorAll('#chart-perf .chart-bar');
            if (!barras.length) return;

            const idx = diaDaSemana();

            // Na virada de dia o dia anterior fecha no valor em que parou
            if (dashboardState.diaAtual !== idx) {
                dashboardState.diaAtual = idx;
                dashboardState.metas[idx] = dashboardState.barras[idx];
            }

            // Caminhada aleatoria do dia corrente em torno da meta do dia
            const meta = dashboardState.metas[idx];
            let valor = dashboardState.barras[idx];
            valor += (meta - valor) * 0.2 + (Math.random() * 2 - 1) * 7;
            dashboardState.barras[idx] = Math.min(99, Math.max(6, valor));

            barras.forEach((barra, i) => {
                const ativo = i === idx;
                barra.style.height = dashboardState.barras[i].toFixed(1) + '%';
                barra.classList.toggle('is-today', ativo);
            });

            document.querySelectorAll('#chart-perf .chart-bar-group').forEach((grupo, i) => {
                const label = grupo.querySelector('.chart-label');
                if (!label) return;
                label.textContent = CHART_DIAS[i];
                label.classList.toggle('is-today', i === idx);
            });

            const diaEl = document.getElementById('dashboard-chart-day');
            if (diaEl) diaEl.innerText = CHART_DIAS[idx];
        }

        // SIMULADOR IA - MODELO DE PROJECAO
        // mercado: leads enderecaveis no mes | saturacao: investimento que esgota ~63% do mercado
        const SIM_CIDADES = {
            'picos': { nome: 'Picos - PI', mercado: 9000, saturacao: 300000, conv: 0.21, ticket: 1150, concorrencia: 1.15 },
            'teresina': { nome: 'Teresina - PI', mercado: 26000, saturacao: 1100000, conv: 0.15, ticket: 1250, concorrencia: 1.35 },
            'parnaiba': { nome: 'Parnaíba - PI', mercado: 6000, saturacao: 175000, conv: 0.18, ticket: 1050, concorrencia: 1.00 },
            'floriano': { nome: 'Floriano - PI', mercado: 4000, saturacao: 120000, conv: 0.16, ticket: 980, concorrencia: 0.92 },
            'campo-maior': { nome: 'Campo Maior - PI', mercado: 3000, saturacao: 95000, conv: 0.14, ticket: 920, concorrencia: 0.85 }
        };

        // Fator de CPL por canal: Meta entrega volume, Google entrega intenção
        const SIM_CPL_CANAL = { meta: 0.86, google: 1.38 };

        const SIM_OBJETIVOS = {
            assinaturas: { nome: 'Assinaturas de Fibra', convMult: 1.00, receitaMult: 1.00, roimMult: 1.00, leadsMult: 1.00 },
            leads: { nome: 'Geração de Leads', convMult: 0.75, receitaMult: 0.80, roimMult: 0.62, leadsMult: 1.35 },
            awareness: { nome: 'Awareness / Reconhecimento', convMult: 0.45, receitaMult: 0.55, roimMult: 0.40, leadsMult: 0.70 },
            retencao: { nome: 'Retenção de Clientes', convMult: 0.60, receitaMult: 0.48, roimMult: 0.70, leadsMult: 0.55 }
        };

        const SIM_PUBLICOS = {
            familias: { nome: 'Famílias (25-45)', cplMult: 1.00, convMult: 1.00, fatiaMeta: 1.15 },
            jovens: { nome: 'Jovens Estudantes (18-24)', cplMult: 0.72, convMult: 0.70, fatiaMeta: 1.35 },
            profissionais: { nome: 'Profissionais Remotos (28-45)', cplMult: 1.28, convMult: 1.22, fatiaMeta: 0.85 },
            empresas: { nome: 'Empresas e PJ', cplMult: 1.55, convMult: 0.80, fatiaMeta: 0.55 },
            games: { nome: 'Gamers e Streaming', cplMult: 0.95, convMult: 0.85, fatiaMeta: 1.25 }
        };

        // Curva de aprendizado: campanhas longas tendem a custo menor por lead
        const ganhoDuracao = duracao => 1 - Math.min(0.22, Math.log2(duracao) * 0.075);
        const criativoMult = n => 1 + (n - 3) * 0.09;

        function simValor(id, padrao) {
            const el = document.getElementById(id);
            return el ? el.value : padrao;
        }

        function simTexto(id, padrao) {
            const el = document.getElementById(id);
            if (!el || !el.options) return padrao;
            const opcao = el.options[el.selectedIndex];
            return opcao ? opcao.text : padrao;
        }

        function resetSim() {
            const padroes = { 'sim-budget': 50000, 'sim-split': 60, 'sim-duracao': 4, 'sim-criativo': 3 };
            Object.keys(padroes).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = padroes[id];
            });
            const cidade = document.getElementById('sim-cidade');
            if (cidade) cidade.value = 'picos';
            const objetivo = document.getElementById('sim-objetivo');
            if (objetivo) objetivo.value = 'assinaturas';
            const publico = document.getElementById('sim-publico');
            if (publico) publico.value = 'familias';
            updateSim();
            const aprovacao = document.getElementById('sim-approval');
            if (aprovacao) aprovacao.innerText = '';
            registrarAtividade('Parâmetros da simulação restaurados', 'Cenário padrão: R$ 50.000 em Picos, 60% Meta / 40% Google, 4 semanas, criativo nível 3.', 'Simulador');
        }

        function aprovarSim() {
            const el = document.getElementById('sim-approval');
            if (!el) return;
            const cidade = SIM_CIDADES[document.getElementById('sim-cidade').value];
            const budget = parseInt(document.getElementById('sim-budget').value, 10);
            const meta = Math.round(budget * (document.getElementById('sim-split').value / 100));
            el.innerHTML = 'Campanha aprovada: R$ ' +
                budget.toLocaleString('pt-BR') + ' em ' + cidade.nome + ' (Meta R$ ' + meta.toLocaleString('pt-BR') + '). Enviada para execução.';
            registrarAtividade('Campanha aprovada e enviada para execução', 'Simulação de R$ ' + budget.toLocaleString('pt-BR') + ' em ' + cidade.nome + ' com Meta R$ ' + meta.toLocaleString('pt-BR') + ' e Google R$ ' + (budget - meta).toLocaleString('pt-BR') + '.', 'Simulador');
        }

        function updateSim() {
            const budget = parseInt(simValor('sim-budget', 50000));
            const split = parseInt(simValor('sim-split', 60));
            const duracao = parseInt(simValor('sim-duracao', 4));
            const criativo = parseInt(simValor('sim-criativo', 3));

            const cidadeKey = document.getElementById('sim-cidade') ? document.getElementById('sim-cidade').value : 'picos';
            const objetivoKey = document.getElementById('sim-objetivo') ? document.getElementById('sim-objetivo').value : 'assinaturas';
            const publicoKey = document.getElementById('sim-publico') ? document.getElementById('sim-publico').value : 'familias';

            const cidade = SIM_CIDADES[cidadeKey];
            const objetivo = SIM_OBJETIVOS[objetivoKey];
            const publico = SIM_PUBLICOS[publicoKey];

            const set = (id, valor) => {
                const el = document.getElementById(id);
                if (el) el.innerText = valor;
            };

            set('sim-val-budget', 'R$ ' + budget.toLocaleString('pt-BR'));
            set('sim-val-split', split + '% Meta / ' + (100 - split) + '% Google');
            set('sim-val-cidade', simTexto('sim-cidade', cidade.nome));
            set('sim-val-objetivo', simTexto('sim-objetivo', objetivo.nome));
            set('sim-val-publico', simTexto('sim-publico', publico.nome));
            set('sim-val-duracao', duracao + (duracao === 1 ? ' semana' : ' semanas'));
            set('sim-val-criativo', criativo);

            const invMeta = budget * (split / 100);
            const invGoogle = budget * ((100 - split) / 100);
            set('sim-val-meta', 'R$ ' + Math.round(invMeta).toLocaleString('pt-BR'));
            set('sim-val-google', 'R$ ' + Math.round(invGoogle).toLocaleString('pt-BR'));

            // Saturação de mercado: mais investimento rende menos incremental
            const alcance = 1 - Math.exp(-budget / cidade.saturacao);
            const tetoMercado = cidade.mercado * alcance * objetivo.leadsMult;

            // CPL por canal: base da cidade x concorrencia x publico x aprendizado x criativo
            const cplBase = 26 * publico.cplMult * (cidade.concorrencia * 0.35 + 0.65) * ganhoDuracao(duracao) * criativoMult(criativo);
            const cplMeta = cplBase * SIM_CPL_CANAL.meta;
            const cplGoogle = cplBase * SIM_CPL_CANAL.google * (1 + (cidade.concorrencia - 1) * 0.4);

            // Cada canal entrega leads ate seu teto proporcional de mercado
            const brutoMeta = invMeta / Math.max(6, cplMeta);
            const brutoGoogle = invGoogle / Math.max(6, cplGoogle);
            const limites = brutoMeta + brutoGoogle;
            const tetoTotal = Math.max(200, tetoMercado);
            const fator = Math.min(1, tetoTotal / limites);
            const leadsMeta = brutoMeta * fator;
            const leadsGoogle = brutoGoogle * fator;
            const leads = Math.max(10, Math.round(leadsMeta + leadsGoogle));
            const cpl = leads > 0 ? budget / leads : 0;

            // Conversão: base da cidade ajustada por concorrencia x publico x objetivo x criativo
            const conv = Math.min(0.55,
                cidade.conv * publico.convMult * objetivo.convMult * criativoMult(criativo) * (1 + Math.log2(duracao) * 0.03) / (0.6 + cidade.concorrencia * 0.4));
            const assinaturas = Math.max(1, Math.round(leads * conv));

            const ticket = cidade.ticket * objetivo.receitaMult;
            const receita = assinaturas * ticket;

            // ROI: receita incremental atribuida ao objetivo
            const roi = Math.max(0.6, receita / budget * objetivo.roimMult);

            set('sim-res-roi', roi.toFixed(1).replace('.', ',') + 'x');
            set('sim-res-leads', leads.toLocaleString('pt-BR'));
            set('sim-res-sales', assinaturas.toLocaleString('pt-BR'));
            set('sim-res-revenue', 'R$ ' + Math.round(receita).toLocaleString('pt-BR'));

            set('sim-roi-hint', 'Intervalo ' + (roi * 0.93).toFixed(1).replace('.', ',') + 'x - ' + (roi * 1.07).toFixed(1).replace('.', ',') + 'x');
            set('sim-leads-hint', 'Custo por lead R$ ' + cpl.toFixed(2).replace('.', ','));
            set('sim-sales-hint', 'Taxa de conversão ' + (conv * 100).toFixed(1).replace('.', ',') + '%');
            set('sim-rev-hint', 'Ticket médio R$ ' + Math.round(ticket).toLocaleString('pt-BR'));

            // Confiança do modelo: cai com alocação extrema e budget baixo, sobe com criativo
            const confianca = Math.round(Math.min(96, Math.max(58,
                94 - Math.abs(split - 60) * 0.22 - (5 - criativo) * 2.2 - Math.log2(duracao) * 1.6 + Math.log10(budget / 10000) * 1.8)));
            const badge = document.getElementById('sim-confianca');
            if (badge) {
                badge.innerText = 'Confiança ' + confianca + '%';
                badge.className = 'badge ' + (confianca >= 80 ? 'badge-success' : 'badge-warning');
            }

            // Distribuicao real de leads por canal (calculada pelo modelo, nao pela alocacao)
            const shareMeta = leads > 0 ? Math.round(leadsMeta / leads * 100) : 0;

            set('sim-meta-share', shareMeta + '% dos leads (' + Math.round(leadsMeta).toLocaleString('pt-BR') + ')');
            set('sim-google-share', (100 - shareMeta) + '% dos leads (' + Math.round(leadsGoogle).toLocaleString('pt-BR') + ')');
            const barMeta = document.getElementById('sim-meta-bar');
            const barGoogle = document.getElementById('sim-google-bar');
            if (barMeta) barMeta.style.width = shareMeta + '%';
            if (barGoogle) barGoogle.style.width = (100 - shareMeta) + '%';

            // Recomendação do modelo
            let insight;
            if (split === 0 || split === 100) {
                insight = 'Alocação em 100% de um canal aumenta o risco de fadiga de criativo. O modelo recomenda dividir <strong>60/40 a favor do Meta Ads</strong> para ' + cidade.nome + '.';
            } else if (roi < 3) {
                insight = 'ROI projetado abaixo de 3x. Sugestão: reduzir investimento para <strong>R$ ' + Math.round(budget * 0.7 / 1000) + 'k</strong> e concentrar em <strong>' + (cidadeKey === 'teresina' ? 'Picos' : 'Teresina') + '</strong>, onde o CPL histórico é menor.';
            } else if (criativo <= 2) {
                insight = 'O nível de criativo está limitando a conversão. Elevar para <strong>nível 4</strong> aumenta a taxa de conversão e o ROI em aproximadamente <strong>+18%</strong>.';
            } else if (split > 80) {
                insight = 'Concentração alta em Meta Ads. Para <strong>' + publico.nome + '</strong>, Google Ads responde melhor em busca de intenção. Tente <strong>55% Meta / 45% Google</strong>.';
            } else if (split < 35) {
                insight = 'Pouco peso em Meta Ads para o público <strong>' + publico.nome + '</strong>. Ajustar para <strong>55-65% Meta</strong> amplia o volume de leads sem elevar o CAC.';
            } else if (conv > 0.30) {
                insight = 'Conversão projetada de <strong>' + (conv * 100).toFixed(1) + '%</strong>, acima da média regional. Vale ampliar o investimento e estender a campanha para <strong>' + Math.max(duracao, 8) + ' semanas</strong> para escalar.';
            } else {
                insight = 'Cenário equilibrado para <strong>' + cidade.nome + '</strong>: ROI de <strong>' + roi.toFixed(1).replace('.', ',') + 'x</strong> com CAC de <strong>R$ ' + (assinaturas ? (budget / assinaturas).toFixed(2).replace('.', ',') : '0,00') + '</strong>. Mantenha o monitoramento diário da cota.';
            }
            const insightEl = document.getElementById('sim-insight-text');
            if (insightEl) insightEl.innerHTML = insight;
        }

        // MARKETING COPILOT IA - RESPOSTAS AUTOMATICAS BASEADAS NO ESTADO DO PAINEL
        const texto = id => {
            const el = document.getElementById(id);
            return el ? el.innerText.trim() : '-';
        };

        function valorDe(id, padrao) {
            const el = document.getElementById(id);
            return el && el.value !== undefined && el.value !== '' ? el.value : padrao;
        }

        function numeroDe(id, padrao) {
            const n = parseInt(valorDe(id, padrao));
            return isFinite(n) ? n : padrao;
        }

        function textoOpcao(id) {
            const el = document.getElementById(id);
            if (!el || !el.options) return '-';
            const opcao = el.options[el.selectedIndex];
            return opcao && opcao.text ? opcao.text : valorDe(id, '-');
        }

        function roIsCampanhas() {
            const celulas = document.querySelectorAll('#view-dashboard .roi-cell');
            const nomes = ['Ultra Fibra Picos 1Gbps', 'Expansão Teresina Sul', 'Conecta Parnaíba Litoral'];
            const status = ['Ativa', 'Ativa', 'Em Ajuste'];
            const investimento = ['R$ 45.000', 'R$ 80.000', 'R$ 30.000'];
            return nomes.map((nome, i) => {
                const roi = celulas[i] ? celulas[i].innerText.trim() : '-';
                return '<li><strong>' + nome + '</strong> - ' + investimento[i] +
                    ' · ROI ' + roi + ' · ' + status[i] + '</li>';
            }).join('');
        }

        function listaTopicos() {
            const linhas = (itens) => '<ul class="chat-list">' +
                itens.map(t => '<li><strong>' + t[0] + ':</strong> ' + t[1] + '</li>').join('') + '</ul>';

            return [
                {
                    id: 'panorama',
                    pergunta: 'Resumo do painel agora',
                    resposta: () => 'Estado atual do Centro de operações:<br><br>' +
                        linhas([
                            ['ROI geral', texto('kpi-roi') + ' (' + texto('kpi-roi-trend') + ' vs mês anterior)'],
                            ['Investimento ativo', texto('kpi-investimento')],
                            ['Leads no mês', texto('kpi-leads')],
                            ['CAC', texto('kpi-cac')],
                            ['Dia em alta no gráfico', CHART_DIAS[diaDaSemana()] + ' (' + dashboardState.barras[diaDaSemana()].toFixed(1) + '% de performance)'],
                            ['Última atualização', texto('dashboard-last-update')]
                        ]) +
                        '<br>Os indicadores são recalculados a cada 4s enquanto esta aba fica aberta e ficam salvos no navegador, então o valor não se perde ao recarregar a página.'
                },
                {
                    id: 'centro',
                    pergunta: 'Como funciona o Centro de operações?',
                    resposta: () => 'O Centro de operações é o painel que você está vendo agora. Ele funciona assim:<br><br>' +
                        linhas([
                            ['KPIs', 'ROI, investimento, leads e CAC são recalculados a cada 4 segundos enquanto a aba estiver ativa.'],
                            ['Gráfico mídia x conversão', 'tem uma barra por dia da semana. Só a barra do dia de hoje se movimenta; quando o dia vira, aquele dia congela no valor em que parou e os demais só voltam a se mover no dia correspondente.'],
                            ['Últimas movimentações', 'alertas e eventos recentes, gerados a partir do histórico de campanhas.'],
                            ['Campanhas em andamento', 'tabela com investimento, ROI e status das campanhas ativas.'],
                            ['Persistência', 'os valores ficam guardados no navegador (localStorage) e são restaurados no próximo acesso.']
                        ])
                },
                {
                    id: 'abas',
                    pergunta: 'O que cada aba do sistema faz e o que guarda?',
                    resposta: () => 'Estas são as 15 telas do MIOS e o que cada uma guarda:<br><br>' +
                        linhas([
                            ['Centro de operações', 'KPIs, gráfico semanal, movimentações e tabela de campanhas (salvo no navegador)'],
                            ['Diretoria', 'visão consolidada com orçamento e ranking de campanhas'],
                            ['Digital twin', 'saúde operacional de cada setor de marketing'],
                            ['Campanhas', 'tabela das campanhas com investimento, ROI e responsável'],
                            ['Cockpit', 'detalhamento de performance de uma campanha'],
                            ['Simulador', 'resultado da simulação conforme os parâmetros escolhidos'],
                            ['Timeline', 'histórico de tudo que foi acessado ou modificado (salvo no navegador)'],
                            ['Copilot', 'esta conversa automática com as respostas do sistema'],
                            ['Analytics', 'impressões, CTR e custo médio por clique'],
                            ['Grafo de relacionamentos', 'relação entre canais, campanhas, leads e vendas'],
                            ['Cobertura Piauí', 'market share por cidade do estado'],
                            ['Alertas', 'incidentes que exigem ação, com responsável e ação sugerida'],
                            ['Equipes', 'tarefas por squad e prazo'],
                            ['Logs de auditoria', 'as 25 ações mais recentes com horário e módulo'],
                            ['Configurações', 'integrações e credenciais dos conectores de mídia']
                        ])
                },
                {
                    id: 'campanhas',
                    pergunta: 'Como estão as campanhas agora?',
                    resposta: () => 'Campanhas em andamento, com os ROIs atualizados pelo painel:<ul class="chat-list">' + roIsCampanhas() + '</ul>' +
                        '<br>Para projetar cenários antes de decidir, use o Simulador: ele recalcula ROI, leads e assinaturas a cada parâmetro alterado.'
                },
                {
                    id: 'graficos',
                    pergunta: 'Como funcionam os gráficos e mapas?',
                    resposta: () => 'Existem quatro visões de dados no sistema:<br><br>' +
                        linhas([
                            ['Performance mídia x conversão', 'barras de Seg a Dom. Hoje (' + CHART_DIAS[diaDaSemana()] + ') está em ' + dashboardState.barras[diaDaSemana()].toFixed(1) + '% e é a única que se move. Os demais dias ficam parados até a semana virar.'],
                            ['Grafo de relacionamentos', 'mapa em nós (Meta Ads, Google Ads, campanha, leads e vendas) mostrando a relação entre canal e resultado.'],
                            ['Analytics', 'impressões totais, CTR médio e custo médio por clique do período.'],
                            ['Cobertura Piauí', 'market share por cidade: Picos 68%, Teresina 24%, Parnaíba 41% e Floriano 35%.']
                        ])
                },
                {
                    id: 'alertas',
                    pergunta: 'Quais alertas estão abertos?',
                    resposta: () => 'Existem 3 alertas abertos em Alertas:<br><br>' +
                        linhas([
                            ['Custo por lead elevado em Floriano - PI', 'CAC passou de R$ 65,00. Ação sugerida: ajustar lances de palavra-chave no Google Ads.'],
                            ['Esgotamento de brindes - Parnaíba', 'estoque de kits de boas-vindas abaixo de 15%. Ação: notificar o almoxarifado central.'],
                            ['Assinatura', 'cada alerta tem um botão de ação rápida que leva ao módulo responsável.']
                        ])
                },
                {
                    id: 'simulador',
                    pergunta: 'Como o Simulador calcula?',
                    resposta: () => 'O Simulador tem 7 parâmetros e recalcula tudo a cada mudança:<br><br>' +
                        linhas([
                            ['Investimento', 'de R$ 10.000 a R$ 200.000'],
                            ['Cidade alvo', 'Picos, Teresina, Parnaíba, Floriano e Campo Maior, cada uma com mercado, CPL e ticket próprios'],
                            ['Distribuição Meta/Google', 'Meta tem CPL menor e entrega mais volume; Google traz intenção de busca'],
                            ['Objetivo', 'assinaturas, leads, awareness ou retenção, cada um com peso diferente de conversão e receita'],
                            ['Público-alvo', 'famílias, jovens, profissionais remotos, empresas ou gamers'],
                            ['Duração', 'de 1 a 12 semanas, com curva de aprendizado reduzindo o custo por lead'],
                            ['Criativo', 'nível 1 a 5, que influencia a conversão e a confiança do modelo']
                        ]) +
                        '<br>Parâmetros ativos agora: <strong>' + brl(numeroDe('sim-budget', 0)) + '</strong> em ' + textoOpcao('sim-cidade') +
                        ' · <strong>' + numeroDe('sim-split', 0) + '% Meta / ' + (100 - numeroDe('sim-split', 60)) + '% Google</strong> · objetivo ' + textoOpcao('sim-objetivo') +
                        ' · público ' + textoOpcao('sim-publico') + ' · <strong>' + numeroDe('sim-duracao', 0) + ' semana(s)</strong> · criativo nível ' + numeroDe('sim-criativo', 0) + '.<br><br>' +
                        'Resultado atual da sua simulação: <strong>' + texto('sim-res-roi') + '</strong> de ROI, <strong>' +
                        texto('sim-res-leads') + '</strong> leads, <strong>' + texto('sim-res-sales') +
                        '</strong> assinaturas e <strong>' + texto('sim-res-revenue') + '</strong> de receita. O modelo leva em conta saturação de mercado, então aumentar o budget sempre dá retorno decrescente.'
                },
                {
                    id: 'timeline',
                    pergunta: 'O que a Timeline registra?',
                    resposta: () => 'A Timeline registra tudo que é feito no sistema. Hoje há <strong>' + atividadeState.itens.length +
                        '</strong> ações registradas, sendo a mais recente: <em>' + escaparHtml(atividadeState.itens.length ? atividadeState.itens[0].titulo + ' - ' + rotuloData(atividadeState.itens[0].ts) : 'nenhuma ainda') + '</em>.<br><br>' +
                        linhas([
                            ['Acessos', 'cada módulo aberto no menu lateral'],
                            ['Parâmetros', 'cada valor alterado no Simulador, com o antes e o depois e o resultado projetado'],
                            ['Execução', 'aprovação de campanha e restauração de parâmetros'],
                            ['Sessão', 'login, logout e abertura do painel']
                        ]) +
                        '<br>Cada item mostra o horário exato e o tempo decorrido, e o histórico fica salvo no navegador.'
                },
                {
                    id: 'dados',
                    pergunta: 'Onde meus dados ficam guardados?',
                    resposta: () => 'Tudo fica no seu próprio navegador, sem envio para servidor externo:<br><br>' +
                        linhas([
                            [STORAGE_KEY, 'KPIs, valores das barras do gráfico e dia da semana em movimento'],
                            [ATIVIDADES_KEY, 'histórico da Timeline (até ' + LIMITE_ATIVIDADES + ' ações)'],
                            ['Credenciais', 'as integrações de mídia aparecem na aba Configurações apenas para exibição']
                        ]) +
                        '<br>O botão "Limpar histórico" da Timeline apaga apenas o registro de ações, sem afetar os KPIs.'
                },
                {
                    id: 'copilot',
                    pergunta: 'O que o Copilot consegue responder?',
                    resposta: () => 'O Copilot é determinístico: não escreve mensagens livres, responde a partir dos dados reais do painel. Consegue explicar:<br><br>' +
                        linhas([
                            ['Resumo do painel', 'KPIs e estado atual'],
                            ['Centro de operações', 'como os KPIs e o gráfico do dia funcionam'],
                            ['Abas do sistema', 'o que cada uma faz e o que guarda'],
                            ['Campanhas', 'investimento, ROI e status de cada campanha'],
                            ['Gráficos e mapas', 'como ler cada visualização'],
                            ['Alertas', 'incidentes abertos e ação sugerida'],
                            ['Simulador', 'como o cálculo é feito e o resultado atual'],
                            ['Timeline', 'o que é registrado e onde fica salvo']
                        ])
                }
            ];
        }

        function adicionarMensagemCopilot(html, doUsuario) {
            const container = document.getElementById('chat-messages');
            if (!container) return;

            const bubble = document.createElement('div');
            bubble.className = 'msg ' + (doUsuario ? 'msg-user' : 'msg-ai');
            bubble.innerHTML = '<span class="msg-author">' + (doUsuario ? 'Você' : 'Copilot') + '</span>' +
                (doUsuario ? escaparHtml(html) : html);
            container.appendChild(bubble);
            container.scrollTop = container.scrollHeight;
        }

        function renderTopicosCopilot() {
            const container = document.getElementById('copilot-topicos');
            if (!container) return;

            container.innerHTML = listaTopicos().map(t =>
                '<button type="button" class="topic-btn" onclick="copilotResponder(\'' + t.id + '\')">' +
                escaparHtml(t.pergunta) + '</button>'
            ).join('');
        }

        function copilotResponder(topicoId) {
            const topico = listaTopicos().find(t => t.id === topicoId);
            if (!topico) return;

            adicionarMensagemCopilot(topico.pergunta, true);
            setTimeout(() => adicionarMensagemCopilot(topico.resposta(), false), 220);
            registrarAtividade('Copilot consultado: ' + topico.pergunta, 'Resposta gerada a partir do estado atual do painel.', 'Copilot');
        }

        function copilotBriefing() {
            const container = document.getElementById('chat-messages');
            if (!container || container.querySelector('.msg-briefing')) return;
            const hoje = CHART_DIAS[diaDaSemana()];
            adicionarMensagemCopilot(
                'Leitura atual do painel em <strong>' + rotuloData(Date.now()).split(',')[0].toLowerCase() +
                '</strong>: ROI geral em <strong>' + texto('kpi-roi') + '</strong>, CAC de <strong>' + texto('kpi-cac') +
                '</strong> e <strong>' + texto('kpi-leads') + '</strong> leads no mês. O gráfico está movimentando apenas <strong>' +
                hoje + '</strong> (' + dashboardState.barras[diaDaSemana()].toFixed(1).replace('.', ',') + '%) e há <strong>' +
                atividadeState.itens.length + '</strong> ações registradas na Timeline.<br><br>Selecione um assunto abaixo para detalhar.', false);
            if (container.lastElementChild) container.lastElementChild.classList.add('msg-briefing');
        }

        function gerenciarAtualizacaoCopilot(ativo) {
            if (!ativo) return;
            renderTopicosCopilot();
            copilotBriefing();
        }

        function limparCopilot() {
            const container = document.getElementById('chat-messages');
            if (container) container.innerHTML = '';
            registrarAtividade('Conversa do Copilot limpa', 'Histórico de respostas apagado da tela.', 'Copilot');
        }

        // INICIALIZACAO
        document.addEventListener('DOMContentLoaded', () => {
            carregarEstadoDashboard();
            carregarAtividades();
            semearAtividades();
            updateSim();
            renderTimeline();
            registrarAtividade('Painel acessado', 'Sessão aberta por ' + atividadeState.usuario + ' no navegador ' + (navigator.userAgent.indexOf('Firefox') > -1 ? 'Firefox' : 'Chrome/Edge') + '.', 'Sistema');
            gerenciarAtualizacaoDashboard(true);
            renderTopicosCopilot();
        });