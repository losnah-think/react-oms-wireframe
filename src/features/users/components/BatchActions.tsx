// src/features/users/components/BatchActions.tsx
import React, { useState } from 'react';
import { Card, Button } from '../../../design-system';
import ConfirmModal from './ConfirmModal';

type BatchAction = 'activate' | 'deactivate' | 'suspend' | 'delete' | 'export' | 'import' | 'resetPassword';

interface BatchActionsProps {
  selectedUsers: string[];
  onBatchAction: (action: BatchAction, userIds: string[]) => Promise<void>;
  onClearSelection: () => void;
  loading?: boolean;
  totalUsers?: number;
}

const BatchActions: React.FC<BatchActionsProps> = ({
  selectedUsers,
  onBatchAction,
  onClearSelection,
  loading = false,
  totalUsers = 0
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<BatchAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvancedActions, setShowAdvancedActions] = useState(false);

  const handleBatchAction = async (action: BatchAction) => {
    if (action === 'delete' || action === 'resetPassword') {
      setPendingAction(action);
      setShowConfirmModal(true);
    } else {
      await executeBatchAction(action);
    }
  };

  const executeBatchAction = async (action: BatchAction) => {
    setIsProcessing(true);
    try {
      await onBatchAction(action, selectedUsers);
    } catch (error) {
      console.error('일괄 작업 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmBatchAction = async () => {
    if (pendingAction) {
      setShowConfirmModal(false);
      await executeBatchAction(pendingAction);
      setPendingAction(null);
    }
  };

  const handleSelectAll = () => {
    // 전체 선택 기능은 부모 컴포넌트에서 처리
    onBatchAction('selectAll', []);
  };

  const getActionConfig = (action: BatchAction) => {
    switch (action) {
      case 'activate':
        return {
          label: '활성화',
          color: 'bg-green-500 hover:bg-green-600',
          confirmTitle: '사용자 활성화',
          confirmMessage: `선택한 ${selectedUsers.length}명의 사용자를 활성화하시겠습니까?`
        };
      case 'deactivate':
        return {
          label: '비활성화',
          color: 'bg-yellow-500 hover:bg-yellow-600',
          confirmTitle: '사용자 비활성화',
          confirmMessage: `선택한 ${selectedUsers.length}명의 사용자를 비활성화하시겠습니까?`
        };
      case 'suspend':
        return {
          label: '정지',
          color: 'bg-orange-500 hover:bg-orange-600',
          confirmTitle: '사용자 정지',
          confirmMessage: `선택한 ${selectedUsers.length}명의 사용자를 정지하시겠습니까?`
        };
      case 'delete':
        return {
          label: '삭제',
          color: 'bg-red-500 hover:bg-red-600',
          confirmTitle: '사용자 삭제',
          confirmMessage: `선택한 ${selectedUsers.length}명의 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
          variant: 'danger' as const
        };
      case 'export':
        return {
          label: '내보내기',
          color: 'bg-blue-500 hover:bg-blue-600',
          confirmTitle: '사용자 데이터 내보내기',
          confirmMessage: `선택한 ${selectedUsers.length}명의 사용자 데이터를 CSV 파일로 내보내시겠습니까?`
        };
      case 'resetPassword':
        return {
          label: '비밀번호 초기화',
          color: 'bg-purple-500 hover:bg-purple-600',
          confirmTitle: '비밀번호 초기화',
          confirmMessage: `선택한 ${selectedUsers.length}명의 사용자 비밀번호를 초기화하시겠습니까? 임시 비밀번호가 이메일로 전송됩니다.`,
          variant: 'warning' as const
        };
      default:
        return {
          label: '',
          color: '',
          confirmTitle: '',
          confirmMessage: ''
        };
    }
  };

  if (selectedUsers.length === 0) {
    return (
      <Card padding="md" className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              전체 {totalUsers}명 중 사용자를 선택하세요
            </span>
            <Button
              size="small"
              variant="ghost"
              onClick={handleSelectAll}
              disabled={loading}
            >
              전체 선택
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              size="small"
              variant="ghost"
              onClick={() => setShowAdvancedActions(!showAdvancedActions)}
              disabled={loading}
            >
              {showAdvancedActions ? '기본 작업' : '고급 작업'}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card padding="md" className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {selectedUsers.length}개 사용자가 선택됨
            </span>
            <div className="flex gap-2">
              {/* 기본 작업 */}
              <Button
                size="small"
                variant="ghost"
                onClick={() => handleBatchAction('activate')}
                disabled={loading || isProcessing}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                활성화
              </Button>
              <Button
                size="small"
                variant="ghost"
                onClick={() => handleBatchAction('deactivate')}
                disabled={loading || isProcessing}
                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
              >
                비활성화
              </Button>
              <Button
                size="small"
                variant="ghost"
                onClick={() => handleBatchAction('suspend')}
                disabled={loading || isProcessing}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                정지
              </Button>
              <Button
                size="small"
                variant="ghost"
                onClick={() => handleBatchAction('delete')}
                disabled={loading || isProcessing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                삭제
              </Button>

              {/* 고급 작업 */}
              {showAdvancedActions && (
                <>
                  <div className="border-l border-gray-300 mx-2"></div>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => handleBatchAction('export')}
                    disabled={loading || isProcessing}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    내보내기
                  </Button>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => handleBatchAction('resetPassword')}
                    disabled={loading || isProcessing}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    비밀번호 초기화
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="small"
              variant="ghost"
              onClick={() => setShowAdvancedActions(!showAdvancedActions)}
              disabled={loading || isProcessing}
            >
              {showAdvancedActions ? '기본 작업' : '고급 작업'}
            </Button>
            <Button
              size="small"
              variant="ghost"
              onClick={onClearSelection}
              disabled={loading || isProcessing}
            >
              선택 해제
            </Button>
          </div>
        </div>

        {/* 진행률 표시 */}
        {isProcessing && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">일괄 작업 처리 중...</span>
            </div>
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmBatchAction}
        title={pendingAction ? getActionConfig(pendingAction).confirmTitle : ''}
        message={pendingAction ? getActionConfig(pendingAction).confirmMessage : ''}
        confirmText="확인"
        cancelText="취소"
        variant={pendingAction === 'delete' ? 'danger' : pendingAction === 'resetPassword' ? 'warning' : 'info'}
        loading={isProcessing}
      />
    </>
  );
};

export default BatchActions;
