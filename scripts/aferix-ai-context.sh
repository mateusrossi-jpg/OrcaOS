#!/usr/bin/env bash
set -e

echo "Aferix AI Context Setup"
echo "-----------------------"
read -p "Criar/atualizar arquivos de contexto do Gemini? (s/n): " confirm

if [[ "$confirm" != "s" ]]; then
  echo "Cancelado."
  exit 0
fi

mkdir -p docs/AI_CONTEXT scripts

cat > GEMINI.md <<'EOF'
# AFERIX — REGRAS GLOBAIS

Aferix é um ERP financeiro mobile-first para autônomos e prestadores.

## Regra principal
Tudo gira em torno do orçamento.

## MVP
Foco em:
- orçamento
- custos
- lucro
- margem
- clientes
- histórico
- financeiro simples

## Arquitetura
React NÃO toca no banco.

Fluxo:
React -> Hooks -> Services -> Repositories -> Storage

## UI
- Dark premium
- Amarelo/dourado como accent principal
- Mobile-first
- Cards escuros
- Sem teal/cyan como cor principal

## Proibido
- overengineering
- dashboard complexo
- CQRS
- event bus
- DI complexa
- state machine gigante
- refatoração sem necessidade
EOF

cat > docs/CONTEXTO_MASTER.md <<'EOF'
# CONTEXTO MASTER — AFERIX

Aferix é o produto principal, sucessor conceitual do OrçaOS.

Objetivo:
ajudar autônomos a cobrar melhor, controlar custos e parar de perder dinheiro.

O momento principal do app é:
o usuário digitar o valor e custos e ver imediatamente lucro, margem e status.
EOF

cat > docs/ARQUITETURA.md <<'EOF'
# ARQUITETURA — AFERIX

Estrutura permitida:
- domain/
- hooks/
- services/
- repositories/
- storage/
- pages/

Regra:
React chama hooks/services.
Services chamam repositories.
Repositories acessam storage.
EOF

cat > docs/UI_UX.md <<'EOF'
# UI/UX — AFERIX

Visual oficial:
- dark premium
- preto/grafite
- amarelo/dourado
- mobile-first
- cards consistentes
- interface limpa

Evitar:
- teal/cyan
- poluição visual
- excesso de cards
- dashboards gigantes
EOF

cat > docs/MVP_ROADMAP.md <<'EOF'
# MVP ROADMAP — AFERIX

Prioridade:
1. Tela de orçamento
2. Preview financeiro sticky
3. Persistência local
4. Finalização com snapshot
5. Histórico
6. Home operacional

Não implementar agora:
- sync
- IA pesada
- PDF avançado
- WhatsApp
- multiempresa
EOF

cat > docs/REGRAS_DE_DESENVOLVIMENTO.md <<'EOF'
# REGRAS DE DESENVOLVIMENTO

Antes de editar:
1. ler arquivos relacionados
2. explicar impacto
3. alterar pouco por vez
4. rodar build/typecheck quando possível

Evitar:
- nova arquitetura sem necessidade
- nova lib sem justificativa
- refatoração ampla
EOF

echo "# Árvore atual do projeto" > docs/AI_CONTEXT/PROJECT_TREE.md
find src -maxdepth 5 -type f 2>/dev/null | sort >> docs/AI_CONTEXT/PROJECT_TREE.md || true

echo "# Mudanças recentes" > docs/AI_CONTEXT/RECENT_CHANGES.md
git status --short >> docs/AI_CONTEXT/RECENT_CHANGES.md || true
echo "" >> docs/AI_CONTEXT/RECENT_CHANGES.md
git diff --stat >> docs/AI_CONTEXT/RECENT_CHANGES.md || true

cat > docs/AI_CONTEXT/CURRENT_FLOW.md <<'EOF'
# Fluxo Atual Esperado

O orçamento é o eixo central.

Status:
- iniciado
- execução
- revisão
- enviado
- autorizado
- recusado
- finalizado

Financeiro e histórico derivam do orçamento.
EOF

echo ""
echo "Contexto criado/atualizado com sucesso."
echo ""
echo "Agora rode:"
echo "gemini"
echo ""
echo "E cole:"
echo "Leia GEMINI.md e docs/. Não edite nada ainda. Faça diagnóstico do projeto."
