/**
 * Aferix Future Contracts
 *
 * Este arquivo contém as definições de tipos e interfaces para a expansão futura do Aferix.
 * Regra Crítica: Estes tipos são isolados e NÃO devem ser importados por componentes visuais
 * ou lógicas operacionais da versão atual para evitar acoplamento prematuro.
 */

/**
 * Escala do negócio para enquadramento e limites de recursos.
 */
export type BusinessScale = 'individual' | 'mei' | 'micro' | 'small';

/**
 * Níveis de acesso para suporte a equipes e multi-dispositivo.
 */
export type UserRole = 'owner' | 'admin' | 'attendant' | 'technician';

/**
 * Perfil fiscal completo para evolução MEI/Microempresa.
 */
export interface TaxProfile {
  taxId: string; // CNPJ ou CPF
  stateRegistration?: string;
  municipalRegistration?: string;
  taxRegime: 'simples_nacional' | 'lucro_presumido' | 'lucro_real';
  cnae?: string;
}

/**
 * Contrato para fornecedores externos e integração B2B.
 */
export interface Supplier {
  id: string;
  name: string;
  apiEndpoint?: string;
  authMethod?: 'none' | 'api_key' | 'oauth2';
  integrated: boolean;
}

/**
 * Origem do dado no catálogo para rastreabilidade.
 */
export type CatalogSource = 'local' | 'csv_import' | 'supplier_sync' | 'external_api';

/**
 * Provedores de integração externa (Contabilidade, Pagamentos, etc).
 */
export interface IntegrationProvider {
  id: string;
  provider: 'accounting' | 'payment_gateway' | 'crm' | 'erp';
  name: string;
  active: boolean;
}

/**
 * Formatos suportados para exportação profissional.
 */
export type ExportProvider = 'pdf_premium' | 'excel_full' | 'xml_fiscal' | 'csv_raw';

/**
 * Identificação de dispositivos para sincronização multi-ponto.
 */
export interface DeviceProfile {
  id: string;
  label: string;
  type: 'mobile_app' | 'desktop_web' | 'pos_terminal';
  lastSyncAt?: string;
}

/**
 * Metadados de controle de versão para sincronização cloud (CRDT-ready).
 */
export interface SyncSource {
  entityId: string;
  lastUpdateLocal: string;
  lastUpdateRemote?: string;
  version: number;
}
