import React from 'react';

export const Button = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);

export const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
};