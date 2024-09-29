import React from 'react';
import { createPortal } from 'react-dom';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-4">
        {children}
        <button onClick={() => onOpenChange(false)} className="absolute top-2 right-2">
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
};

export const DialogContent = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

export const DialogHeader = ({ children }) => {
  return <div className="border-b pb-2 mb-4">{children}</div>;
};

export const DialogTitle = ({ children }) => {
  return <h2 className="text-xl font-bold">{children}</h2>;
};