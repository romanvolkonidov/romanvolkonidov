import React from 'react';
import { createPortal } from 'react-dom';

const Dialog = ({ open, onOpenChange, children }) => {
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

export default Dialog;