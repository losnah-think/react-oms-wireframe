// 쇼핑몰/사이트 목업 데이터
export const mockShops = Array.from({length: 10}, (_, i) => ({
  id: i+1,
  shop_no: `SHOP${i+1}`,
  name: `쇼핑몰${i+1}`,
  site_id: i+1,
  mall_id: `MALL${i+1}`,
  active: i % 2 === 0
}));

export const mockShopSites = Array.from({length: 5}, (_, i) => ({
  id: i+1,
  name: `사이트${i+1}`,
  basic_logo_url: `https://example.com/logo${i+1}.png`,
  basic_main_url: `https://mall${i+1}.com`,
  site_type: ['cafe24','makeshop','storefarm','gsshop','interpark'][i%5],
  active: true
}));
