// src/features/users/components/SecurityValidator.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../../design-system';
import { 
  validatePassword, 
  validateEmail, 
  validatePhoneNumber, 
  validateUsername,
  validateDepartment,
  DEFAULT_PASSWORD_POLICY 
} from '../../../lib/utils/security';

interface SecurityValidatorProps {
  onValidationChange?: (isValid: boolean) => void;
}

const SecurityValidator: React.FC<SecurityValidatorProps> = ({ onValidationChange }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: ''
  });

  const [validationResults, setValidationResults] = useState({
    username: { isValid: true, error: '' },
    email: { isValid: true, error: '' },
    password: { isValid: true, error: '', errors: [] as string[] },
    confirmPassword: { isValid: true, error: '' },
    phone: { isValid: true, error: '' },
    department: { isValid: true, error: '' }
  });

  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);

  // 실시간 검증
  useEffect(() => {
    validateAllFields();
  }, [formData]);

  const validateAllFields = () => {
    const results = { ...validationResults };

    // 사용자명 검증
    const usernameResult = validateUsername(formData.username);
    results.username = {
      isValid: usernameResult.isValid,
      error: usernameResult.error || ''
    };

    // 이메일 검증
    results.email = {
      isValid: validateEmail(formData.email),
      error: validateEmail(formData.email) ? '' : '올바른 이메일 형식이 아닙니다'
    };

    // 비밀번호 검증
    const passwordResult = validatePassword(formData.password);
    results.password = {
      isValid: passwordResult.isValid,
      error: passwordResult.errors.join(', '),
      errors: passwordResult.errors
    };

    // 비밀번호 확인 검증
    results.confirmPassword = {
      isValid: formData.password === formData.confirmPassword,
      error: formData.password !== formData.confirmPassword ? '비밀번호가 일치하지 않습니다' : ''
    };

    // 전화번호 검증
    results.phone = {
      isValid: !formData.phone || validatePhoneNumber(formData.phone),
      error: formData.phone && !validatePhoneNumber(formData.phone) ? '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)' : ''
    };

    // 부서명 검증
    results.department = {
      isValid: !formData.department || validateDepartment(formData.department),
      error: formData.department && !validateDepartment(formData.department) ? '올바른 부서명 형식이 아닙니다' : ''
    };

    setValidationResults(results);

    // 전체 폼 유효성 검사
    const isFormValid = Object.values(results).every(result => result.isValid);
    onValidationChange?.(isFormValid);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    validateAllFields();
    
    const isFormValid = Object.values(validationResults).every(result => result.isValid);
    if (isFormValid) {
      console.log('Form is valid:', formData);
      // 실제 제출 로직
    } else {
      console.log('Form has validation errors');
    }
  };

  const getInputClassName = (isValid: boolean) => {
    return `w-full ${isValid ? 'border-gray-300' : 'border-red-500'} focus:ring-blue-500 focus:border-blue-500`;
  };

  return (
    <Card padding="lg" className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">보안 검증 데모</h2>
      
      <div className="space-y-4">
        {/* 사용자명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            사용자명 *
          </label>
          <Input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="3-20자, 영문, 숫자, _, - 만 사용"
            className={getInputClassName(validationResults.username.isValid)}
          />
          {!validationResults.username.isValid && (
            <p className="text-red-600 text-sm mt-1">{validationResults.username.error}</p>
          )}
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일 *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="user@company.com"
            className={getInputClassName(validationResults.email.isValid)}
          />
          {!validationResults.email.isValid && (
            <p className="text-red-600 text-sm mt-1">{validationResults.email.error}</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              비밀번호 *
            </label>
            <button
              type="button"
              onClick={() => setShowPasswordPolicy(!showPasswordPolicy)}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              정책 보기
            </button>
          </div>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="안전한 비밀번호를 입력하세요"
            className={getInputClassName(validationResults.password.isValid)}
          />
          {!validationResults.password.isValid && (
            <div className="mt-1">
              {validationResults.password.errors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}
          
          {/* 비밀번호 정책 표시 */}
          {showPasswordPolicy && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">비밀번호 정책</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 최소 {DEFAULT_PASSWORD_POLICY.minLength}자 이상</li>
                <li>• 최대 {DEFAULT_PASSWORD_POLICY.maxLength}자 이하</li>
                <li>• 대문자 포함</li>
                <li>• 소문자 포함</li>
                <li>• 숫자 포함</li>
                <li>• 특수문자 포함</li>
                <li>• 금지된 패턴 사용 불가</li>
              </ul>
            </div>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호 확인 *
          </label>
          <Input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            className={getInputClassName(validationResults.confirmPassword.isValid)}
          />
          {!validationResults.confirmPassword.isValid && (
            <p className="text-red-600 text-sm mt-1">{validationResults.confirmPassword.error}</p>
          )}
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            전화번호
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="010-1234-5678"
            className={getInputClassName(validationResults.phone.isValid)}
          />
          {!validationResults.phone.isValid && (
            <p className="text-red-600 text-sm mt-1">{validationResults.phone.error}</p>
          )}
        </div>

        {/* 부서명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            부서명
          </label>
          <Input
            type="text"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            placeholder="개발팀, 마케팅팀 등"
            className={getInputClassName(validationResults.department.isValid)}
          />
          {!validationResults.department.isValid && (
            <p className="text-red-600 text-sm mt-1">{validationResults.department.error}</p>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!Object.values(validationResults).every(result => result.isValid)}
          >
            검증 완료
          </Button>
        </div>

        {/* 검증 상태 요약 */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">검증 상태</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(validationResults).map(([field, result]) => (
              <div key={field} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${result.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={result.isValid ? 'text-green-700' : 'text-red-700'}>
                  {field}: {result.isValid ? '유효' : '오류'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SecurityValidator;
