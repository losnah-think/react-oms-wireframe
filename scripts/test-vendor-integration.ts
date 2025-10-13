/**
 * 판매처 관리 ↔ 외부연동 데이터 연동 테스트
 * 
 * 브라우저 콘솔에서 실행:
 * 1. 개발자 도구 열기 (F12)
 * 2. Console 탭 선택
 * 3. 아래 코드를 복사하여 실행
 */

// ============================================
// 테스트 1: 판매처 목록 조회
// ============================================
console.log('=== 테스트 1: 판매처 목록 조회 ===');
import { mockVendors } from './src/data/mockVendors';
console.log('총 판매처 수:', mockVendors.length);
console.table(mockVendors.map(v => ({
  ID: v.id,
  이름: v.name,
  플랫폼: v.platform,
  활성: v.is_active ? '사용중' : '정지'
})));

// ============================================
// 테스트 2: 외부 연동 정보 조회
// ============================================
console.log('\n=== 테스트 2: 외부 연동 정보 조회 ===');
import { allVendorIntegrations, getIntegrationStatusCounts } from './src/data/mockVendorIntegrations';
console.log('총 연동 수:', allVendorIntegrations.length);
console.log('상태별 카운트:', getIntegrationStatusCounts());
console.table(allVendorIntegrations.map(i => ({
  연동ID: i.id,
  판매처ID: i.vendorId,
  판매처명: i.vendorName,
  플랫폼: i.platform,
  상태: i.status,
  상품수: i.productCount
})));

// ============================================
// 테스트 3: vendorId로 연동 정보 찾기
// ============================================
console.log('\n=== 테스트 3: vendorId로 연동 정보 찾기 ===');
import { getIntegrationsByVendorId } from './src/data/mockVendorIntegrations';

const vendorId = '1'; // 고도몰 샵
const integrations = getIntegrationsByVendorId(vendorId);
console.log(`판매처 ID ${vendorId}의 연동 정보:`, integrations);
console.table(integrations.map(i => ({
  연동ID: i.id,
  판매처명: i.vendorName,
  상태: i.status,
  상품수: i.productCount
})));

// ============================================
// 테스트 4: 연동 정보에서 판매처 정보 역참조
// ============================================
console.log('\n=== 테스트 4: 연동 정보 → 판매처 정보 역참조 ===');
const integration = allVendorIntegrations[0];
const vendor = mockVendors.find(v => v.id === integration.vendorId);
console.log('연동 정보:', {
  연동ID: integration.id,
  판매처ID: integration.vendorId,
  연동상태: integration.status
});
console.log('판매처 정보:', {
  ID: vendor?.id,
  이름: vendor?.name,
  플랫폼: vendor?.platform,
  API_URL: vendor?.settings?.site
});

// ============================================
// 테스트 5: 연동 상태 업데이트
// ============================================
console.log('\n=== 테스트 5: 연동 상태 업데이트 ===');
import { updateIntegrationStatus } from './src/data/mockVendorIntegrations';

const testIntegrationId = allVendorIntegrations[0].id;
console.log('업데이트 전:', allVendorIntegrations[0].status);

// 수집 시작
updateIntegrationStatus(testIntegrationId, '수집중', {
  syncProgress: 50,
  syncStartTime: new Date().toLocaleString('ko-KR')
});
console.log('업데이트 후:', allVendorIntegrations[0].status);
console.log('진행률:', allVendorIntegrations[0].syncProgress);

// ============================================
// 테스트 6: 플랫폼별 연동 현황
// ============================================
console.log('\n=== 테스트 6: 플랫폼별 연동 현황 ===');
const platformStats = allVendorIntegrations.reduce((acc, i) => {
  acc[i.platform] = (acc[i.platform] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.table(platformStats);

// ============================================
// 테스트 7: 판매처별 연동 개수
// ============================================
console.log('\n=== 테스트 7: 판매처별 연동 개수 ===');
const vendorIntegrationCounts = mockVendors.map(v => ({
  판매처ID: v.id,
  판매처명: v.name,
  연동개수: getIntegrationsByVendorId(v.id).length
}));
console.table(vendorIntegrationCounts);

// ============================================
// 테스트 8: 플랫폼 레이블 변환
// ============================================
console.log('\n=== 테스트 8: 플랫폼 레이블 변환 ===');
import { getPlatformLabel } from './src/types/vendor';
console.log('smartstore =>', getPlatformLabel('smartstore'));
console.log('coupang =>', getPlatformLabel('coupang'));
console.log('cafe24 =>', getPlatformLabel('cafe24'));

// ============================================
// 검증 결과
// ============================================
console.log('\n=== ✅ 데이터 연동 검증 결과 ===');
const validations = {
  '판매처 데이터 존재': mockVendors.length > 0,
  '연동 정보 존재': allVendorIntegrations.length > 0,
  '모든 연동이 유효한 vendorId 참조': allVendorIntegrations.every(i => 
    mockVendors.some(v => v.id === i.vendorId)
  ),
  '판매처 ID 중복 없음': new Set(mockVendors.map(v => v.id)).size === mockVendors.length,
  '연동 ID 중복 없음': new Set(allVendorIntegrations.map(i => i.id)).size === allVendorIntegrations.length
};

console.table(validations);

if (Object.values(validations).every(v => v === true)) {
  console.log('🎉 모든 검증 통과! 데이터 연동이 정상적으로 작동합니다.');
} else {
  console.error('❌ 일부 검증 실패. 위의 결과를 확인하세요.');
}
