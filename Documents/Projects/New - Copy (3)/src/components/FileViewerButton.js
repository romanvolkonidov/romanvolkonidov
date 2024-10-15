const FileViewer = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const isImage = file.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/);

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + 0.1, 3)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 0.1, 0.1)), []);

  const downloadFile = useCallback(() => {
    const link = document.createElement('a');
    link.href = file;
    link.download = file.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [file]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] m-4 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex space-x-2">
            {isImage && (
              <>
                <button onClick={zoomIn} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                  <ZoomIn size={20} />
                </button>
                <button onClick={zoomOut} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                  <ZoomOut size={20} />
                </button>
              </>
            )}
            <button onClick={downloadFile} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
              <Download size={20} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-grow overflow-auto p-4">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={file} 
                alt="Opened file" 
                className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-in-out' }}
              />
            </div>
          ) : (
            <iframe src={file} title="Opened file" className="w-full h-full border-0" />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewerButton;