import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Budget, BusinessProfile } from '../../../core/types/business';
import { calculateBudgetItemTotal } from '../../../core/pricing/budget';

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface BudgetPdfProps {
  budget: Partial<Budget>;
  businessProfile: BusinessProfile;
  total: number;
  subtotal: number;
  clientName: string;
}

// ==========================================
// MODELO 1: SIMPLES / MINIMALISTA
// ==========================================
const stylesSimple = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', color: '#333333' },
  header: { marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', paddingBottom: 10 },
  companyName: { fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 14, fontWeight: 'bold', marginVertical: 10, textTransform: 'uppercase' },
  clientText: { fontSize: 10, marginBottom: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 6, fontWeight: 'bold', fontSize: 9 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 6 },
  colDesc: { width: '50%' }, colQty: { width: '10%', textAlign: 'center' }, colUnit: { width: '20%', textAlign: 'right' }, colTotal: { width: '20%', textAlign: 'right', fontWeight: 'bold' },
  summarySection: { marginTop: 20, alignItems: 'flex-end' },
  summaryRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', paddingVertical: 4 },
  grandTotal: { flexDirection: 'row', width: 200, justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#333', marginTop: 4 },
  notes: { marginTop: 30, fontSize: 9, color: '#666' }
});

const SimplePdfTemplate = ({ budget, businessProfile, total, subtotal, clientName }: BudgetPdfProps) => {
  const items = budget.items || [];
  return (
    <Document title={`Orçamento - ${budget.title || 'Proposta'}`}>
      <Page size="A4" style={stylesSimple.page}>
        <View style={stylesSimple.header}>
          <Text style={stylesSimple.companyName}>{businessProfile.businessName || businessProfile.responsibleName || 'Profissional'}</Text>
          <Text>{businessProfile.phone} | {businessProfile.email}</Text>
        </View>
        <Text style={stylesSimple.title}>Orçamento: {budget.title}</Text>
        <View style={{ marginBottom: 20 }}>
          <Text style={stylesSimple.clientText}>Cliente: {clientName || 'Não informado'}</Text>
        </View>
        <View>
          <View style={stylesSimple.tableHeader}>
            <Text style={stylesSimple.colDesc}>DESCRIÇÃO</Text><Text style={stylesSimple.colQty}>QTD</Text><Text style={stylesSimple.colUnit}>UNITÁRIO</Text><Text style={stylesSimple.colTotal}>TOTAL</Text>
          </View>
          {items.map((item) => (
            <View style={stylesSimple.tableRow} key={item.id}>
              <Text style={stylesSimple.colDesc}>{item.description}</Text><Text style={stylesSimple.colQty}>{item.quantity}</Text><Text style={stylesSimple.colUnit}>{formatCurrency(item.unitPrice)}</Text><Text style={stylesSimple.colTotal}>{formatCurrency(calculateBudgetItemTotal(item))}</Text>
            </View>
          ))}
        </View>
        <View style={stylesSimple.summarySection}>
          <View style={stylesSimple.summaryRow}><Text>Subtotal</Text><Text>{formatCurrency(subtotal)}</Text></View>
          {!!budget.travelCost && <View style={stylesSimple.summaryRow}><Text>Deslocamento</Text><Text>{formatCurrency(budget.travelCost)}</Text></View>}
          {!!budget.additionalFees && <View style={stylesSimple.summaryRow}><Text>Taxas</Text><Text>{formatCurrency(budget.additionalFees)}</Text></View>}
          {!!budget.discount && <View style={stylesSimple.summaryRow}><Text>Desconto</Text><Text>-{formatCurrency(budget.discount)}</Text></View>}
          <View style={stylesSimple.grandTotal}><Text style={{ fontWeight: 'bold' }}>TOTAL</Text><Text style={{ fontWeight: 'bold' }}>{formatCurrency(total)}</Text></View>
        </View>
        <View style={stylesSimple.notes}>
          {budget.paymentTerms && <Text>Pagamento: {budget.paymentTerms}</Text>}
          {budget.validity && <Text>Validade: {budget.validity}</Text>}
        </View>
      </Page>
    </Document>
  );
};

