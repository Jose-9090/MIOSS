# DESIGN DNA — VirteX MIOS

Fonte de verdade visual do projeto. Base: remoção do "cheiro de IA" (glows, glassmorphism,
gradientes radiais, sombras) mantendo a identidade real da marca (vermelho VirteX, dark).

## Identidade

- **Negócio:** telecom de fibra (VirteX) com um sistema interno de operações de marketing (MIOS).
- **Público:** diretoria, gestores e operadores de mídia — uso diário, tela inteira, dados densos.
- **Personalidade:** console operacional sério. Precisão > espetáculo. Não é landing page.
- **Keywords visuais:** plano, mate, denso, alinhado, vermelho só quando importa.

## Tipografia

- Uma família: **Plus Jakarta Sans** (já é a fonte da marca) em 400/500/600/700.
- Pesos 800/900 eliminados do sistema: números de KPI em 700, títulos em 700.
- Micro-labels em caixa alta, 0.05em de tracking, ≤ 2 linhas.

## Cor

| Papel | Valor | Porquê |
|---|---|---|
| Fundo | `#0E0E10` | dark neutro, sem gradiente |
| Superfície (cards) | `#17171A` sólida | substitui o vidro translúcido — leitura de produto, não de mockup |
| Inset | `#101012` | blocos internos (antes `rgba(0,0,0,.3)`) |
| Borda | `#2A2A30` / forte `#3A3A42` | hierarquia por borda, nunca por sombra |
| Marca | `#D71920` | vermelho oficial, usado com parcimônia (CTA, ativo, alerta crítico) |
| Texto | `#F2F2F4` / muted `#A0A0AA` / subtle `#6B6B76` | contraste ≥ 4.5:1 |
| Status | success `#4CC38A`, warning `#E5B84B`, danger `#E5484D`, info `#5BA9D8` | versões dessaturadas dos neons iOS — sérias, legíveis no dark |

**Refutação:** se a empresa trocar a identidade para claro, todo o bloco muda junto.

## Shape language

- Raio máximo **8px** (cards), 6px (botões/inputs), 4px (badges). Sem pílulas.
- **Zero `box-shadow`.** Profundidade = borda de 1px + diferença de superfície.
- Sem `backdrop-filter`, sem `blur`, sem `text-shadow`, sem glow.

## Movimento

- Nada se move em repouso. Única animação contínua: pulso de opacidade (sem escala, sem glow)
  no ponto de status "ao vivo".
- Hover = troca de cor de fundo/borda em 150ms. **Sem `translateY`, sem zoom.**
- Troca de tela: fade curto (0.15s) — disparada por intenção do usuário.

## Componentes

- **Painel:** superfície sólida + borda 1px. Título 700, ação/badge alinhada à direita.
- **Botão primário:** vermelho chapado, hover escurece. Sem sombra/levitação.
- **Botão secundário:** transparente com borda. Nunca competem com o primário.
- **Badge:** retangular 4px, fundo tinta de 8%, borda na cor do status.
- **Tabela:** cabeçalho inset, linhas separadas por borda, hover de 2% de branco.
- **Gráfico:** barras vermelhas chapadas, sem gradiente, sem glow no hover.

## Anti-AI rules (deste projeto)

1. Nenhum `box-shadow` com desfoque — inclusive nos estilos inline do HTML e do JS (timeline).
2. Nenhum gradiente radial de decoração (login, simulador, sala do diretor).
3. Nenhum painel translúcido com blur ("glass").
4. Nenhum hover que desloque o elemento (`translateY`).
5. Nenhuma cor de status neon; nada de glow em ponto pulsante ou ícone.
6. Raio > 8px proibido.
