import React, { useState } from 'react';
import { X } from 'lucide-react';

const FileViewerButton = ({ file, index, onDelete, readOnly }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFileView = () => setIsOpen(!isOpen);

  const FileViewer = () => {
    const isImage = file.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/);
    return (
      <div className="relative bg-white border rounded-lg p-2 mt-2 mb-2">
        <button
          onClick={toggleFileView}
          className="absolute top-1 right-1 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          <X size={16} />
        </button>
        {isImage ? (
          <img src={file} alt="Opened file" className="max-w-full h-auto max-h-64 object-contain" />
        ) : (
          <iframe src={file} title="Opened file" className="w-full h-64" />
        )}
      </div>
    );
  };

  return (
    <div className="mb-2">
      <button
        onClick={toggleFileView}
        className="px-2 py-1 rounded bg-black text-white mr-2"
      >
        {`File ${index + 1}`}
      </button>
      {!readOnly && (
        <button
          onClick={() => onDelete(file)}
          className="px-2 py-1 rounded bg-red-500 text-white"
        >
          ✕
        </button>
      )}
      {isOpen && <FileViewer />}
    </div>
  );
};

export default FileViewerButton;