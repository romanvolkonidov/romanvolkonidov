import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import '../styles/FileViewerButton.css';

const FileViewerButton = ({ file, index, onDelete, readOnly }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1); // State to track zoom level

  const toggleFileView = () => setIsOpen(!isOpen);

  const zoomIn = () => setZoom((prevZoom) => prevZoom + 0.1);
  const zoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.1)); // Prevent zooming out too much

  const FileViewer = () => {
    const fileType = getFileType(file);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close and Zoom buttons */}
          <div className="absolute top-4 right-4 flex space-x-2 z-10">
            <button
              onClick={toggleFileView}
              className="p-2 bg-white rounded-full hover:bg-gray-200"
            >
              <X size={24} />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 bg-white rounded-full hover:bg-gray-200"
            >
              <ZoomOut size={24} />
            </button>
            <button
              onClick={zoomIn}
              className="p-2 bg-white rounded-full hover:bg-gray-200"
            >
              <ZoomIn size={24} />
            </button>
          </div>

          {/* Render the content with zoom applied */}
          <div
            className={`flex items-center justify-center`}
            style={{
              transform: `scale(${zoom})`,
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
            }}
          >
            {renderContent(fileType)}
          </div>
        </div>
      </div>
    );
  };

  const getFileType = (file) => {
    const extension = file.split('.').pop().toLowerCase();
    if (['jpeg', 'jpg', 'gif', 'png'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
    return 'other';
  };

  const renderContent = (fileType) => {
    switch (fileType) {
      case 'image':
        return <img src={file} alt="Opened file" className="max-w-[90%] max-h-[90%] object-contain" />;
      case 'pdf':
        return <iframe src={file} title="PDF Viewer" className="w-full h-full" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />;
      case 'audio':
        return (
          <audio controls className="w-full">
            <source src={file} type={`audio/${file.split('.').pop()}`} />
            Your browser does not support the audio element.
          </audio>
        );
      default:
        return <iframe src={file} title="File Viewer" className="w-full h-full" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />;
    }
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