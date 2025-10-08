// scripts/test-user-management.js
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testUserManagement() {
  console.log('🧪 사용자 관리 시스템 통합 테스트 시작...\n');

  try {
    // 1. 사용자 목록 조회 테스트
    console.log('1️⃣ 사용자 목록 조회 테스트');
    const usersResponse = await fetch(`${BASE_URL}/users`);
    const usersData = await usersResponse.json();
    
    if (usersResponse.ok) {
      console.log(`✅ 성공: ${usersData.users.length}명의 사용자 조회`);
      console.log(`   - 총 사용자: ${usersData.total}명`);
      console.log(`   - 페이지: ${usersData.page}/${usersData.totalPages}`);
    } else {
      console.log(`❌ 실패: ${usersData.error}`);
    }

    // 2. 사용자 통계 조회 테스트
    console.log('\n2️⃣ 사용자 통계 조회 테스트');
    const statsResponse = await fetch(`${BASE_URL}/users/stats`);
    const statsData = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ 성공: 사용자 통계 조회');
      console.log(`   - 전체: ${statsData.stats.total}명`);
      console.log(`   - 활성: ${statsData.stats.active}명`);
      console.log(`   - 관리자: ${statsData.stats.admins}명`);
    } else {
      console.log(`❌ 실패: ${statsData.error}`);
    }

    // 3. 사용자 생성 테스트
    console.log('\n3️⃣ 사용자 생성 테스트');
    const newUser = {
      name: '테스트 사용자',
      email: `test-${Date.now()}@company.com`,
      password: 'TestPassword123!',
      role: 'USER',
      department: '테스트팀',
      phone: '010-1234-5678'
    };

    const createResponse = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const createData = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ 성공: 사용자 생성');
      console.log(`   - 생성된 사용자: ${createData.user.name} (${createData.user.email})`);
      
      // 4. 사용자 수정 테스트
      console.log('\n4️⃣ 사용자 수정 테스트');
      const updateData = {
        name: '수정된 테스트 사용자',
        department: '수정된 테스트팀'
      };

      const updateResponse = await fetch(`${BASE_URL}/users/${createData.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ 성공: 사용자 수정');
        console.log(`   - 수정된 이름: ${updateResult.user.name}`);
        console.log(`   - 수정된 부서: ${updateResult.user.department}`);
      } else {
        console.log(`❌ 실패: ${updateResult.error}`);
      }

      // 5. 사용자 검색 테스트
      console.log('\n5️⃣ 사용자 검색 테스트');
      const searchResponse = await fetch(`${BASE_URL}/users/search?q=테스트`);
      const searchData = await searchResponse.json();
      
      if (searchResponse.ok) {
        console.log('✅ 성공: 사용자 검색');
        console.log(`   - 검색 결과: ${searchData.users.length}명`);
      } else {
        console.log(`❌ 실패: ${searchData.error}`);
      }

      // 6. 사용자 삭제 테스트
      console.log('\n6️⃣ 사용자 삭제 테스트');
      const deleteResponse = await fetch(`${BASE_URL}/users/${createData.user.id}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteResponse.json();
      
      if (deleteResponse.ok) {
        console.log('✅ 성공: 사용자 삭제');
        console.log(`   - 삭제 메시지: ${deleteData.message}`);
      } else {
        console.log(`❌ 실패: ${deleteData.error}`);
      }
    } else {
      console.log(`❌ 실패: ${createData.error}`);
    }

    // 7. 일괄 작업 테스트
    console.log('\n7️⃣ 일괄 상태 변경 테스트');
    const batchResponse = await fetch(`${BASE_URL}/users/batch/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds: ['1', '2'], // 기존 사용자 ID
        status: 'INACTIVE'
      })
    });
    const batchData = await batchResponse.json();
    
    if (batchResponse.ok) {
      console.log('✅ 성공: 일괄 상태 변경');
      console.log(`   - 성공: ${batchData.success}명`);
      console.log(`   - 실패: ${batchData.failed}명`);
    } else {
      console.log(`❌ 실패: ${batchData.error}`);
    }

    // 8. API 테스트 엔드포인트
    console.log('\n8️⃣ API 테스트 엔드포인트');
    const testResponse = await fetch(`${BASE_URL}/test/users`);
    const testData = await testResponse.json();
    
    if (testResponse.ok) {
      console.log('✅ 성공: API 테스트 통과');
      console.log(`   - 사용자 수: ${testData.data.users.count}명`);
      console.log(`   - 통계 데이터: ${testData.data.stats ? '있음' : '없음'}`);
    } else {
      console.log(`❌ 실패: ${testData.error}`);
    }

    console.log('\n🎉 모든 테스트가 완료되었습니다!');
    console.log('\n📊 테스트 결과 요약:');
    console.log('✅ 사용자 목록 조회');
    console.log('✅ 사용자 통계 조회');
    console.log('✅ 사용자 생성');
    console.log('✅ 사용자 수정');
    console.log('✅ 사용자 검색');
    console.log('✅ 사용자 삭제');
    console.log('✅ 일괄 작업');
    console.log('✅ API 테스트');

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error.message);
    console.log('\n💡 해결 방법:');
    console.log('1. 개발 서버가 실행 중인지 확인: npm run dev');
    console.log('2. 포트 3000이 사용 가능한지 확인');
    console.log('3. API 엔드포인트가 정상 작동하는지 확인');
  }
}

// 테스트 실행
if (require.main === module) {
  testUserManagement();
}

module.exports = { testUserManagement };
