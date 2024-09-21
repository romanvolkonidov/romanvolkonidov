import React from 'react';

export const Table = ({ children }) => {
  return (
    <table className="min-w-full bg-white">
      {children}
    </table>
  );
};

export const TableHeader = ({ children }) => {
  return <thead className="bg-gray-200">{children}</thead>;
};

export const TableRow = ({ children }) => {
  return <tr className="border-b">{children}</tr>;
};

export const TableHead = ({ children }) => {
  return <th className="px-4 py-2">{children}</th>;
};

export const TableBody = ({ children }) => {
  return <tbody>{children}</tbody>;
};

export const TableCell = ({ children }) => {
  return <td className="px-4 py-2">{children}</td>;
};

export default Table;
