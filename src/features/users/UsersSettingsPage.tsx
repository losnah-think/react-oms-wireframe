import React, { useState } from "react";
import { Container, Card, Button, Input, Badge } from "../../design-system";

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
}

interface SessionSettings {
  timeoutMinutes: number;
  maxConcurrentSessions: number;
  requireReauth: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  loginAlerts: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
}

const UsersSettingsPage: React.FC = () => {
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90,
  });

  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    timeoutMinutes: 30,
    maxConcurrentSessions: 3,
    requireReauth: false,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    loginAlerts: true,
    securityAlerts: true,
    systemUpdates: false,
  });

  const handleSave = () => {
    console.log("Settings saved", {
      passwordPolicy,
      sessionSettings,
      notificationSettings,
    });
    alert("설정이 저장되었습니다.");
  };

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 설정</h1>
            <p className="text-sm text-gray-600 mt-1">
              사용자 관련 설정 관리
            </p>
          </div>
          <Button onClick={handleSave}>
            설정 저장
          </Button>
        </div>
      </div>

      {/* 비밀번호 정책 */}
      <Card padding="lg" className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 정책</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최소 길이
            </label>
            <Input
              type="number"
              value={passwordPolicy.minLength}
              onChange={(e) => setPasswordPolicy(prev => ({ ...prev, minLength: parseInt(e.target.value) }))}
              min="4"
              max="20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              만료 기간 (일)
            </label>
            <Input
              type="number"
              value={passwordPolicy.maxAge}
              onChange={(e) => setPasswordPolicy(prev => ({ ...prev, maxAge: parseInt(e.target.value) }))}
              min="30"
              max="365"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">비밀번호 요구사항</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={passwordPolicy.requireUppercase}
                onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireUppercase: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">대문자 포함</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={passwordPolicy.requireLowercase}
                onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireLowercase: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">소문자 포함</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={passwordPolicy.requireNumbers}
                onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">숫자 포함</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={passwordPolicy.requireSpecialChars}
                onChange={(e) => setPasswordPolicy(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">특수문자 포함</span>
            </label>
          </div>
        </div>
      </Card>

      {/* 세션 관리 */}
      <Card padding="lg" className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">세션 관리</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              세션 타임아웃 (분)
            </label>
            <Input
              type="number"
              value={sessionSettings.timeoutMinutes}
              onChange={(e) => setSessionSettings(prev => ({ ...prev, timeoutMinutes: parseInt(e.target.value) }))}
              min="5"
              max="480"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 동시 세션 수
            </label>
            <Input
              type="number"
              value={sessionSettings.maxConcurrentSessions}
              onChange={(e) => setSessionSettings(prev => ({ ...prev, maxConcurrentSessions: parseInt(e.target.value) }))}
              min="1"
              max="10"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={sessionSettings.requireReauth}
              onChange={(e) => setSessionSettings(prev => ({ ...prev, requireReauth: e.target.checked }))}
              className="mr-3"
            />
            <span className="text-sm text-gray-700">중요 작업 시 재인증 요구</span>
          </label>
        </div>
      </Card>

      {/* 알림 설정 */}
      <Card padding="lg" className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">이메일 알림</span>
              <p className="text-xs text-gray-500">시스템 알림을 이메일로 받습니다</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
              className="mr-3"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">로그인 알림</span>
              <p className="text-xs text-gray-500">새로운 로그인 시 알림을 받습니다</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.loginAlerts}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, loginAlerts: e.target.checked }))}
              className="mr-3"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">보안 알림</span>
              <p className="text-xs text-gray-500">보안 관련 이벤트 시 알림을 받습니다</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.securityAlerts}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, securityAlerts: e.target.checked }))}
              className="mr-3"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">시스템 업데이트</span>
              <p className="text-xs text-gray-500">시스템 업데이트 알림을 받습니다</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.systemUpdates}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemUpdates: e.target.checked }))}
              className="mr-3"
            />
          </label>
        </div>
      </Card>

    </Container>
  );
};

export default UsersSettingsPage;
