// src/features/users/UsersRolesPage.tsx
import React, { useState } from 'react';
import { Container, Card, Button, Table, TableColumn, Badge } from '../../design-system';
import PermissionGate, { PermissionButton } from './components/PermissionGate';
import { Role, Permission, PERMISSION_GROUPS, getPermissionDisplayName } from './types/permissions';
import { usePermissions } from './hooks/usePermissions';
import { useRoles } from './hooks/useRoles';

const UsersRolesPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>([]);

  const { permissions: userPermissions, hasPermission } = usePermissions();
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

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN': return 'red';
      case 'MANAGER': return 'blue';
      case 'OPERATOR': return 'green';
      case 'USER': return 'gray';
      default: return 'gray';
    }
  };

  const columns: TableColumn<Role>[] = [
    {
      key: 'name',
      label: '역할명',
      render: (role) => {
        if (!role) return <span>-</span>;
        return (
          <div className="flex items-center gap-2">
            <Badge color={getRoleBadgeColor(role.name)} size="small">
              {role.name || '-'}
            </Badge>
            {role.isSystem && (
              <Badge color="gray" size="small">
                시스템
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'description',
      label: '설명',
      render: (role) => (
        <span className="text-gray-700">{role?.description || '-'}</span>
      )
    },
    {
      key: 'permissions',
      label: '권한 수',
      render: (role) => {
        if (!role) return <span className="text-sm text-gray-600">-</span>;
        const permissions = role.permissions || [];
        return (
          <span className="text-sm text-gray-600">
            {permissions.includes('*') ? '모든 권한' : `${permissions.length}개`}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: '작업',
      render: (role) => {
        if (!role) return null;
        return (
          <PermissionButton
            permission="users:update"
            onClick={() => handleEditRole(role)}
            disabled={role.isSystem && !hasPermission('*')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            권한 수정
          </PermissionButton>
        );
      }
    }
  ];

  if (loading) {
    return (
      <Container>
        <div className="py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">역할 관리</h1>
            <p className="text-gray-600 mt-2">
              사용자 역할과 권한을 관리합니다.
            </p>
          </div>
          <PermissionGate permission="users:create">
            <Button>
              새 역할 생성
            </Button>
          </PermissionGate>
        </div>

        {/* 역할 목록 */}
        <Card padding="lg">
          <Table
            data={roles}
            columns={columns}
            loading={loading}
            emptyMessage="역할이 없습니다"
          />
        </Card>

        {/* 권한 수정 모달 */}
        {showRoleModal && selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {selectedRole.name} 권한 수정
                </h2>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {PERMISSION_GROUPS.map((group) => {
                  const groupPermissions = group.permissions;
                  const hasAllGroupPermissions = groupPermissions.every(p => editingPermissions.includes(p));
                  const hasSomeGroupPermissions = groupPermissions.some(p => editingPermissions.includes(p));

                  return (
                    <div key={group.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{group.name}</h3>
                          <p className="text-sm text-gray-600">{group.description}</p>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hasAllGroupPermissions}
                            ref={(input) => {
                              if (input) {
                                input.indeterminate = hasSomeGroupPermissions && !hasAllGroupPermissions;
                              }
                            }}
                            onChange={() => handleGroupPermissionToggle(groupPermissions)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">전체 선택</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {groupPermissions.map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingPermissions.includes(permission)}
                              onChange={() => handlePermissionToggle(permission)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={() => setShowRoleModal(false)}
                >
                  취소
                </Button>
                <Button onClick={handleSaveRole}>
                  저장
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default UsersRolesPage;