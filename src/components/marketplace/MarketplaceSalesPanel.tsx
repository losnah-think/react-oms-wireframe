import React from 'react';

type ChannelRow = {
  channelId: string;
  channelName: string;
  code: string;
  price?: number;
  stock?: number;
  created_at?: string;
};

type Props = {
  product?: any;
  channels?: ChannelRow[];
  title?: string;
};

const MarketplaceSalesPanel: React.FC<Props> = ({ product, channels, title }) => {
  const rows: ChannelRow[] = React.useMemo(() => {
    if (channels && channels.length) return channels;
    if (!product) return [];
    // derive from product.externalMall or product.seller_codes
    if (product.seller_codes && typeof product.seller_codes === 'object') {
      return Object.entries(product.seller_codes).map(([k, v]) => ({ channelId: k, channelName: k, code: String(v) }));
    }
    if (product.externalMall && product.externalMall.external_sku) {
      return [{ channelId: product.externalMall.platformName || product.externalMall.platform || 'external', channelName: product.externalMall.platformName || product.externalMall.platform || 'external', code: product.externalMall.external_sku, price: product.selling_price ?? product.price ?? undefined }];
    }
    // fallback to empty
    return [];
  }, [product, channels]);

  if (!rows.length) return null;

  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title || '판매처별 판매 정보'}</h3>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.channelId + '::' + r.code} className="p-2 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{r.channelName}</div>
              <div className="text-xs text-gray-600">SKU: {r.code}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{r.price != null ? `₩${r.price.toLocaleString()}` : '—'}</div>
              <div className="text-xs text-gray-600">재고: {typeof r.stock === 'number' ? r.stock : '—'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceSalesPanel;
