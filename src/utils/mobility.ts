export function openExternalGPS(addressOrCoords: string) {
  if (!addressOrCoords) return;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressOrCoords)}`;
  window.open(url, '_blank');
}

export function openWhatsApp(phone: string, message?: string) {
  if (!phone) return;
  const cleanPhone = phone.replace(/\D/g, '');
  const text = message ? `&text=${encodeURIComponent(message)}` : '';
  const url = `https://wa.me/55${cleanPhone}?${text}`;
  window.open(url, '_blank');
}
