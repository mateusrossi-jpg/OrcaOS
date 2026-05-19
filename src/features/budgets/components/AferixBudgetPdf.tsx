import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { Budget, BusinessProfile } from '../../../core/types/business';
import { calculateBudgetItemTotal } from '../../../core/pricing/budget';

// Registrar fontes se necessário, mas Helvetica é padrão e segura para exportação limpa.
// Usaremos Helvetica para máxima compatibilidade e legibilidade.

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

function categoryLabel(category: string): string {
  if (category === 'labor') return 'Mão de obra';
  if (category === 'material') return 'Material';
  return 'Outro';
}

interface BudgetPdfProps {
  budget: Partial<Budget>;
  businessProfile: BusinessProfile;
  total: number;
  subtotal: number;
  clientName: string;
}

const BRAND_COLOR = '#f5a400';
const TEXT_DARK = '#18181b';
const TEXT_MUTED = '#71717a';
const BORDER_COLOR = '#e4e4e7';

const styles = StyleSheet.create({
  page: {
    padding: '40 50',
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    color: TEXT_DARK,
  },
  
  // Header / Empresa
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  logoContainer: {
    width: 140,
  },
  logo: {
    width: '100%',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 8,
    color: TEXT_MUTED,
    lineHeight: 1.4,
  },
  
  // Título e Meta
  docMeta: {
    textAlign: 'right',
  },
  docTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  docId: {
    fontSize: 9,
    color: TEXT_MUTED,
  },

  // Seção do Cliente e Serviço
  contextSection: {
    flexDirection: 'row',
    marginBottom: 35,
    gap: 40,
  },
  contextBlock: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 4,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contextText: {
    fontSize: 9,
    color: TEXT_MUTED,
    lineHeight: 1.4,
  },

  // Tabela de Itens
  table: {
    marginTop: 10,
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: TEXT_DARK,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCol: {
    fontSize: 8,
    fontWeight: 'bold',
    color: TEXT_DARK,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    alignItems: 'center',
  },
  cellDesc: { width: '45%' },
  cellCat: { width: '15%', textAlign: 'center' },
  cellQty: { width: '10%', textAlign: 'center' },
  cellUnit: { width: '15%', textAlign: 'right' },
  cellTotal: { width: '15%', textAlign: 'right' },
  
  itemTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  itemSub: { fontSize: 8, color: TEXT_MUTED },
  cellText: { fontSize: 9, color: TEXT_DARK },

  // Resumo Financeiro
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  summaryContainer: {
    width: 200,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: TEXT_MUTED,
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: TEXT_DARK,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND_COLOR,
  },

  // Observações e Notas
  notesSection: {
    marginTop: 40,
  },
  notesBlock: {
    marginBottom: 15,
  },
  notesContent: {
    fontSize: 9,
    color: TEXT_MUTED,
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 7,
    color: '#a1a1aa',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 15,
  }
});

const PremiumPdfTemplate = ({ budget, businessProfile, total, subtotal, clientName }: BudgetPdfProps) => {
  const items = budget.items || [];
  const profileName = businessProfile.businessName || businessProfile.responsibleName || 'Profissional';
  const logoSource = businessProfile.logoDataUrl || businessProfile.logoUrl;

  return (
    <Document title={`Proposta Comercial - ${clientName || 'Cliente'}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {logoSource ? (
              <Image src={logoSource} style={styles.logo} />
            ) : (
              <Text style={styles.companyName}>{profileName}</Text>
            )}
            <View style={styles.companyInfo}>
              {logoSource && <Text style={{ fontWeight: 'bold', color: TEXT_DARK }}>{profileName}</Text>}
              {businessProfile.documentNumber && <Text>{businessProfile.documentNumber}</Text>}
              <Text>{businessProfile.phone}</Text>
              <Text>{businessProfile.email}</Text>
              {businessProfile.address && <Text>{businessProfile.address}</Text>}
            </View>
          </View>
          <View style={styles.docMeta}>
            <Text style={styles.docTitle}>Orçamento</Text>
            <Text style={styles.docId}>Emitido em {new Date().toLocaleDateString('pt-BR')}</Text>
          </View>
        </View>

        {/* Context: Cliente e Serviço */}
        <View style={styles.contextSection}>
          <View style={styles.contextBlock}>
            <Text style={styles.sectionLabel}>Para o Cliente</Text>
            <Text style={styles.clientName}>{clientName || 'Não informado'}</Text>
            {activeClientContact(budget) && <Text style={styles.contextText}>{activeClientContact(budget)}</Text>}
          </View>
          <View style={styles.contextBlock}>
            <Text style={styles.sectionLabel}>Sobre o Serviço</Text>
            <Text style={[styles.clientName, { fontSize: 11 }]}>{budget.title || 'Proposta de Serviço'}</Text>
            {budget.executionDeadline && <Text style={styles.contextText}>Prazo: {budget.executionDeadline}</Text>}
          </View>
        </View>

        {/* Tabela de Itens */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCol, styles.cellDesc]}>Descrição dos Serviços / Materiais</Text>
            <Text style={[styles.tableHeaderCol, styles.cellCat]}>Tipo</Text>
            <Text style={[styles.tableHeaderCol, styles.cellQty]}>Qtd</Text>
            <Text style={[styles.tableHeaderCol, styles.cellUnit]}>Unitário</Text>
            <Text style={[styles.tableHeaderCol, styles.cellTotal]}>Total</Text>
          </View>
          {items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.cellDesc}>
                <Text style={styles.itemTitle}>{item.description}</Text>
              </View>
              <Text style={[styles.cellText, styles.cellCat]}>{categoryLabel(item.category)}</Text>
              <Text style={[styles.cellText, styles.cellQty]}>{item.quantity}</Text>
              <Text style={[styles.cellText, styles.cellUnit]}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.cellText, styles.cellTotal, { fontWeight: 'bold' }]}>{formatCurrency(calculateBudgetItemTotal(item))}</Text>
            </View>
          ))}
        </View>

        {/* Resumo Financeiro */}
        <View style={styles.summarySection}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {!!budget.travelCost && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Deslocamento</Text>
                <Text style={styles.summaryValue}>{formatCurrency(budget.travelCost)}</Text>
              </View>
            )}
            {!!budget.additionalFees && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxas Adicionais</Text>
                <Text style={styles.summaryValue}>{formatCurrency(budget.additionalFees)}</Text>
              </View>
            )}
            {!!budget.discount && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Desconto aplicado</Text>
                <Text style={[styles.summaryValue, { color: '#ef4444' }]}>-{formatCurrency(budget.discount)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Investimento Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* Condições e Observações */}
        <View style={styles.notesSection}>
          {budget.paymentTerms && (
            <View style={styles.notesBlock}>
              <Text style={styles.sectionLabel}>Forma de Pagamento</Text>
              <Text style={styles.notesContent}>{budget.paymentTerms}</Text>
            </View>
          )}
          {budget.validity && (
            <View style={styles.notesBlock}>
              <Text style={styles.sectionLabel}>Validade da Proposta</Text>
              <Text style={styles.notesContent}>{budget.validity}</Text>
            </View>
          )}
          {budget.guarantee && (
            <View style={styles.notesBlock}>
              <Text style={styles.sectionLabel}>Garantia</Text>
              <Text style={styles.notesContent}>{budget.guarantee}</Text>
            </View>
          )}
          {budget.commercialNotes && (
            <View style={styles.notesBlock}>
              <Text style={styles.sectionLabel}>Observações Adicionais</Text>
              <Text style={styles.notesContent}>{budget.commercialNotes}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Documento comercial gerado via Aferix — Soluções para Profissionais Autônomos.
        </Text>
      </Page>
    </Document>
  );
};

function activeClientContact(budget: Partial<Budget>): string | null {
  // Simplificação para o PDF, se houver campos de contato no futuro.
  return null;
}

export interface AferixBudgetPdfProps extends BudgetPdfProps {
  templateModel?: string;
}

export const AferixBudgetPdf = (props: AferixBudgetPdfProps) => {
  return <PremiumPdfTemplate {...props} />;
};
