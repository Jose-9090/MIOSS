# DESIGN DNA - VirteX MIOS

Fonte de verdade visual do projeto. O MIOS é uma mesa de operação de marketing
interno, não uma landing page. A referência é console de NOC de telecom: painéis
planos, hairlines, dados densos e nenhum ornamento.

## Identidade

- **Negócio:** telecom de fibra (VirteX) com central interna de operações de marketing (MIOS).
- **Público:** diretoria, gestores de mídia e operadores de campo. Uso diário, tela cheia, decisão rápida.
- **Personalidade:** operacional, sóbria, precisa. O sistema some e o dado aparece.
- **Keywords visuais:** plano, mate, denso, alinhado, vermelho só quando há ação ou exceção.
- **Teste do logo:** remova o logo. A tela ainda deve parecer um sistema de operações de
  telecom, não um template de dashboard.

## Tipografia

- **IBM Plex Sans** para interface e leitura (400/500/600).
- **IBM Plex Mono** para todo dado numérico, horário, label técnico e código.
- Pesos 700+ eliminados. Hierarquia por tamanho, caixa e cor, nunca por peso extremo.
- Títulos de tela: 20-22px, 600. Títulos de painel: 13-14px, 500.
- Micro-labels em caixa alta, 9,5-10px, tracking 0.04-0.1em.
- Corpo de tabela: 12-12,5px. Nunca abaixo de 11px em texto de leitura.

## Cor

| Papel | Valor | Uso |
|---|---|---|
| Fundo | `#0A0A0B` | plano, sem gradiente |
| Superfície | `#101012` | painéis, sidebar |
| Superfície 2 | `#161619` | cabeçalho de tabela, insight, inset |
| Superfície 3 | `#1D1D22` | hover de linha, botão secundário |
| Borda | `#26262C` | hairline padrão |
| Borda forte | `#3A3A43` | divisor de estrutura, trilho de gráfico |
| Marca | `#C71015` | extraído do logo (199,16,21) |
| Marca hover | `#A80D12` | estado pressed/hover do primário |
| Texto | `#ECECEF` | títulos e dados |
| Texto muted | `#9B9BA5` | corpo e descrição |
| Texto subtle | `#7E7E89` | labels, metadados |
| Sucesso | `#6FBF97` | status ok, aprovação |
| Atenção | `#D6B25C` | alerta, pendência |
| Perigo | `#E0686B` | incidente crítico |
| Info | `#7FA8C9` | informação, foco |

- Vermelho é cor de ação e exceção, não de decoração. No máximo um bloco vermelho
  visível por dobra.
- Status nunca usam neon nem preenchimento saturado. Texto + marcador quadrado de 5px.
- Contraste mínimo 4.5:1 para texto e 3:1 para elementos de interface.

## Forma e profundidade

- Raio máximo **2px**. Não existe pílula, não existe card arredondado.
- **Zero `box-shadow`**, inclusive inline no JS. Profundidade = hairline de 1px +
  diferença de superfície.
- Zero `backdrop-filter`, `blur`, `text-shadow`, glow.
- Divisores de 1px fazem o trabalho que sombras faziam.
- Ícones decorativos eliminados. Navegação, botões, alertas, timeline e títulos são texto.
  Símbolos só quando carregam informação (seta de tendência, marcador de status).

## Layout

- Sidebar fixa de 236px com grupos de navegação e rodapé de sessão.
- Header de 56px com breadcrumb, título e ações globais.
- Conteúdo em coluna única, densa, com no máximo 16px entre painéis.
- KPIs em uma faixa contínua de 4 colunas separadas por hairline, não em 4 cards soltos.
- Tabelas substituem grids de cards sempre que a informação for comparável.
- Larguras de leitura limitadas a ~70-90ch. Nada de texto correndo a tela inteira.
- Responsivo: sidebar vira faixa horizontal em ≤900px; grids colapsam em 1180/900/640px;
  tabelas rolam dentro do próprio wrapper, nunca a página.

## Componentes

- **Painel:** superfície `--ink-1`, borda 1px, header com título e meta alinhada à direita.
- **KPI:** label, valor mono grande, linha de contexto. Sem ícone, sem card individual.
- **Botão primário:** vermelho chapado, texto branco, hover escurece. Sem elevação.
- **Botão secundário:** transparente, borda `--line-strong`, hover `--ink-3`.
- **Status:** label mono caixa alta + quadrado de 5px na cor do estado.
- **Tabela:** header em `--ink-2`, linhas separadas por hairline, números à direita.
- **Gráfico:** barras chapadas; dia corrente em vermelho, demais em `--line-strong`.
  Sem gradiente, sem glow, sem animação em repouso.
- **Timeline:** linha vertical hairline, marcador quadrado, horário em mono.
- **Alerta:** linha com severidade em texto à esquerda e ação à direita. Sem ícone.
- **Chat:** bolha reta, autor em label mono, lista com marcadores discretos.
- **Login:** split entre statement de marca e formulário. Sem card centralizado, sem vidro.
  Em ≤900px a coluna de marca some e uma linha compacta com logo + MIOS abre o formulário.

## Movimento

- Nada se move em repouso. Sem pulso, sem brilho, sem loop decorativo.
- Transições apenas em cor e borda, 120-150ms, lineares.
- Hover não desloca (`translateY`) nem escala. Troca de fundo/borda somente.
- Troca de tela: fade curto de 0.15s.
- Respeitar `prefers-reduced-motion`: sem transições e sem scroll suave.

## Acessibilidade

- `:focus-visible` com outline de 2px em `--info` e offset de 2px.
- `color-scheme: dark` declarado para controles nativos.
- Contraste verificado nos quatro estados de status.
- Navegação por teclado em todos os botões e campos; `aria-labelledby` nos painéis.
- Texto selecionável; nada de `user-select: none` global.

## Anti-AI rules (deste projeto)

1. Nenhum `box-shadow` com desfoque, em CSS ou em estilo inline gerado por JS.
2. Nenhum gradiente decorativo (linear ou radial), em nenhuma tela.
3. Nenhum painel translúcido, vidro ou blur.
4. Nenhum hover que desloque ou escale o elemento.
5. Nenhuma cor neon, nenhum glow, nenhum ponto pulsante decorativo.
6. Raio acima de 2px proibido.
7. Nenhum ícone decorativo. Se o símbolo não informa, sai.
8. Nenhum em dash (—) em texto visível. Usar hífen ou reescrever a frase.
9. Nenhum peso 700+ em títulos ou números.
10. Nenhum texto genérico de marketing ("Bom momento", "transforme", "eleve sua operação").
    Copy descreve estado, ação e consequência.
11. Nenhum número ou contagem inconsistente entre telas. Se o menu diz 3 alertas,
    a tela mostra 3 alertas.
12. Nenhuma animação contínua sem função operacional.
