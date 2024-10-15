import React from 'react';
import { createPortal } from 'react-dom';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-auto relative">
        {children}
        <button 
          onClick={() => onOpenChange(false)} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
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

export const DialogFooter = ({ children }) => {
  return <div className="mt-4 flex justify-end space-x-2">{children}</div>;
};

// If you're using a Button component from your UI library, you might want to create a wrapper here
// to ensure consistency. For example:
import { Button as BaseButton } from '@/components/ui/Button';

export const Button = ({ children, ...props }) => {
  return <BaseButton {...props}>{children}</BaseButton>;
};

// If you're using an Input component from your UI library, you might want to create a wrapper here as well
import { Input as BaseInput } from '@/components/ui/Input';

export const Input = (props) => {
  return <BaseInput className="w-full p-2 border rounded" {...props} />;
};