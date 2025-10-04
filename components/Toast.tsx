
import React, { useState, useEffect } from 'react';
import type { ToastState, ToastType } from '../types';

interface ToastProps {
  toastState: ToastState;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toastState, onDismiss }) => {
  useEffect(() => {
    if (toastState.visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastState, onDismiss]);

  if (!toastState.visible) {
    return null;
  }
  
  const typeClasses: Record<ToastType, string> = {
    ok: 'bg-green-50 text-green-800 border-green-200',
    warn: 'bg-amber-50 text-amber-800 border-amber-200',
    bad: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div className={`p-2.5 rounded-xl text-sm border mt-2.5 ${typeClasses[toastState.type]}`}>
      {toastState.message}
    </div>
  );
};
