import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
}

// Mock 데이터
const mockUsers: User[] = [
  { id: '1', name: '김철수', email: 'kim@fulgo.com', role: '관리자', department: 'IT팀', phone: '010-1234-5678', lastLogin: '2025-10-14 09:30', createdAt: '2024-01-15' },
  { id: '2', name: '이영희', email: 'lee@fulgo.com', role: '매니저', department: '마케팅팀', phone: '010-2345-6789', lastLogin: '2025-10-14 08:45', createdAt: '2024-02-20' },
  { id: '3', name: '박민수', email: 'park@fulgo.com', role: '일반', department: '영업팀', phone: '010-3456-7890', lastLogin: '2025-10-13 17:20', createdAt: '2024-03-10' },
  { id: '4', name: '정수진', email: 'jung@fulgo.com', role: '일반', department: 'IT팀', phone: '010-4567-8901', lastLogin: '2025-10-14 10:15', createdAt: '2024-04-05' },
];

const ROLES = ['관리자', '매니저', '일반'];

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 필터링
  const filteredUsers = users.filter(user => {
    const matchesSearch = search ? 
      user.name.includes(search) || 
      user.email.includes(search) || 
      user.department?.includes(search) || ''
      : true;
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // 모달 열기
  const openAddModal = () => {
    setEditingUser({
      id: Date.now().toString(),
      name: '',
      email: '',
      role: '일반',
      department: '',
      phone: '',
      createdAt: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  // 저장
  const handleSave = () => {
    if (!editingUser) return;

    if (!editingUser.name.trim()) {
      alert('이름을 입력하세요');
      return;
    }
    if (!editingUser.email.trim()) {
      alert('이메일을 입력하세요');
      return;
    }

    const existingIndex = users.findIndex(u => u.id === editingUser.id);
    if (existingIndex >= 0) {
      const newUsers = [...users];
      newUsers[existingIndex] = editingUser;
      setUsers(newUsers);
    } else {
      setUsers([...users, editingUser]);
    }

    setIsModalOpen(false);
    setEditingUser(null);
  };

  // 삭제
  const handleDelete = (user: User) => {
    if (!confirm(`${user.name} 사용자를 삭제하시겠습니까?`)) return;
    setUsers(users.filter(u => u.id !== user.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">사용자 관리</h1>
          <p className="text-sm text-gray-600 mt-1">시스템 사용자를 관리합니다</p>
        </div>
      </div>

      {/* 메인 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="이름, 이메일, 부서로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">전체 권한</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              + 사용자 추가
            </button>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">전체 사용자</div>
            <div className="text-2xl font-bold mt-1">{users.length}명</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">관리자</div>
            <div className="text-2xl font-bold mt-1">{users.filter(u => u.role === '관리자').length}명</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">일반 사용자</div>
            <div className="text-2xl font-bold mt-1">{users.filter(u => u.role === '일반').length}명</div>
          </div>
        </div>

        {/* 사용자 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">사용자</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">권한</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">부서</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">연락처</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">마지막 로그인</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      user.role === '관리자' ? 'bg-red-100 text-red-700' :
                      user.role === '매니저' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.department || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.lastLogin || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {users.find(u => u.id === editingUser.id) ? '사용자 수정' : '사용자 추가'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="hong@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">권한</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">부서</label>
                <input
                  type="text"
                  value={editingUser.department || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="IT팀"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="010-1234-5678"
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
