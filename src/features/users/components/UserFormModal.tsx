// src/features/users/components/UserFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Container, Badge } from '../../../design-system';
import { User, CreateUserRequest, UpdateUserRequest, UserRole, UserStatus, UserGroup } from '../types';
import { Permission, PERMISSION_GROUPS, getPermissionDisplayName } from '../types/permissions';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  department: string;
  phone: string;
  status: UserStatus;
  groupIds: string[];
  companyId: string;
}

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: User;
  mode: 'create' | 'edit';
  onSave: (userData: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  loading?: boolean;
  availableGroups?: UserGroup[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onClose,
  user,
  mode,
  onSave,
  loading = false,
  availableGroups = []
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    department: '',
    phone: '',
    status: 'ACTIVE',
    groupIds: [],
    companyId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 데이터로 폼 초기화
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role as UserRole,
        department: user.department || '',
        phone: user.phone || '',
        status: user.status as UserStatus,
        groupIds: user.groupIds || [],
        companyId: user.companyId || ''
      });
    } else {
      // 생성 모드일 때 폼 초기화
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
        department: '',
        phone: '',
        status: 'ACTIVE',
        groupIds: [],
        companyId: ''
      });
    }
    setErrors({});
  }, [mode, user, open]);

  const handleInputChange = (field: keyof UserFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      groupIds: prev.groupIds.includes(groupId)
        ? prev.groupIds.filter(id => id !== groupId)
        : [...prev.groupIds, groupId]
    }));
  };

  // 선택된 그룹들의 총 권한 계산
  const getGroupPermissions = (): Permission[] => {
    const selectedGroups = availableGroups.filter(g => formData.groupIds.includes(g.id));
    const allPermissions = new Set<Permission>();
    selectedGroups.forEach(group => {
      group.permissions.forEach(p => allPermissions.add(p as Permission));
    });
    return Array.from(allPermissions);
  };

  const groupPermissions = getGroupPermissions();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 최소 2자 이상이어야 합니다';
    }

    // 이메일 검증
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    // 비밀번호 검증 (생성 모드일 때만)
    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = '비밀번호를 입력해주세요';
      } else if (formData.password.length < 8) {
        newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      }
    }

    // 비밀번호 변경 (편집 모드일 때)
    if (mode === 'edit' && formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      }
    }

    // 전화번호 검증 (선택사항이지만 입력된 경우)
    if (formData.phone && !/^[0-9-+\s()]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        department: formData.department.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        ...(mode === 'create' && { password: formData.password }),
        ...(mode === 'edit' && formData.password && { password: formData.password }),
        ...(mode === 'edit' && { status: formData.status })
      };

      await onSave(userData);
      onClose();
    } catch (error) {
      console.error('사용자 저장 실패:', error);
      setErrors({ submit: '사용자 저장에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? '사용자 추가' : '사용자 수정'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'create' 
              ? '새로운 사용자 계정을 생성합니다.' 
              : '사용자 정보를 수정합니다.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="사용자 이름"
                error={errors.name}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@company.com"
                error={errors.email}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 {mode === 'create' ? '*' : '(변경시에만)'}
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={mode === 'create' ? '비밀번호' : '새 비밀번호 (선택사항)'}
                error={errors.password}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 {mode === 'create' ? '*' : '(변경시에만)'}
              </label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="비밀번호 확인"
                error={errors.confirmPassword}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 역할 및 상태 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                역할 *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="USER">사용자</option>
                <option value="OPERATOR">운영자</option>
                <option value="MANAGER">관리자</option>
                <option value="ADMIN">시스템 관리자</option>
              </select>
            </div>

            {mode === 'edit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태 *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as UserStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="ACTIVE">활성</option>
                  <option value="INACTIVE">비활성</option>
                  <option value="PENDING">대기중</option>
                  <option value="SUSPENDED">정지</option>
                </select>
              </div>
            )}
          </div>

          {/* 부서 및 연락처 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부서
              </label>
              <Input
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="부서명"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="010-1234-5678"
                error={errors.phone}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 회사 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회사
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => handleInputChange('companyId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">회사 선택</option>
              <option value="company-1">플고물류</option>
              <option value="company-2">에이스전자</option>
              <option value="company-3">베스트패션</option>
              <option value="company-4">스마트식품</option>
            </select>
          </div>

          {/* 사용자 그룹 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용자 그룹 {formData.groupIds.length > 0 && `(${formData.groupIds.length}개 선택됨)`}
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {availableGroups.length === 0 ? (
                <p className="text-sm text-gray-500">사용 가능한 그룹이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {availableGroups
                    .filter(group => !formData.companyId || group.companyId === formData.companyId)
                    .map((group) => (
                      <label
                        key={group.id}
                        className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.groupIds.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900">{group.name}</div>
                          <div className="text-xs text-gray-500">{group.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {group.permissions.length}개 권한 • {group.companyName}
                          </div>
                        </div>
                      </label>
                    ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              선택한 그룹의 권한이 이 사용자에게 자동으로 적용됩니다
            </p>
          </div>

          {/* 그룹에서 상속되는 권한 표시 */}
          {groupPermissions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                그룹에서 상속되는 권한 ({groupPermissions.length}개)
              </h4>
              <div className="flex flex-wrap gap-1">
                {groupPermissions.slice(0, 10).map((permission) => (
                  <Badge key={permission} variant="primary" size="small">
                    {getPermissionDisplayName(permission)}
                  </Badge>
                ))}
                {groupPermissions.length > 10 && (
                  <Badge variant="secondary" size="small">
                    +{groupPermissions.length - 10}개 더
                  </Badge>
                )}
              </div>
              <p className="text-xs text-blue-700 mt-2">
                이 권한들은 선택한 그룹에서 자동으로 상속됩니다
              </p>
            </div>
          )}

          {/* 제출 에러 */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
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
              {mode === 'create' ? '사용자 생성' : '사용자 수정'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UserFormModal;
