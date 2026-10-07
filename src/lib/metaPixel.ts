export type MetaEventData = Record<string, string | number | string[] | undefined>;

export function trackMetaEvent(eventName: string, data?: MetaEventData) {
  try {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    if (data) window.fbq('track', eventName, data);
    else window.fbq('track', eventName);
  } catch (err) {
    console.warn('[MetaPixel] Error al emitir evento:', err);
  }
}
