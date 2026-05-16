import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Budget, BusinessProfile } from '../../../core/types/business';
import { calculateBudgetItemTotal } from '../../../core/pricing/budget';

// Standard Font Setup
// In a real app we might use Font.register for custom fonts

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: 2,
    borderBottomColor: '#f59e0b',
    paddingBottom: 20,
  },
  brandBlock: {
    flexDirection: 'column',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#121212',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 9,
    color: '#f59e0b',
    marginTop: 2,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 9,
    lineHeight: 1.4,
    color: '#666666',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#121212',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#FDFCF6',
    borderRadius: 6,
    borderLeft: 4,
    borderLeftColor: '#f59e0b',
  },
  clientLabel: {
    fontSize: 8,
    color: '#999999',
    marginBottom: 5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#121212',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    color: '#FFFFFF',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  colDesc: { width: '50%', fontWeight: 'medium' },
  colQty: { width: '10%', textAlign: 'center' },
  colUnit: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right', fontWeight: 'bold' },
  
  summarySection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryBlock: {
    width: 220,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f59e0b',
    borderRadius: 6,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  
  notesSection: {
    marginTop: 40,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#121212',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f59e0b',
    paddingBottom: 4,
    width: '100%',
  },
  notesContent: {
    fontSize: 9,
    lineHeight: 1.6,
    color: '#4B5563',
  },
  
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  }
});

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface AferixBudgetPdfProps {
  budget: Partial<Budget>;
  businessProfile: BusinessProfile;
  total: number;
  subtotal: number;
  clientName: string;
}

export const AferixBudgetPdf = ({ budget, businessProfile, total, subtotal, clientName }: AferixBudgetPdfProps) => {
  const items = budget.items || [];
  
  return (
    <Document title={`Orçamento - ${budget.title || 'Proposta'}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>AFERIX</Text>
            <Text style={styles.brandTagline}>Base Sólida — Gestão Financeira</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={{ fontWeight: 'bold', color: '#121212', marginBottom: 2 }}>
              {businessProfile.businessName || businessProfile.responsibleName || 'Profissional'}
            </Text>
            {businessProfile.documentNumber ? <Text>{businessProfile.documentNumber}</Text> : null}
            <Text>{businessProfile.phone}</Text>
            <Text>{businessProfile.email}</Text>
            {businessProfile.address ? <Text>{businessProfile.address}</Text> : null}
          </View>
        </View>

        <Text style={styles.documentTitle}>Proposta Comercial</Text>

        {/* Client Info */}
        <View style={styles.clientSection}>
          <Text style={styles.clientLabel}>CLIENTE</Text>
          <Text style={styles.clientName}>{clientName || 'Cliente não informado'}</Text>
          <Text style={{ fontSize: 10, color: '#666666', marginTop: 4 }}>
            Proposta: {budget.title || 'Serviços de Manutenção/Instalação'}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>DESCRIÇÃO</Text>
            <Text style={styles.colQty}>QTD</Text>
            <Text style={styles.colUnit}>UNITÁRIO</Text>
            <Text style={styles.colTotal}>TOTAL</Text>
          </View>
          
          {items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(calculateBudgetItemTotal(item))}</Text>
            </View>
          ))}
          
          {items.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.colDesc, { color: '#999999', fontStyle: 'italic' }]}>Nenhum item adicionado.</Text>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBlock}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {budget.travelCost ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Deslocamento</Text>
                <Text style={styles.summaryValue}>{formatCurrency(budget.travelCost)}</Text>
              </View>
            ) : null}
            {budget.additionalFees ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxas</Text>
                <Text style={styles.summaryValue}>{formatCurrency(budget.additionalFees)}</Text>
              </View>
            ) : null}
            {budget.discount ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Desconto</Text>
                <Text style={styles.summaryValue}>-{formatCurrency(budget.discount)}</Text>
              </View>
            ) : null}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {(budget.paymentTerms || budget.validity || budget.commercialNotes) && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>CONDIÇÕES E OBSERVAÇÕES</Text>
            {budget.paymentTerms ? (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#666666' }}>PAGAMENTO</Text>
                <Text style={styles.notesContent}>{budget.paymentTerms}</Text>
              </View>
            ) : null}
            {budget.validity ? (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#666666' }}>VALIDADE</Text>
                <Text style={styles.notesContent}>{budget.validity}</Text>
              </View>
            ) : null}
            {budget.commercialNotes ? (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#666666' }}>NOTAS</Text>
                <Text style={styles.notesContent}>{budget.commercialNotes}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Documento gerado pelo Aferix — ERP Financeiro para Autônomos. www.aferix.com.br
        </Text>
      </Page>
    </Document>
  );
};
