# AFERIX — OFFLINE-FIRST CONSTITUTION V2

**STATUS: FROZEN | RATIFIED | NON-NEGOTIABLE**
**VERSION: 2.0 (HARDENED)**
**VALIDITY: 2026-2036**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PREAMBLE
Aferix is a field-service platform. The field is inherently disconnected, shielded, and remote. This Constitution ensures that Aferix remains a reliable tool in the technician's belt, immune to the "cloud-only" erosion that plagues modern SaaS. We accept engineering complexity as the price for user autonomy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## THE SUPREME LAW

**“Nenhum fluxo crítico de negócio pode depender de conectividade.”**

A nuvem existe para sincronizar, proteger, distribuir e elevar o valor dos dados a longo prazo — ela nunca deve ser o porteiro da produtividade imediata.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PART 1 — LOOPHOLE CLOSURE (DEFINITIONS)

To prevent future erosion, the following definitions are absolute:

1.  **Critical Business Workflow:** Includes any action required to move a project from "Lead" to "Completed". This specifically encompasses: Client Creation, Proposal Drafting, Technical Calculations, PDF Generation, Approval Capturing, Work Order Execution, and Material Logging.
2.  **Productivity Barrier:** Any spinner, loading overlay, or "Waiting for Server" block during a Critical Workflow is a Constitutional Violation.
3.  **Local Sovereignty:** The device is the authority for the **current task**. The Cloud is the canonical authority for **long-term settlement** and multi-user synchronization.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PART 2 — HARD CONSTITUTIONAL RULES

### LAW #01 — THE LAW OF LOCAL SOVEREIGNTY
O banco de dados local (IndexedDB/SQLite) é o alvo primário de toda leitura e escrita da interface. A UI nunca aguarda a rede para confirmar uma mutação de estado.

### LAW #02 — OFFLINE AUTHENTICATION MANDATE
Uma vez autenticado, a sessão do usuário deve persistir e ser renovável localmente. O aplicativo nunca deve bloquear o acesso a dados locais devido à falta de conexão para "checar a assinatura".

### LAW #03 — LOCAL LOGIC SUPREMACY
Calculadoras técnicas, regras de validação e motores de geração de documentos (PDF) devem residir no cliente. "Business Logic" não pode ser delegada exclusivamente para Cloud Functions ou APIs externas se isso impedir a conclusão de um fluxo crítico offline.

### LAW #04 — CLOUD AS SETTLEMENT LAYER
A nuvem é a fonte canônica da verdade para fins de auditoria, reconciliação financeira e colaboração entre equipes. No entanto, o conflito de sincronização deve ser resolvido **após** a produtividade, nunca **antes**.

### LAW #05 — THE SYNC NON-BLOCKING RULE
A sincronização deve ser um processo de segundo plano, silencioso e resiliente. Falhas de sincronização não devem interromper o fluxo de trabalho do usuário.

### LAW #06 — ASSET AUTONOMY
Templates de documentos, catálogos de produtos e recursos necessários para a operação devem ser cacheados localmente no primeiro login e atualizados de forma diferencial.

### LAW #07 — DETERMINISTIC CONFLICT RESOLUTION
O sistema deve implementar resoluções de conflito determinísticas (ex: Last-Write-Wins ou CRDTs). A complexidade da reconciliação é responsabilidade da engenharia, não do usuário.

### LAW #08 — NO THIN CLIENTS
Aferix é um "Fat Client" por necessidade constitucional. Decisões arquiteturais que visem transformar o app em um simples visualizador de dados de servidor (WebView/Thin Client) são consideradas inconstitucionais.

### LAW #09 — DEVICE AUTONOMY (30-DAY RULE)
O sistema deve permanecer 100% funcional para operações de campo por pelo menos 30 dias de desconexão contínua.

### LAW #10 — USER PRODUCTIVITY SUPREMACY
Qualquer decisão arquitetural que melhore a simplicidade de engenharia às custas da autonomia offline do usuário é **INCONSTITUCIONAL**.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PART 3 — CONSTITUTIONAL TEST (CLASSIFICATION)

| Capability | Classification | Enforcement Detail |
| :--- | :--- | :--- |
| **Login / Auth** | **MANDATORY OFFLINE** | Cached sessions; no lockout in the basement. |
| **Client/Proposal Creation** | **MANDATORY OFFLINE** | Total autonomy to quote anywhere. |
| **PDF Generation** | **MANDATORY OFFLINE** | Local rendering engine. |
| **Work Order Execution** | **MANDATORY OFFLINE** | Checklists and logs must work underground. |
| **Technical Calculators** | **MANDATORY OFFLINE** | Local math, zero API dependency. |
| **Photos / Notes** | **MANDATORY OFFLINE** | Local storage with background upload. |
| **Signatures** | **MANDATORY OFFLINE** | Captured locally as data/blob. |
| **Catalog Access** | **MANDATORY OFFLINE** | Local search and filtering. |
| **Sync / Backups** | **ONLINE REQUIRED** | Naturally requires network to fulfill its purpose. |
| **Payment Clearing** | **ONLINE REQUIRED** | Requires external bank consensus. |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PART 4 — FAILURE SCENARIOS & RESILIENCE

1.  **Cloud/API Outage:** O técnico continua trabalhando, orçando e executando normalmente. A empresa não para.
2.  **Internet Outage (Underground):** Autonomia total. O PDF é gerado e mostrado ao cliente na tela do dispositivo.
3.  **90 Days Offline:** O app preserva os dados e a capacidade de edição. A sincronização ocorrerá quando a conectividade retornar.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PART 5 — THE ANTI-EROSION CLAUSE
“Any architecture decision that improves engineering simplicity while reducing offline autonomy shall be considered unconstitutional.”

**Verdict:** Ratified. This rule serves as the final barrier against "Technical Debt" that compromises the core product promise.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**RATIFICADO PELO CONSELHO ARQUITETURAL AFERIX**
*A arquitetura não é definida pelas telas. Ela é definida pelas responsabilidades e pela resiliência do domínio.*
