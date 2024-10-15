import React, { useState } from 'react';
import { AlertCircle, Image, Music, Video } from 'lucide-react';

const FillInTheBlank = ({ 
  id,
  questionText = "Enter your question here with ___ for the blank",
  gapIndex = 0,
  onSave,
  initialValue = '',
  placeholder = "Type your answer here..."
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [media, setMedia] = useState({ picture: null, audio: null, video: null });
  
  const inputId = React.useId();

  const handleChange = (e) => {
    setValue(e.target.value);
    setError(e.target.value.length < 1 ? 'Answer cannot be empty' : '');
  };

  const handleMediaChange = (type, file) => {
    setMedia(prev => ({ ...prev, [type]: file }));
  };

  const generateQuestionObject = () => {
    const questionParts = questionText.split('___');
    return {
      id,
      type: 'fillInTheBlank',
      questionParts,
      gapIndex,
      correctAnswer: value,
      media: {
        picture: media.picture ? URL.createObjectURL(media.picture) : null,
        audio: media.audio ? URL.createObjectURL(media.audio) : null,
        video: media.video ? URL.createObjectURL(media.video) : null
      },
      placeholder
    };
  };

  const handleSave = () => {
    if (!error) {
      const questionObject = generateQuestionObject();
      onSave(questionObject);
    }
  };

  const renderQuestion = () => {
    const parts = questionText.split('___');
    return (
      <p className="text-lg font-semibold mb-4">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="px-1 py-0.5 bg-yellow-200 rounded">___</span>
            )}
          </React.Fragment>
        ))}
      </p>
    );
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      {renderQuestion()}
      
      <div className="space-y-3 mb-4">
        <label htmlFor={inputId} className="block text-base font-medium text-gray-700">
          Your answer:
        </label>
        <div className="relative">
          <input
            id={inputId}
            type="text"
            onChange={handleChange}
            value={value}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              error 
                ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <p className="font-medium">Attach media:</p>
        <div className="flex space-x-2">
          <label className="flex items-center px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
            <Image className="mr-2" size={20} />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleMediaChange('picture', e.target.files[0])}
              className="hidden"
            />
            Picture
          </label>
          <label className="flex items-center px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
            <Music className="mr-2" size={20} />
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleMediaChange('audio', e.target.files[0])}
              className="hidden"
            />
            Audio
          </label>
          <label className="flex items-center px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
            <Video className="mr-2" size={20} />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleMediaChange('video', e.target.files[0])}
              className="hidden"
            />
            Video
          </label>
        </div>
      </div>

      {(media.picture || media.audio || media.video) && (
        <div className="space-y-2 mb-4">
          <p className="font-medium">Attached media:</p>
          <div className="flex flex-wrap gap-2">
            {media.picture && <img src={URL.createObjectURL(media.picture)} alt="Attached" className="h-20 w-20 object-cover rounded" />}
            {media.audio && <audio controls src={URL.createObjectURL(media.audio)} className="w-full" />}
            {media.video && <video controls src={URL.createObjectURL(media.video)} className="w-full" />}
          </div>
        </div>
      )}

      <button 
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Save Question
      </button>
    </div>
  );
};

export default FillInTheBlank;