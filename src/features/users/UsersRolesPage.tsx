// src/features/users/UsersRolesPage.tsx
import React, { useState } from 'react';
import { Container, Card, Button, Table, TableColumn, Badge, Modal } from '../../design-system';
import { Role, Permission, PERMISSION_GROUPS, getPermissionDisplayName } from './types/permissions';
import { useRoles } from './hooks/useRoles';

const UsersRolesPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>([]);

  const { roles, loading, updateRolePermissions } = useRoles();

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setEditingPermissions([...(role.permissions || [])]);
    setShowRoleModal(true);
  };

  const handlePermissionToggle = (permission: Permission) => {
    setEditingPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleGroupPermissionToggle = (groupPermissions: Permission[]) => {
    const hasAllGroupPermissions = groupPermissions.every(p => editingPermissions.includes(p));
    
    if (hasAllGroupPermissions) {
      // 모든 권한이 있으면 제거
      setEditingPermissions(prev => prev.filter(p => !groupPermissions.includes(p)));
    } else {
      // 일부만 있으면 모두 추가
      setEditingPermissions(prev => {
        const newPermissions = [...prev];
        groupPermissions.forEach(p => {
          if (!newPermissions.includes(p)) {
            newPermissions.push(p);
          }
        });
        return newPermissions;
      });
    }
  };

  const handleSaveRole = async () => {
    if (selectedRole) {
      try {
        await updateRolePermissions(selectedRole.id, editingPermissions);
        
        setShowRoleModal(false);
        setSelectedRole(null);
        setEditingPermissions([]);
      } catch (error) {
        console.error('권한 저장 실패:', error);
        alert('권한 저장에 실패했습니다.');
      }
    }
  };

  const columns: TableColumn<Role>[] = [
    {
      key: 'name',
      title: '역할',
      render: (value, role) => (
        <div>
          <div className="font-medium text-gray-900">{role.name}</div>
          <div className="text-sm text-gray-500">{role.description}</div>
        </div>
      )
    },
    {
      key: 'permissions',
      title: '권한',
      render: (value, role) => {
        const permissions = role.permissions || [];
        return (
          <span className="text-sm text-gray-600">
            {permissions.includes('*') ? '모든 권한' : `${permissions.length}개 권한`}
          </span>
        );
      }
    },
    {
      key: 'actions',
      title: '작업',
      render: (value, role) => (
        <Button
          size="small"
          variant="ghost"
          onClick={() => handleEditRole(role)}
        >
          수정
        </Button>
      )
    }
  ];

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">권한 관리</h1>
            <p className="text-sm text-gray-600 mt-1">
              역할별 권한 설정
            </p>
          </div>
        </div>

        {/* 역할 목록 */}
        <Card padding="none">
          <Table
            data={roles}
            columns={columns}
            loading={loading}
          />
        </Card>

        {/* 권한 수정 모달 */}
        {showRoleModal && selectedRole && (
          <Modal
            open={showRoleModal}
            onClose={() => setShowRoleModal(false)}
            title={`${selectedRole.name} 권한 설정`}
          >
            <div className="space-y-4">
              {PERMISSION_GROUPS.map((group) => {
                const groupPermissions = group.permissions;
                const hasAllGroupPermissions = groupPermissions.every(p => editingPermissions.includes(p));

                return (
                  <div key={group.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hasAllGroupPermissions}
                          onChange={() => handleGroupPermissionToggle(groupPermissions)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">전체</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {groupPermissions.map((permission) => (
                        <label key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingPermissions.includes(permission)}
                            onChange={() => handlePermissionToggle(permission)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {getPermissionDisplayName(permission)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setShowRoleModal(false)} fullWidth>
                  취소
                </Button>
                <Button onClick={handleSaveRole} fullWidth>
                  저장
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Container>
  );
};

export default UsersRolesPage;