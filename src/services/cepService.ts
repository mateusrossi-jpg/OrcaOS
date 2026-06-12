/**
 * CEP AUTO-COMPLETE SERVICE
 * Provides address derivation from Brazilian postal codes.
 */

export interface AddressResult {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export async function fetchAddressByCEP(cep: string): Promise<AddressResult | null> {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();
    
    if (data.erro) return null;
    
    return data;
  } catch (err) {
    console.error('ViaCEP failed:', err);
    return null;
  }
}
