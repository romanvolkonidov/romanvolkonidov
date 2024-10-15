import React from 'react';

export const Table = ({ children, className, ...props }) => (
  <table className={`w-full border-collapse ${className}`} {...props}>
    {children}
  </table>
);

export const TableHeader = ({ children, className, ...props }) => (
  <thead className={`bg-gray-100 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className, ...props }) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, ...props }) => (
  <tr className={`border-b ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead = ({ children, className, ...props }) => (
  <th className={`p-2 text-left font-semibold ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className, ...props }) => (
  <td className={`p-2 ${className}`} {...props}>
    {children}
  </td>
);