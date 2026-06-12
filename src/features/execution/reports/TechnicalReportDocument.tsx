import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Asset } from '../../../domain/asset';
import { AssetExecution } from '../../../domain/assetExecution';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', color: '#333333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#f5a400', paddingBottom: 15 },
  brandName: { fontSize: 22, fontWeight: 'bold', color: '#121212', letterSpacing: 1 },
  brandTagline: { fontSize: 8, color: '#f5a400', marginTop: 2, fontWeight: 'bold', textTransform: 'uppercase' },
  companyInfo: { textAlign: 'right', fontSize: 9, lineHeight: 1.4, color: '#666666' },
  
  docTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: '#121212', textTransform: 'uppercase', textAlign: 'center' },
  
  infoSection: { marginBottom: 20, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#f5a400' },
  infoLabel: { fontSize: 7, color: '#9CA3AF', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 10, fontWeight: 'bold', color: '#111827' },
  
  sectionTitle: { fontSize: 11, fontWeight: 'bold', backgroundColor: '#111827', color: '#FFFFFF', padding: 6, marginTop: 20, marginBottom: 10, borderRadius: 2, textTransform: 'uppercase' },
  
  assetBlock: { marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 15 },
  assetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  assetName: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  assetTag: { fontSize: 9, color: '#f5a400', fontWeight: 'bold' },
  
  table: { width: '100%', marginTop: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 6, alignItems: 'center' },
  checkIcon: { width: 10, height: 10, marginRight: 8 },
  itemDesc: { flex: 1, fontSize: 9 },
  itemStatus: { width: 80, textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
  statusCompliant: { color: '#059669' },
  statusFail: { color: '#DC2626' },
  statusNA: { color: '#6B7280' },
  
  measurementGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 10 },
  measurementBox: { width: '30%', padding: 8, backgroundColor: '#F3F4F6', borderRadius: 4 },
  measureLabel: { fontSize: 7, color: '#6B7280', marginBottom: 2 },
  measureValue: { fontSize: 10, fontWeight: 'bold', color: '#111827' },
  
  recommendation: { marginTop: 10, padding: 10, backgroundColor: '#FFFBEB', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  recommendationTitle: { fontSize: 8, fontWeight: 'bold', color: '#92400E', marginBottom: 4, textTransform: 'uppercase' },
  recommendationText: { fontSize: 9, color: '#78350F', lineHeight: 1.4 },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#9CA3AF', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  signatureSection: { marginTop: 40, alignItems: 'center' },
  signatureImage: { width: 150, height: 60, marginBottom: 5 },
  signatureLine: { width: 200, borderTopWidth: 1, borderTopColor: '#333333', marginTop: 10 },
  signatureLabel: { fontSize: 8, color: '#666666', marginTop: 4 }
});

interface TechnicalReportProps {
  clientName: string;
  workOrderTitle: string;
  date: string;
  businessProfile: any;
  assets: Asset[];
  executions: Record<string, AssetExecution>;
  signature?: string | null;
}

export const TechnicalReportDocument = ({ 
  clientName, 
  workOrderTitle, 
  date, 
  businessProfile, 
  assets, 
  executions, 
  signature 
}: TechnicalReportProps) => {
  return (
    <Document title={`Laudo Técnico - ${clientName}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>AFERIX</Text>
            <Text style={styles.brandTagline}>Inteligência em Manutenção</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={{ fontWeight: 'bold', color: '#121212' }}>{businessProfile.businessName || 'Profissional'}</Text>
            <Text>{businessProfile.phone}</Text>
            <Text>{businessProfile.email}</Text>
          </View>
        </View>

        <Text style={styles.docTitle}>Relatório de Inspeção Técnica</Text>

        {/* Info Geral */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <View style={[styles.infoSection, { flex: 2 }]}>
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue}>{clientName}</Text>
          </View>
          <View style={[styles.infoSection, { flex: 1 }]}>
            <Text style={styles.infoLabel}>Data de Emissão</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Serviço Realizado</Text>
          <Text style={styles.infoValue}>{workOrderTitle}</Text>
        </View>

        <Text style={styles.sectionTitle}>Detalhamento por Ativo</Text>

        {assets.map((asset) => {
          const ex = executions[asset.id];
          if (!ex) return null;

          return (
            <View key={asset.id} style={styles.assetBlock} wrap={false}>
              <View style={styles.assetHeader}>
                <View>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={{ fontSize: 8, color: '#6B7280' }}>{asset.location}</Text>
                </View>
                <Text style={styles.assetTag}>{asset.tag}</Text>
              </View>

              {/* Medições */}
              {Object.keys(ex.measurements).length > 0 && (
                <View style={styles.measurementGrid}>
                  {Object.entries(ex.measurements).map(([key, val]) => (
                    <View key={key} style={styles.measurementBox}>
                      <Text style={styles.measureLabel}>{key.replace('m-', '').replace(/-/g, ' ')}</Text>
                      <Text style={styles.measureValue}>{val}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Checklist */}
              <View style={styles.table}>
                {ex.checklistResults?.map((res, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={styles.itemDesc}>{res.description}</Text>
                    <Text style={[
                      styles.itemStatus,
                      res.status === 'compliant' ? styles.statusCompliant :
                      res.status === 'non-compliant' ? styles.statusFail :
                      styles.statusNA
                    ]}>
                      {res.status === 'compliant' ? 'CONFORME' : 
                       res.status === 'non-compliant' ? 'FALHA' : 'N/A'}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Parecer Técnico */}
              {ex.recommendation && (
                <View style={styles.recommendation}>
                  <Text style={styles.recommendationTitle}>Parecer Técnico / Recomendação</Text>
                  <Text style={styles.recommendationText}>{ex.recommendation}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Assinatura */}
        {signature && (
          <View style={styles.signatureSection} wrap={false}>
            <Image src={signature} style={styles.signatureImage} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Assinatura do Responsável / Cliente</Text>
          </View>
        )}

        <Text style={styles.footer}>Este laudo é um documento técnico oficial gerado pelo sistema Aferix.</Text>
      </Page>
    </Document>
  );
};
