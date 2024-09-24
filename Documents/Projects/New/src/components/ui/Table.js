// Table.js
import React from 'react';

export const Table = ({ children }) => (
  <table className="table-auto w-full">{children}</table>
);

Table.Header = ({ children }) => <thead>{children}</thead>;
Table.Body = ({ children }) => <tbody>{children}</tbody>;
Table.Row = ({ children }) => <tr>{children}</tr>;
Table.Head = ({ children }) => <th className="px-4 py-2">{children}</th>;
Table.Cell = ({ children }) => <td className="border px-4 py-2">{children}</td>;