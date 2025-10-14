/**
 * 로그 사용 예시
 * 
 * 실제 상품/판매처/설정 등에서 로그를 기록하는 방법
 */

import logger from '../lib/logger';

// 현재 로그인한 사용자 정보 (실제로는 세션/컨텍스트에서 가져옴)
const getCurrentUser = () => ({
  id: 'user-123',
  name: '김철수',
});

/**
 * 상품 등록 시 로그
 */
export const logProductCreate = async (productId: string, productName: string) => {
  const user = getCurrentUser();
  await logger.logProduct(
    user.id,
    user.name,
    'product_create',
    productId,
    `상품 등록: ${productName}`,
    { productName }
  );
};

/**
 * 상품 수정 시 로그
 */
export const logProductUpdate = async (
  productId: string, 
  productName: string, 
  changes: Record<string, { from: any; to: any }>
) => {
  const user = getCurrentUser();
  await logger.logProduct(
    user.id,
    user.name,
    'product_update',
    productId,
    `상품 수정: ${productName}`,
    { productName, changes }
  );
};

/**
 * 상품 삭제 시 로그
 */
export const logProductDelete = async (productId: string, productName: string) => {
  const user = getCurrentUser();
  await logger.logProduct(
    user.id,
    user.name,
    'product_delete',
    productId,
    `상품 삭제: ${productName}`,
    { productName }
  );
};

/**
 * 상품 송신 시 로그
 */
export const logProductSend = async (
  productIds: string[],
  vendorName: string,
  count: number
) => {
  const user = getCurrentUser();
  await logger.log({
    userId: user.id,
    userName: user.name,
    category: 'product',
    action: 'product_send',
    target: '상품',
    description: `${vendorName}로 상품 ${count}개 송신`,
    details: { productIds, vendorName, count },
    level: 'info',
  });
};

/**
 * 판매처 등록 시 로그
 */
export const logVendorCreate = async (vendorId: string, vendorName: string) => {
  const user = getCurrentUser();
  await logger.logVendor(
    user.id,
    user.name,
    'vendor_create',
    vendorId,
    `판매처 등록: ${vendorName}`,
    { vendorName }
  );
};

/**
 * 판매처 정보 수정 시 로그
 */
export const logVendorUpdate = async (
  vendorId: string,
  vendorName: string,
  changes: Record<string, { from: any; to: any }>
) => {
  const user = getCurrentUser();
  await logger.logVendor(
    user.id,
    user.name,
    'vendor_update',
    vendorId,
    `판매처 수정: ${vendorName}`,
    { vendorName, changes }
  );
};

/**
 * 판매처 삭제 시 로그
 */
export const logVendorDelete = async (vendorId: string, vendorName: string) => {
  const user = getCurrentUser();
  await logger.logVendor(
    user.id,
    user.name,
    'vendor_delete',
    vendorId,
    `판매처 삭제: ${vendorName}`,
    { vendorName }
  );
};

/**
 * 카테고리 매핑 시 로그
 */
export const logCategoryMapping = async (
  vendorId: string,
  vendorName: string,
  mappings: Array<{ source: string; target: string }>
) => {
  const user = getCurrentUser();
  await logger.logVendor(
    user.id,
    user.name,
    'vendor_category_map',
    vendorId,
    `${vendorName} 카테고리 매핑 설정`,
    { vendorName, mappingsCount: mappings.length, mappings }
  );
};

/**
 * 환경설정 변경 시 로그
 */
export const logSettingsUpdate = async (
  settingType: string,
  description: string,
  changes?: Record<string, { from: any; to: any }>
) => {
  const user = getCurrentUser();
  await logger.logSettings(
    user.id,
    user.name,
    'settings_update',
    `${settingType}: ${description}`,
    changes
  );
};

/**
 * 브랜드 생성 시 로그
 */
export const logBrandCreate = async (brandName: string) => {
  const user = getCurrentUser();
  await logger.logSettings(
    user.id,
    user.name,
    'settings_brand_create',
    `브랜드 생성: ${brandName}`,
    { brandName }
  );
};

/**
 * 외부연동 생성 시 로그
 */
export const logIntegrationCreate = async (
  integrationId: string,
  vendorName: string,
  platform: string
) => {
  const user = getCurrentUser();
  await logger.logIntegration(
    user.id,
    user.name,
    'integration_create',
    integrationId,
    `외부연동 생성: ${vendorName} (${platform})`,
    { vendorName, platform }
  );
};

/**
 * 외부연동 동기화 시 로그
 */
export const logIntegrationSync = async (
  integrationId: string,
  vendorName: string,
  result: { success: boolean; productCount?: number; error?: string }
) => {
  const user = getCurrentUser();
  await logger.log({
    userId: user.id,
    userName: user.name,
    category: 'integration',
    action: 'integration_sync',
    target: '외부연동',
    targetId: integrationId,
    description: `${vendorName} 동기화 ${result.success ? '성공' : '실패'}`,
    details: { vendorName, ...result },
    level: result.success ? 'info' : 'error',
  });
};

/**
 * 로그인 시 로그
 */
export const logLogin = async (userId: string, userName: string) => {
  await logger.logAuth(userId, userName, 'login', `로그인: ${userName}`);
};

/**
 * 로그아웃 시 로그
 */
export const logLogout = async (userId: string, userName: string) => {
  await logger.logAuth(userId, userName, 'logout', `로그아웃: ${userName}`);
};

/**
 * 로그인 실패 시 로그
 */
export const logLoginFailed = async (email: string, reason: string) => {
  await logger.log({
    userId: 'unknown',
    userName: email,
    category: 'auth',
    action: 'login_failed',
    target: '시스템',
    description: `로그인 실패: ${email} (${reason})`,
    details: { email, reason },
    level: 'warning',
  });
};

// 사용 예시:
// 
// 상품 등록 후:
// await logProductCreate(newProduct.id, newProduct.name);
//
// 상품 수정 후:
// await logProductUpdate(product.id, product.name, {
//   price: { from: 10000, to: 12000 },
//   stock: { from: 100, to: 150 }
// });
//
// 판매처 송신 후:
// await logProductSend(selectedProductIds, '네이버 스마트스토어', selectedProductIds.length);
//
// 설정 변경 후:
// await logSettingsUpdate('브랜드', '브랜드 이름 변경', {
//   name: { from: '구 브랜드', to: '신 브랜드' }
// });
