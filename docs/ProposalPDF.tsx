import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Registro de fontes profissionais a partir do diretório public
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Inter-Medium.ttf', fontWeight: 'medium' },
    { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 'semibold' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter', // A fonte "Inter" agora é herdada em todo o documento
    color: '#1a1f24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  brandArea: {
    flexDirection: 'column',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    color: '#1a1f24',
  },
  brandDot: {
    color: '#00b8c2', // Aferix Teal
  },
  documentType: {
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  clientInfoArea: {
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  textBase: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#374151',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemDescription: {
    fontSize: 11,
    color: '#1a1f24',
    width: '70%',
  },
  itemValue: {
    fontSize: 11,
    color: '#1a1f24',
    fontWeight: 'bold',
    width: '30%',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginRight: 20,
    paddingTop: 4,
  },
  totalValue: {
    fontSize: 18,
    color: '#1a1f24',
    fontWeight: 'bold',
  },
});

export const ProposalPDF = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.brandArea}>
          <Text style={styles.brandName}>Aferix<Text style={styles.brandDot}>.</Text></Text>
          <Text style={styles.documentType}>Proposta Comercial</Text>
        </View>
        <View>
          <Text style={{ fontSize: 10, color: '#6B7280' }}>Data: 14/05/2026</Text>
          <Text style={{ fontSize: 10, color: '#6B7280' }}>Validade: 15 dias</Text>
        </View>
      </View>

      <View style={styles.clientInfoArea}>
        <Text style={styles.sectionLabel}>Preparado para</Text>
        <Text style={styles.textBase}>Cliente Exemplo LTDA</Text>
        <Text style={styles.textBase}>contato@exemplo.com.br</Text>
      </View>

      <View style={{ marginBottom: 40 }}>
        <Text style={styles.sectionLabel}>Escopo do Serviço</Text>
        <Text style={styles.textBase}>
          Instalação e configuração de infraestrutura técnica e dimensionamento de cargas, 
          incluindo fornecimento de mão de obra e deslocamento.
        </Text>
      </View>

      <View>
        <Text style={styles.sectionLabel}>Investimento</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemDescription}>Mão de Obra e Instalação Técnica</Text>
          <Text style={styles.itemValue}>R$ 2.500,00</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemDescription}>Materiais de Infraestrutura</Text>
          <Text style={styles.itemValue}>R$ 850,00</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Investimento Total</Text>
          <Text style={styles.totalValue}>R$ 3.350,00</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default ProposalPDF;