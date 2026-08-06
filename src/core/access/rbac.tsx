/**
 * rbac.ts — Role-Based Access Control (RBAC) · Aferix OS
 *
 * Design decision: o papel (role) do usuário autenticado é lido do JWT do
 * Supabase (app_metadata.role), resolvido uma vez por sessão e armazenado
 * em memória. Toda verificação de permissão acontece de forma SÍNCRONA e
 * offline — sem roundtrips à rede.
 *
 * Hierarquia de papéis (do mais ao menos permissivo):
 *   owner > admin > manager > technician > viewer
 *
 * Papéis desconhecidos recebem as permissões mínimas de 'viewer'.
 */

import { supabase } from '../database/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export type AppRole = 'owner' | 'autonomous' | 'sales' | 'field_technician' | 'stock_manager' | 'viewer';

/**
 * Catálogo de permissões da aplicação.
 * Cada chave descreve UMA capacidade; o valor é a lista de papéis que a possuem.
 */
export type AppPermission =
  // Financeiro
  | 'finance:view_dre'           // Ver DRE / Margem Líquida
  | 'finance:create_transaction' // Criar lançamentos financeiros
  | 'finance:delete_transaction' // Excluir lançamentos financeiros
  // Catálogo
  | 'catalog:edit'               // Criar / editar itens do catálogo
  | 'catalog:delete'             // Excluir itens do catálogo
  // Clientes
  | 'customers:create'           // Criar novos clientes
  | 'customers:delete'           // Excluir clientes
  // Ordens de Serviço
  | 'work_orders:create'         // Criar OS / Orçamentos
  | 'work_orders:approve'        // Aprovar / avançar status de OS
  | 'work_orders:delete'         // Excluir OS
  // Empresa
  | 'company:settings'           // Acessar configurações da empresa
  | 'company:manage_users'       // Gerenciar usuários da empresa
  // Relatórios
  | 'reports:view'               // Acessar tela de relatórios
  | 'reports:export';            // Exportar relatórios

// ─────────────────────────────────────────────────────────────────────────────
// Mapa de Permissões por Papel
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<AppRole, ReadonlySet<AppPermission>> = {
  owner: new Set<AppPermission>([
    'finance:view_dre',
    'finance:create_transaction',
    'finance:delete_transaction',
    'catalog:edit',
    'catalog:delete',
    'customers:create',
    'customers:delete',
    'work_orders:create',
    'work_orders:approve',
    'work_orders:delete',
    'company:settings',
    'company:manage_users',
    'reports:view',
    'reports:export',
  ]),

  autonomous: new Set<AppPermission>([
    'finance:view_dre',
    'finance:create_transaction',
    'finance:delete_transaction',
    'catalog:edit',
    'catalog:delete',
    'customers:create',
    'customers:delete',
    'work_orders:create',
    'work_orders:approve',
    'work_orders:delete',
    'company:settings',
    'reports:view',
    'reports:export',
  ]),

  sales: new Set<AppPermission>([
    'customers:create',
    'customers:delete',
    'work_orders:create',
    'work_orders:approve',
    'reports:view',
    'reports:export',
  ]),

  field_technician: new Set<AppPermission>([
    'customers:create',
    'work_orders:create',
    'reports:view',
  ]),

  stock_manager: new Set<AppPermission>([
    'catalog:edit',
    'catalog:delete',
    'reports:view',
  ]),

  viewer: new Set<AppPermission>([
    'reports:view',
  ]),
};

// ─────────────────────────────────────────────────────────────────────────────
// Resolução do Papel do Usuário Autenticado
// ─────────────────────────────────────────────────────────────────────────────

const VALID_ROLES = new Set<AppRole>(['owner', 'autonomous', 'sales', 'field_technician', 'stock_manager', 'viewer']);

function normalizeRole(raw: unknown): AppRole {
  if (typeof raw === 'string' && VALID_ROLES.has(raw as AppRole)) return raw as AppRole;
  return 'viewer'; // mínimo privilégio para roles desconhecidos
}

let cachedRole: AppRole | null = null;

/**
 * Lê o papel do usuário autenticado a partir do JWT (app_metadata.role).
 * Usa cache em memória por sessão — não chama a rede.
 */
export async function resolveCurrentRole(): Promise<AppRole> {
  if (cachedRole !== null) return cachedRole;

  const { data } = await supabase.auth.getSession();
  const appMeta = data?.session?.user?.app_metadata as Record<string, unknown> | undefined;
  cachedRole = normalizeRole(appMeta?.['role']);
  return cachedRole;
}

/**
 * Retorna o papel em cache (síncrono, sem await).
 * Retorna 'viewer' se o cache ainda não foi populado.
 * Use resolveCurrentRole() no boot para garantir que o cache existe.
 */
export function getCurrentRoleSync(): AppRole {
  return cachedRole ?? 'viewer';
}

/** Limpa o cache ao fazer logout (deve ser chamado em onAuthStateChange). */
export function clearRoleCache(): void {
  cachedRole = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// API de Verificação de Permissão
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifica se o papel fornecido possui a permissão solicitada.
 * API SÍNCRONA — use após o boot ter populado o cache.
 */
export function can(role: AppRole, permission: AppPermission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/**
 * Verifica múltiplas permissões com operador AND.
 */
export function canAll(role: AppRole, permissions: AppPermission[]): boolean {
  return permissions.every((p) => can(role, p));
}

/**
 * Verifica múltiplas permissões com operador OR.
 */
export function canAny(role: AppRole, permissions: AppPermission[]): boolean {
  return permissions.some((p) => can(role, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook React
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

interface UseRbacResult {
  role: AppRole;
  can: (permission: AppPermission) => boolean;
  canAll: (permissions: AppPermission[]) => boolean;
  canAny: (permissions: AppPermission[]) => boolean;
  isLoading: boolean;
}

/**
 * Hook que expõe o papel e as funções de verificação do usuário atual.
 *
 * @example
 * const { can } = useRbac();
 * if (!can('finance:delete_transaction')) return null;
 */
export function useRbac(): UseRbacResult {
  const [role, setRole] = useState<AppRole>(getCurrentRoleSync());
  const [isLoading, setIsLoading] = useState(cachedRole === null);

  useEffect(() => {
    if (cachedRole !== null) {
      setRole(cachedRole);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    resolveCurrentRole().then((r) => {
      if (!cancelled) {
        setRole(r);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  return {
    role,
    can:    (permission)  => can(role, permission),
    canAll: (permissions) => canAll(role, permissions),
    canAny: (permissions) => canAny(role, permissions),
    isLoading,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Guard Component
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';

interface PermissionGuardProps {
  permission: AppPermission;
  /** Modo: 'hide' remove do DOM; 'disable' renderiza desabilitado */
  mode?: 'hide' | 'disable';
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Componente declarativo de controle de acesso.
 *
 * @example
 * <PermissionGuard permission="finance:delete_transaction" mode="hide">
 *   <button>Excluir Transação</button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  mode = 'hide',
  fallback = null,
  children,
}: PermissionGuardProps): ReactNode {
  const { can: checkCan, isLoading } = useRbac();

  if (isLoading) return null;

  if (!checkCan(permission)) {
    if (mode === 'hide') return fallback;
    // mode === 'disable': renderiza children envoltos em wrapper desabilitado
    return (
      <span
        aria-disabled="true"
        title="Permissão insuficiente para esta ação"
        style={{ opacity: 0.35, pointerEvents: 'none', display: 'contents' }}
      >
        {children}
      </span>
    );
  }

  return children;
}
