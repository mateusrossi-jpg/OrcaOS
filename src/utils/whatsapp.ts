/**
 * Aferix WhatsApp Integration Utility
 * Provides a clean way to trigger WhatsApp messages with predefined text.
 */

export const sendWhatsAppMessage = (phone: string, message: string) => {
  // Remove non-numeric characters from phone
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Ensure it has a country code, if not, assume BR (55)
  const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
  
  const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export const formatWhatsAppLink = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
};
