import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Volume2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AudioPlayer = ({ file }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 flex items-center justify-center bg-gray-100">
        <Volume2 size={48} className="text-blue-500" />
      </div>
      <div className="p-4">
        <audio controls className="w-full">
          <source src={file} type={`audio/${file.split('.').pop()}`} />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

const FileViewerModal = ({ file, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'image';
    if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
    return 'unsupported';
  };

  const fileType = getFileType(file);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 3));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 h-5/6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-100">
          <h2 className="text-xl font-bold">File Viewer</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-grow overflow-auto p-4">
          {fileType === 'pdf' && (
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex justify-center"
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>
          )}
          {fileType === 'image' && (
            <PhotoProvider>
              <PhotoView src={file}>
                <img src={file} alt="Viewable content" className="max-w-full max-h-full cursor-zoom-in" />
              </PhotoView>
            </PhotoProvider>
          )}
          {fileType === 'audio' && <AudioPlayer file={file} />}
          {fileType === 'unsupported' && <p className="text-center">Unsupported file type</p>}
        </div>
        {fileType === 'pdf' && (
          <div className="flex justify-between items-center p-4 bg-gray-100">
            <div>
              <button 
                onClick={() => changePage(-1)} 
                disabled={pageNumber <= 1}
                className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => changePage(1)} 
                disabled={pageNumber >= numPages}
                className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
              >
                <ChevronRight size={24} />
              </button>
              <span className="mx-2">
                Page {pageNumber} of {numPages}
              </span>
            </div>
            <div>
              <button onClick={zoomOut} className="p-2 rounded-full hover:bg-gray-200">
                <ZoomOut size={24} />
              </button>
              <button onClick={zoomIn} className="p-2 rounded-full hover:bg-gray-200">
                <ZoomIn size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewerModal;