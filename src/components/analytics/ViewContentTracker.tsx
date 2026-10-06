'use client';

import { useEffect } from 'react';
import { trackMetaEvent } from '@/lib/metaPixel';

export default function ViewContentTracker({ productId, name, price }: { productId: string; name: string; price: number }) {
  useEffect(() => {
    trackMetaEvent('ViewContent', { content_ids: [productId], content_name: name, content_type: 'product', value: price, currency: 'GTQ' });
  }, [productId, name, price]);
  return null;
}
