/**
 * Utilitário para captura do endereço IP público do aparelho/dispositivo do usuário.
 * Tenta múltiplos serviços públicos com timeout curto para evitar atrasos no formulário.
 */

let cachedIp: string | null = null;

export async function fetchClientIp(): Promise<string> {
  if (cachedIp) return cachedIp;

  // Tentativa 1: api.ipify.org
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      if (data && data.ip) {
        cachedIp = data.ip;
        return data.ip;
      }
    }
  } catch (_err) {
    // Falha silenciosa, segue para fallback
  }

  // Tentativa 2: ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      if (data && data.ip) {
        cachedIp = data.ip;
        return data.ip;
      }
    }
  } catch (_err) {
    // Falha silenciosa
  }

  // Tentativa 3: icanhazip.com / api64.ipify.org
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch('https://api64.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      if (data && data.ip) {
        cachedIp = data.ip;
        return data.ip;
      }
    }
  } catch (_err) {
    // Falha silenciosa
  }

  return 'IP Dispositivo Móvel / Local';
}
