# DESIGN DNA - VirteX MIOS

Fonte de verdade visual do projeto. O MIOS é um dashboard operacional de marketing
interno. A referência é um console administrativo moderno: sidebar escura, topbar
enxuta, cards de dado, hierarquia clara e vermelho de marca usado com intenção.

## Identidade

- **Negócio:** telecom de fibra (VirteX) com central interna de operações de marketing (MIOS).
- **Público:** diretoria, gestores de mídia e operadores de campo. Uso diário, tela cheia, decisão rápida.
- **Personalidade:** operacional, sóbria, precisa. O sistema some e o dado aparece.
- **Keywords visuais:** dark, denso, alinhado, vermelho como ação e exceção.
- **Teste do logo:** remova o logo. A tela ainda deve parecer um sistema de operações de
  telecom, não um template genérico de dashboard.

## Tipografia

- **IBM Plex Sans** para interface e leitura (400/500/600).
- **IBM Plex Mono** para todo dado numérico, horário, label técnico e código.
- Pesos 700+ eliminados. Hierarquia por tamanho, caixa e cor, nunca por peso extremo.
- Títulos de tela: 18-20px, 600. Títulos de painel: 14px, 600.
- Micro-labels em caixa alta, 12px, tracking 0.04-0.1em.
- Corpo de tabela: 12,5-13px. Piso global de 12px em texto funcional e de leitura.

## Cor

| Papel | Valor | Uso |
|---|---|---|
| Preto | `#000000` | fundo do app e sidebar |
| Fundo de conteúdo | `#0A0A0A` | topbar e área de conteúdo |
| Superfície | `#363636` | painéis, cards de KPI, login |
| Superfície elevada | `#3F3F3F` | cabeçalho de painel, hover de linha |
| Superfície interna | `#2A2A2A` | inputs, header de tabela, trilhos |
| Borda | `rgba(255,255,255,0.10)` | hairline padrão |
| Borda forte | `rgba(255,255,255,0.18)` | divisor de estrutura, contorno de controle |
| Marca | `#EE0000` | ação primária, item ativo, destaque de dado |
| Marca hover | `#C90000` | hover/pressed do primário |
| Texto | `#F5F5F5` | títulos e dados |
| Texto muted | `#C2C2C2` | corpo e descrição |
| Texto subtle | `#AAAAAA` | labels, metadados |
| Sucesso | `#5BC98D` | status ok, aprovação |
| Atenção | `#E8BE5A` | alerta, pendência |
| Perigo | `#FF7A7A` | incidente crítico |
| Info | `#7FB8E8` | informação, foco |

- Vermelho é cor de ação e exceção, não de decoração. No máximo um bloco vermelho
  visível por dobra.
- Status nunca usam neon nem preenchimento saturado. Texto + marcador quadrado de 6px.
- Contraste mínimo 4.5:1 para texto e 3:1 para elementos de interface.

## Forma e profundidade

- Raio de 8px em painéis e cards, 6px em controles e 4px em badges.
- Uma única sombra sutil em painéis e KPIs: deslocamento vertical, blur curto e baixa opacidade.
  Ela separa superfícies, não cria glow.
- Zero `backdrop-filter`, `blur`, `text-shadow`, glow ou gradiente decorativo.
- Divisores de 1px continuam fazendo a maior parte do trabalho de hierarquia.
- Ícones apenas na navegação lateral. São SVG local, 16px no desktop e 15px na
  navegação compacta, stroke 1.5, mesma família. KPIs, painéis e topbar seguem sem
  ícones. Marcadores de status continuam geométricos.

## Layout

- Sidebar fixa de 248px com grupos de navegação e rodapé de sessão.
- Header de 64px com breadcrumb, título e ações globais.
- Conteúdo com padding de 24px e no máximo 20px entre painéis.
- KPIs em quatro cards separados por 12px de respiro, não em uma faixa contínua.
- Tabelas substituem grids de cards sempre que a informação for comparável.
- Larguras de leitura limitadas a ~70-90ch. Nada de texto correndo a tela inteira.
- Responsivo: sidebar vira faixa horizontal em ≤900px; grids colapsam em 1180/900/640px;
  tabelas rolam dentro do próprio wrapper, nunca a página.

## Componentes

- **Painel:** superfície `--ink-1`, borda 1px, raio 8px, sombra sutil; header em `--ink-2`
  com título e meta alinhada à direita.
- **KPI:** card individual, label, valor mono grande e linha de contexto. Sem ícone.
- **Botão primário:** vermelho chapado, texto branco, hover escurece, sombra de 1px.
- **Botão secundário:** transparente, borda `--line-strong`, hover `--ink-2`.
- **Status:** label mono caixa alta + quadrado de 6px na cor do estado.
- **Tabela:** header em `--ink-3`, linhas separadas por hairline, números à direita.
- **Gráfico:** barras com topo levemente arredondado; dia corrente em vermelho,
  demais em `--chart-bar`. Sem gradiente, sem glow, sem animação em repouso.
- **Timeline:** linha vertical hairline, marcador quadrado, horário em mono.
- **Alerta:** linha com filete de severidade de 1px, fundo levemente tingido e ação à direita.
- **Chat:** bolha com raio 8px, autor em label mono, lista com marcadores discretos.
- **Login:** card de superfície centralizado, sem painel de marca lateral.
  O formulário fica no centro da tela em todas as larguras, com largura máxima de 380px.

## Movimento

- Nada se move em repouso. Sem pulso, sem brilho, sem loop decorativo.
- Transições de cor, borda e fundo em 160ms com `cubic-bezier(0.22, 1, 0.36, 1)`.
- Hover não desloca (`translateY`) nem escala. Troca de fundo/borda somente.
- Troca de tela: fade curto de 0.18s.
- Respeitar `prefers-reduced-motion`: sem transições e sem scroll suave.

## Acessibilidade

- `:focus-visible` com outline de 2px em `--info` e offset de 2px.
- `color-scheme: dark` declarado para controles nativos.
- Contraste verificado em tela, login e impressão; texto funcional ≥4.5:1.
- Navegação por teclado em todos os botões e campos; `aria-labelledby` nos painéis.
- Texto selecionável; nada de `user-select: none` global.

## Impressão

- A impressão expõe somente a view Diretoria, em fundo branco.
- Sidebar, topbar, login, botões, sombras e raios são removidos.
- Textos e números são convertidos para `#000`; bordas passam para `#bbb`/`#ccc`.
- A tabela mantém apenas o conteúdo, sem depender do tema escuro.

## Anti-AI rules (deste projeto)

1. Uma única sombra sutil é permitida em painéis e KPIs. Nada de glow, halo ou sombra dura.
2. Nenhum gradiente decorativo (linear ou radial), em nenhuma tela.
3. Nenhum painel translúcido, vidro ou blur.
4. Nenhum hover que desloque ou escale o elemento.
5. Nenhuma cor neon, nenhum glow, nenhum ponto pulsante decorativo.
6. Raio acima de 8px proibido. Cards usam 8px, controles 6px, badges 4px.
7. Ícones apenas na navegação lateral. Se o símbolo não informa, sai.
8. Nenhum em dash (—) em texto visível. Usar hífen ou reescrever a frase.
9. Nenhum peso 700+ em títulos ou números.
10. Nenhum texto genérico de marketing ("Bom momento", "transforme", "eleve sua operação").
    Copy descreve estado, ação e consequência.
11. Nenhum número ou contagem inconsistente entre telas. Se o menu diz 3 alertas,
    a tela mostra 3 alertas.
12. Nenhuma animação contínua sem função operacional.