// ==========================================
// MODELO 2: PROFISSIONAL / COMPLETO (O original refinado)
// ==========================================
const stylesProf = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', color: '#333333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#f5a400', paddingBottom: 15 },
  brandName: { fontSize: 24, fontWeight: 'bold', color: '#121212', letterSpacing: 1 },
  brandTagline: { fontSize: 9, color: '#f5a400', marginTop: 2, fontWeight: 'bold', textTransform: 'uppercase' },
  companyInfo: { textAlign: 'right', fontSize: 9, lineHeight: 1.4, color: '#666666' },
  documentTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: '#121212', textTransform: 'uppercase' },
  clientSection: { marginBottom: 25, padding: 15, backgroundColor: '#FAFAFA', borderRadius: 6, borderLeftWidth: 4, borderLeftColor: '#f5a400' },
  clientLabel: { fontSize: 8, color: '#999999', marginBottom: 5, fontWeight: 'bold' },
  clientName: { fontSize: 13, fontWeight: 'bold', color: '#121212' },
  table: { width: '100%', marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#18181b', color: '#FFFFFF', padding: 8, fontWeight: 'bold', fontSize: 9, borderRadius: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' },
  colDesc: { width: '50%', fontWeight: 'medium' }, colQty: { width: '10%', textAlign: 'center' }, colUnit: { width: '20%', textAlign: 'right' }, colTotal: { width: '20%', textAlign: 'right', fontWeight: 'bold' },
  summarySection: { marginTop: 30, flexDirection: 'row', justifyContent: 'flex-end' },
  summaryBlock: { width: 220 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  summaryLabel: { fontSize: 9, color: '#6B7280' }, summaryValue: { fontSize: 9, fontWeight: 'bold', color: '#374151' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, padding: 12, backgroundColor: '#f5a400', borderRadius: 6 },
  grandTotalLabel: { fontSize: 12, fontWeight: 'bold', color: '#000000' }, grandTotalValue: { fontSize: 14, fontWeight: 'bold', color: '#000000' },
  notesSection: { marginTop: 40 },
  notesTitle: { fontSize: 10, fontWeight: 'bold', color: '#121212', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f5a400', paddingBottom: 4 },
  notesContent: { fontSize: 9, lineHeight: 1.6, color: '#4B5563' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#9CA3AF', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 }
});

const ProfessionalPdfTemplate = ({ budget, businessProfile, total, subtotal, clientName }: BudgetPdfProps) => {
  const items = budget.items || [];
  return (
    <Document title={`Orçamento - ${budget.title || 'Proposta'}`}>
      <Page size="A4" style={stylesProf.page}>
        <View style={stylesProf.header}>
          <View>
            <Text style={stylesProf.brandName}>AFERIX</Text>
            <Text style={stylesProf.brandTagline}>Gestão e Orçamentos</Text>
          </View>
          <View style={stylesProf.companyInfo}>
            <Text style={{ fontWeight: 'bold', color: '#121212' }}>{businessProfile.businessName || businessProfile.responsibleName || 'Profissional'}</Text>
            {businessProfile.documentNumber && <Text>{businessProfile.documentNumber}</Text>}
            <Text>{businessProfile.phone}</Text>
            <Text>{businessProfile.email}</Text>
          </View>
        </View>
        <Text style={stylesProf.documentTitle}>Proposta Comercial</Text>
        <View style={stylesProf.clientSection}>
          <Text style={stylesProf.clientLabel}>CLIENTE</Text>
          <Text style={stylesProf.clientName}>{clientName || 'Cliente não informado'}</Text>
          <Text style={{ fontSize: 10, color: '#666666', marginTop: 4 }}>Ref: {budget.title}</Text>
        </View>
        <View style={stylesProf.table}>
          <View style={stylesProf.tableHeader}>
            <Text style={stylesProf.colDesc}>DESCRIÇÃO</Text><Text style={stylesProf.colQty}>QTD</Text><Text style={stylesProf.colUnit}>UNITÁRIO</Text><Text style={stylesProf.colTotal}>TOTAL</Text>
          </View>
          {items.map((item) => (
            <View style={stylesProf.tableRow} key={item.id}>
              <Text style={stylesProf.colDesc}>{item.description}</Text><Text style={stylesProf.colQty}>{item.quantity}</Text><Text style={stylesProf.colUnit}>{formatCurrency(item.unitPrice)}</Text><Text style={stylesProf.colTotal}>{formatCurrency(calculateBudgetItemTotal(item))}</Text>
            </View>
          ))}
        </View>
        <View style={stylesProf.summarySection}>
          <View style={stylesProf.summaryBlock}>
            <View style={stylesProf.summaryRow}><Text style={stylesProf.summaryLabel}>Subtotal</Text><Text style={stylesProf.summaryValue}>{formatCurrency(subtotal)}</Text></View>
            {!!budget.travelCost && <View style={stylesProf.summaryRow}><Text style={stylesProf.summaryLabel}>Deslocamento</Text><Text style={stylesProf.summaryValue}>{formatCurrency(budget.travelCost)}</Text></View>}
            {!!budget.additionalFees && <View style={stylesProf.summaryRow}><Text style={stylesProf.summaryLabel}>Taxas</Text><Text style={stylesProf.summaryValue}>{formatCurrency(budget.additionalFees)}</Text></View>}
            {!!budget.discount && <View style={stylesProf.summaryRow}><Text style={stylesProf.summaryLabel}>Desconto</Text><Text style={stylesProf.summaryValue}>-{formatCurrency(budget.discount)}</Text></View>}
            <View style={stylesProf.grandTotalRow}><Text style={stylesProf.grandTotalLabel}>TOTAL</Text><Text style={stylesProf.grandTotalValue}>{formatCurrency(total)}</Text></View>
          </View>
        </View>
        {(budget.paymentTerms || budget.validity || budget.commercialNotes) && (
          <View style={stylesProf.notesSection}>
            <Text style={stylesProf.notesTitle}>CONDIÇÕES E OBSERVAÇÕES</Text>
            {budget.paymentTerms && <View style={{ marginBottom: 6 }}><Text style={{ fontSize: 8, fontWeight: 'bold' }}>PAGAMENTO</Text><Text style={stylesProf.notesContent}>{budget.paymentTerms}</Text></View>}
            {budget.validity && <View style={{ marginBottom: 6 }}><Text style={{ fontSize: 8, fontWeight: 'bold' }}>VALIDADE</Text><Text style={stylesProf.notesContent}>{budget.validity}</Text></View>}
            {budget.commercialNotes && <View style={{ marginBottom: 6 }}><Text style={{ fontSize: 8, fontWeight: 'bold' }}>NOTAS</Text><Text style={stylesProf.notesContent}>{budget.commercialNotes}</Text></View>}
          </View>
        )}
        <Text style={stylesProf.footer}>Documento gerado pelo Aferix — ERP Financeiro para Autônomos.</Text>
      </Page>
    </Document>
  );
};

// ==========================================
// MODELO 3: COMERCIAL / APRESENTÁVEL
// ==========================================
// Similar ao Profissional por enquanto, será evoluído para ter capas ou layouts de proposta completos.
const CommercialPdfTemplate = ProfessionalPdfTemplate;


// ==========================================
// EXPORT PRINCIPAL: Roteia o template baseado na configuração do usuário (A ser implementada)
// ==========================================

export interface AferixBudgetPdfProps extends BudgetPdfProps {
  templateModel?: 'simple' | 'professional' | 'commercial';
}

export const AferixBudgetPdf = (props: AferixBudgetPdfProps) => {
  const model = props.templateModel || 'professional';
  
  if (model === 'simple') return <SimplePdfTemplate {...props} />;
  if (model === 'commercial') return <CommercialPdfTemplate {...props} />;
  
  return <ProfessionalPdfTemplate {...props} />;
};
