// src/features/users/components/UserPermissionsModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from '../../../design-system';
import { User, UserGroup } from '../types';
import { Permission, PERMISSION_GROUPS, getPermissionDisplayName } from '../types/permissions';

interface UserPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userId: string, permissions: Permission[]) => Promise<void>;
  loading?: boolean;
  userGroups?: UserGroup[];
}

const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  open,
  onClose,
  user,
  onSave,
  loading = false,
  userGroups = []
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // 사용자 권한으로 초기화
  useEffect(() => {
    if (user && open) {
      setSelectedPermissions(user.permissions || []);
      setError('');
    }
  }, [user, open]);

  // 그룹에서 상속되는 권한 계산
  const getGroupPermissions = (): Permission[] => {
    if (!user || !user.groupIds || user.groupIds.length === 0) return [];
    
    const selectedGroups = userGroups.filter(g => user.groupIds.includes(g.id));
    const allPermissions = new Set<Permission>();
    selectedGroups.forEach(group => {
      group.permissions.forEach(p => allPermissions.add(p as Permission));
    });
    return Array.from(allPermissions);
  };

  // 최종 적용 권한 (그룹 권한 + 개별 권한)
  const getEffectivePermissions = (): Permission[] => {
    const groupPerms = getGroupPermissions();
    const combined = new Set<Permission>([...groupPerms, ...selectedPermissions]);
    return Array.from(combined);
  };

  const groupPermissions = getGroupPermissions();
  const effectivePermissions = getEffectivePermissions();

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleGroupPermissionToggle = (groupPermissions: Permission[]) => {
    const hasAllGroupPermissions = groupPermissions.every(p => selectedPermissions.includes(p));
    
    if (hasAllGroupPermissions) {
      // 그룹의 모든 권한 제거
      setSelectedPermissions(prev => prev.filter(p => !groupPermissions.includes(p)));
    } else {
      // 그룹의 모든 권한 추가
      setSelectedPermissions(prev => {
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

  const handleSelectAll = () => {
    // 모든 권한 선택
    const allPermissions = PERMISSION_GROUPS.flatMap(group => group.permissions);
    setSelectedPermissions(allPermissions);
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('사용자 정보가 없습니다.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave(user.id, selectedPermissions);
      onClose();
    } catch (error) {
      console.error('권한 저장 실패:', error);
      setError('권한 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            권한 설정
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {user.name}님의 권한을 설정합니다
          </p>
          <div className="mt-2 text-xs text-gray-500">
            {user.email} • {user.department || '부서 미지정'}
          </div>
        </div>

        {/* 그룹 권한 표시 */}
        {groupPermissions.length > 0 && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-semibold text-green-900 mb-2">
              그룹에서 상속된 권한 ({groupPermissions.length}개)
            </h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {groupPermissions.slice(0, 8).map((permission) => (
                <Badge key={permission} variant="success" size="small">
                  {getPermissionDisplayName(permission)}
                </Badge>
              ))}
              {groupPermissions.length > 8 && (
                <Badge variant="secondary" size="small">
                  +{groupPermissions.length - 8}개 더
                </Badge>
              )}
            </div>
            <p className="text-xs text-green-700">
              이 권한들은 사용자가 속한 그룹에서 자동으로 상속되며 변경할 수 없습니다.
            </p>
          </div>
        )}

        {/* 최종 적용 권한 표시 */}
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">
            최종 적용 권한 ({effectivePermissions.length}개)
          </h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {effectivePermissions.slice(0, 10).map((permission) => (
              <Badge 
                key={permission} 
                variant={groupPermissions.includes(permission) ? 'success' : 'primary'} 
                size="small"
              >
                {getPermissionDisplayName(permission)}
              </Badge>
            ))}
            {effectivePermissions.length > 10 && (
              <Badge variant="secondary" size="small">
                +{effectivePermissions.length - 10}개 더
              </Badge>
            )}
          </div>
          <p className="text-xs text-purple-700">
            그룹 권한(녹색)과 개별 권한(파랑)이 합쳐진 최종 권한입니다.
          </p>
        </div>

        {/* 알림 메시지 */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>권한 우선순위:</strong> 그룹 권한이 우선 적용되고, 여기서 선택한 개별 권한이 추가됩니다.
            그룹 권한은 그룹 설정에서만 변경할 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 전체 선택/해제 버튼 */}
          <div className="flex justify-between items-center pb-2 border-b">
            <div className="text-sm font-medium text-gray-700">
              총 {selectedPermissions.length}개 권한 선택됨
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={handleSelectAll}
                disabled={isSubmitting}
              >
                전체 선택
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={handleClearAll}
                disabled={isSubmitting}
              >
                전체 해제
              </Button>
            </div>
          </div>

          {/* 권한 그룹 */}
          <div className="space-y-3">
            {PERMISSION_GROUPS.map((group) => {
              const groupPermissions = group.permissions;
              const hasAllGroupPermissions = groupPermissions.every(p => selectedPermissions.includes(p));
              const hasSomeGroupPermissions = groupPermissions.some(p => selectedPermissions.includes(p));

              return (
                <div key={group.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAllGroupPermissions}
                        ref={(input) => {
                          if (input) {
                            input.indeterminate = hasSomeGroupPermissions && !hasAllGroupPermissions;
                          }
                        }}
                        onChange={() => handleGroupPermissionToggle(groupPermissions)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <span className="ml-2 text-sm text-gray-700">전체</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {groupPermissions.map((permission) => (
                      <label key={permission} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
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

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
            >
              권한 저장
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UserPermissionsModal;

