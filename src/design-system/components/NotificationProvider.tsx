import React, { createContext, useContext, useState } from 'react';
import Alert, { AlertProps } from './Alert';
import Confirm, { ConfirmProps } from './Confirm';

interface NotificationContextType {
  showAlert: (message: string, type?: AlertProps['type']) => void;
  showConfirm: (message: string, options?: Partial<ConfirmProps>) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationState {
  alert: {
    open: boolean;
    message: string;
    type: AlertProps['type'];
  };
  confirm: {
    open: boolean;
    message: string;
    options: Partial<ConfirmProps>;
    resolve?: (value: boolean) => void;
  };
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NotificationState>({
    alert: {
      open: false,
      message: '',
      type: 'info'
    },
    confirm: {
      open: false,
      message: '',
      options: {}
    }
  });

  const showAlert = (message: string, type: AlertProps['type'] = 'info') => {
    setState(prev => ({
      ...prev,
      alert: {
        open: true,
        message,
        type
      }
    }));
  };

  const showConfirm = (message: string, options: Partial<ConfirmProps> = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setState(prev => ({
        ...prev,
        confirm: {
          open: true,
          message,
          options,
          resolve
        }
      }));
    });
  };

  const handleAlertClose = () => {
    setState(prev => ({
      ...prev,
      alert: { ...prev.alert, open: false }
    }));
  };

  const handleConfirmResult = (result: boolean) => {
    if (state.confirm.resolve) {
      state.confirm.resolve(result);
    }
    setState(prev => ({
      ...prev,
      confirm: { ...prev.confirm, open: false, resolve: undefined }
    }));
  };

  const contextValue: NotificationContextType = {
    showAlert,
    showConfirm
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      <Alert
        open={state.alert.open}
        message={state.alert.message}
        type={state.alert.type}
        onClose={handleAlertClose}
      />
      
      <Confirm
        open={state.confirm.open}
        message={state.confirm.message}
        {...state.confirm.options}
        onConfirm={() => handleConfirmResult(true)}
        onCancel={() => handleConfirmResult(false)}
      />
    </NotificationContext.Provider>
  );
};