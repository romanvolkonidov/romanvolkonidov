import React, { useState, useEffect, useMemo, useCallback, useRef  } from 'react';
import { Shuffle, AlertCircle, Play, Pause, Volume2, RefreshCw } from "lucide-react";
import './QuestionTypes.css';
import { Slider } from '@/components/ui/Slider';
import PropTypes from 'prop-types';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import Label from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import classNames from 'classnames';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { debounce } from 'lodash';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

// Common styles
const commonStyles = {
  container: "w-full max-w-lg mx-auto p-6 space-y-6 font-sans",
  question: "text-xl font-semibold text-gray-900 mb-4",
  optionContainer: "space-y-4",
  option: "flex items-center space-x-3 p-4 rounded-lg transition-all duration-200 ease-in-out border-2 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50",
  optionLabel: "flex-grow text-base font-medium text-gray-700 cursor-pointer",
  input: "w-full p-3 border-2 rounded-md transition-all duration-200 outline-none",
  button: "mt-4 flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md transition duration-150 hover:bg-gray-100",
  error: "text-red-500 text-sm mt-1",
  "shadow-lg": "box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);",
};


const getYouTubeEmbedUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  if (youtubeRegex.test(url)) {
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
};

export const MediaWrapper = ({ pictureUrl, audioUrl, videoUrl }) => {
  return (
    <div className="media-wrapper mb-4">
      {pictureUrl && (
        <img src={pictureUrl} alt="Question visual" className="max-w-full h-auto mb-2 rounded-lg" />
      )}
      {audioUrl && <MediaContent audioUrl={audioUrl} />}
      {videoUrl && <MediaContent videoUrl={videoUrl} />}
    </div>
  );
};
// Media component to be used in all question types
export const MediaContent = ({ pictureUrl, audioUrl, videoUrl, question, onChange, value }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioInfo, setAudioInfo] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      const audio = audioRef.current;
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        setIsLoading(false);
        setAudioInfo({
          duration: audio.duration,
          type: audio.currentSrc.split('.').pop(),
        });
      });
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.src = audioUrl;
      audio.load();
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(setError);
      } else {
        audioRef.current.pause();
      }
      setIsPlaying(!audioRef.current.paused);
    }
  };

  const handleVolumeChange = (newVolume) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0];
      setVolume(newVolume[0]);
    }
  };

  const handleProgressChange = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const mediaContainerClass = "mb-4 overflow-hidden rounded-lg shadow-md";
  const mediaClass = "w-full h-auto max-h-96 object-contain";

  return (
    <div className="space-y-4">
    {pictureUrl && (
      <div className="mb-4 overflow-hidden rounded-1g shadow-md">
        <img 
          src={pictureUrl} 
          alt="Question visual" 
          className="w-full h-auto max-h-96 rounded-1g object-contain"
        />
      </div>
    )}
      {videoUrl && (
        <div className={mediaContainerClass} style={{ aspectRatio: '16 / 9' }}>
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded video"
            className={`${mediaClass} w-full h-full`}
          />
        </div>
      )}
      {audioUrl && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button onClick={togglePlayPause} variant="outline" size="icon" disabled={isLoading || !!error}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleProgressChange}
              className="w-full"
              disabled={isLoading || !!error}
            />
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4" />
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
              disabled={isLoading || !!error}
            />
          </div>
          <audio ref={audioRef} className="hidden" />
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      {question && (
        <div className={commonStyles.container}>
          <p className={commonStyles.question}>{question}</p>
          <Input 
            type="text" 
            placeholder="Enter your answer here"
            onChange={(e) => onChange(e.target.value)} 
            value={value || ''} 
            className={commonStyles.input}
          />
        </div>
      )}
    </div>
  );
};


// MultipleChoice Component
export const MultipleChoice = ({ question, options = [], onChange, value, pictureUrl, audioUrl, videoUrl }) => {
  return (
    <div className={commonStyles.container}>
            <MediaWrapper pictureUrl={pictureUrl} audioUrl={audioUrl} videoUrl={videoUrl} />

      <fieldset>
        <legend className={commonStyles.question}>{question}</legend>
        {options.length === 0 ? (
          <p className="text-red-500 text-center">No options available</p>
        ) : (
          <RadioGroup 
            onValueChange={onChange} 
            value={value} 
            className={commonStyles.optionContainer}
            aria-labelledby="question"
          >
            {options.map((option, index) => {
              const isSelected = value === option;
              return (
                <div
                  key={index}
                  className={`${commonStyles.option} ${isSelected ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-300 hover:bg-gray-100'}`}
                >
                  <RadioGroupItem 
                    value={option} 
                    id={`option-${index}`} 
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`option-${index}`}
                    className={commonStyles.optionLabel}
                  >
                    {option || `Option ${index + 1}`}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
        )}
      </fieldset>
    </div>
  );
};


// FillInTheBlank Component
export const FillInTheBlank = ({ question, onChange, value, error, pictureUrl, audioUrl, videoUrl, placeholder = "Type your answer here..." }) => {
  const inputId = React.useId();

  return (
    <div className={commonStyles.container}>
      <MediaWrapper
        pictureUrl={pictureUrl}
        audioUrl={audioUrl}
        videoUrl={videoUrl}
      />
      <p className={commonStyles.question}>{question}</p>
      <div className="space-y-3">
        <label htmlFor={inputId} className="block text-base font-medium text-gray-700">
          Your answer:
        </label>
        <div className="relative">
          <input
            id={inputId}
            type="text"
            onChange={(e) => onChange(e.target.value)}
            value={value || ''}
            placeholder={placeholder}
            className={`${commonStyles.input} ${error ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
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
          <p id={`${inputId}-error`} className={commonStyles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};







export const TrueFalse = ({ question, onChange, value, pictureUrl, audioUrl, videoUrl }) => {
  return (
    <div className={commonStyles.container}>
            <MediaWrapper pictureUrl={pictureUrl} audioUrl={audioUrl} videoUrl={videoUrl} />

      <p className={commonStyles.question}>{question}</p>
      <RadioGroup 
        onValueChange={onChange} 
        value={value} 
        className={commonStyles.optionContainer}
      >
        {[
          { value: 'true', label: 'True', bgColor: 'bg-blue-100', borderColor: 'border-blue-500' },
          { value: 'false', label: 'False', bgColor: 'bg-red-100', borderColor: 'border-red-500' }
        ].map((option) => (
          <label
            key={option.value}
            className={`${commonStyles.option} ${value === option.value ? `${option.bgColor} ${option.borderColor}` : 'border-gray-300 hover:bg-gray-100'}`}
          >
            <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
            <div 
              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${value === option.value ? option.borderColor : 'border-gray-400'}`}
            >
              {value === option.value && (
                <div className={`w-2 h-2 rounded-full ${option.borderColor.replace('border', 'bg')} m-0.5`} />
              )}
            </div>
            <span className={commonStyles.optionLabel}>{option.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
};



// Draggable component

const noSelectStyle = {
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
};

const SortableItem = ({ id, word }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    ...noSelectStyle,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="px-2 py-1 bg-white rounded-md border border-gray-300 cursor-move hover:bg-gray-50"
    >
      <span className="text-gray-800 text-sm">{word}</span>
    </div>
  );
};

export const Ordering = ({ question, words, onChange, pictureUrl, audioUrl, videoUrl, value }) => {
  const [orderedWords, setOrderedWords] = useState([]);
  const [isMounted, setIsMounted] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const capitalizeFirst = useCallback((arr) =>
    arr.map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()
    )
  , []);

  const parseWords = useCallback((input) =>
    typeof input === 'string' ? input.split(/,\s*/).map(word => word.trim()) : input
  , []);

  useEffect(() => {
    const newWords = value ? parseWords(value) : words;
    const capitalizedWords = capitalizeFirst(newWords);
    setOrderedWords(capitalizedWords);
  }, [value, words, capitalizeFirst, parseWords]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      // Clean up any remaining drag artifacts
      const dragArtifacts = document.querySelectorAll('.opacity-75.shadow-lg');
      dragArtifacts.forEach(el => el.remove());
    };
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setOrderedWords((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        const capitalizedWords = capitalizeFirst(newItems);
        onChange(capitalizedWords.join(', '));
        return capitalizedWords;
      });
    }
  }, [onChange, capitalizeFirst]);

  const resetOrder = useCallback(() => {
    if (!isMounted) return;
    const resetWords = capitalizeFirst(words);
    setOrderedWords(resetWords);
    onChange(resetWords.join(', '));
  }, [words, capitalizeFirst, onChange, isMounted]);

  if (!isMounted) return null;

  return (
    <div className={commonStyles.container}>
            <MediaWrapper pictureUrl={pictureUrl} audioUrl={audioUrl} videoUrl={videoUrl} />

      <p className={commonStyles.question}>{question}</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext  items={orderedWords} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-2 p-4  bg-gray-100 rounded-lg min-h-[60px]">
            {orderedWords.map((word) => (
              <SortableItem key={word} id={word} word={word} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button onClick={resetOrder} className={commonStyles.button}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Reset Order
      </button>
    </div>
  );
};






export const Matching = ({ question, pairs = [], onChange, value, pictureUrl, audioUrl, videoUrl }) => {
  const [matches, setMatches] = useState(value || {});

  useEffect(() => {
    setMatches(value || {});
  }, [value]);

  const handleMatch = useCallback((q, selectedValue) => {
    const newMatches = { ...matches, [q]: selectedValue };
    setMatches(newMatches);

    // Debounce the onChange callback
    const debounceOnChange = debounce(() => onChange(newMatches), 300);
    debounceOnChange();
  }, [matches, onChange]);

  return (
    <div className={commonStyles.container}>
            <MediaWrapper pictureUrl={pictureUrl} audioUrl={audioUrl} videoUrl={videoUrl} />

      <p className={commonStyles.question}>{question}</p>
      {pairs.length > 0 ? (
        pairs.map(({ question: q, function: func }, index) => (
          <div key={index} className="flex items-center gap-4 mb-3">
            <span className="text-gray-700 b text-base">{q}</span>
            <Select
              onValueChange={(value) => handleMatch(q, value)}
              value={matches[q] || ''}
              aria-label={`Выберите правильный ответ для ${q}`}
            >
              <SelectTrigger className="border b border-gray-300 rounded-md p-2 bg-white hover:bg-gray-50 transition duration-150">
                <SelectValue placeholder="Выберите правильный ответ" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-md shadow-lg">
                {pairs.map(({ function: f }, i) => (
                  <SelectItem key={i} value={f} className="p-2 hover:bg-gray-100 cursor-pointer">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))
      ) : (
        <p className="text-red-500">No pairs available.</p>
      )}
    </div>
  );
};


// Utility to debounce a function


export const ImageQuestion = ({ question, pictureUrl, audioUrl, videoUrl, onChange, value }) => (
  <div className={commonStyles.container}>
    <p className={commonStyles.question}>{question}</p>
    <div className="mb-4 overflow-hidden rounded-lg shadow-md">
      <img 
        src={pictureUrl} 
        alt="Question" 
        className="w-full h-auto max-h-96 object-contain"
      />
    </div>
    <Input 
      type="text" 
      placeholder="Enter your answer here"
      onChange={(e) => onChange(e.target.value)} 
      value={value || ''} 
      className={commonStyles.input}
    />
  </div>
);


export const Dropdown = ({ question, options, onChange, value, pictureUrl, audioUrl, videoUrl }) => (
  <div className={commonStyles.container}>
          <MediaWrapper pictureUrl={pictureUrl} audioUrl={audioUrl} videoUrl={videoUrl} />

    <p className={commonStyles.question}>{question}</p>
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 b">
        <SelectValue placeholder="Select an option" className="text-gray-700 b" />
      </SelectTrigger>
      <SelectContent className="bg-white rounded-md shadow-lg">
        {options.map((option, index) => (
          <SelectItem key={index} value={option} className="p-2 b hover:bg-gray-100 cursor-pointer">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);



export const SentenceCompletion = React.memo(({ question, options, onChange, value, pictureUrl, audioUrl, videoUrl }) => {
  const [answers, setAnswers] = useState(value || new Array(options.length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value && value.length === options.length) {
      setAnswers(value);
    }
  }, [value, options.length]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, newValue) => {
    const newAnswers = [...answers];
    newAnswers[index] = newValue;
    setAnswers(newAnswers);
    onChange(newAnswers);
  };

  const handleReset = () => {
    setAnswers(new Array(options.length).fill(''));
    onChange(new Array(options.length).fill(''));
  };

  return (
    <div className={commonStyles.container}>
            <MediaWrapper pictureUrl={pictureUrl} audioUrl={audioUrl} videoUrl={videoUrl} />

      <label className={commonStyles.question}>{question}</label>
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <label htmlFor={`answer-${index}`} className="w-8 text-right">{index + 1}.</label>
          <input
            id={`answer-${index}`}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            placeholder="Напишите ваш ответ"
            onChange={(e) => handleChange(index, e.target.value)}
            value={answers[index]}
            className={`${commonStyles.input} ${answers[index] ? '' : 'border-gray-600-500'}`}
          />
        </div>
      ))}
      <button onClick={handleReset} className={commonStyles.button}>Reset Answers</button>
    </div>
  );
});

SentenceCompletion.propTypes = {
  question: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
};


export const ErrorCorrection = ({ question, onChange, value, pictureUrl, audioUrl, videoUrl }) => (
  <div className={commonStyles.container}>
          <MediaWrapper pictureUrl={pictureUrl} audioUrl={audioUrl} videoUrl={videoUrl} />

    <p className={commonStyles.question}>{question}</p>
    <Input type="text" onChange={(e) => onChange(e.target.value)} value={value || ''} className={commonStyles.input} />
  </div>
);





export const VideoQuestion = ({ question, pictureUrl, audioUrl, videoUrl, onChange, value }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    if (!videoUrl) {
      setIsLoading(false);
      setEmbedUrl('');
      return;
    }

    const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);
    if (youtubeEmbedUrl) {
      setEmbedUrl(youtubeEmbedUrl);
      setIsLoading(false);
    } else {
      setEmbedUrl('');
    }

    return () => {
      // Cleanup function
      setIsLoading(true);
      setError(null);
    };
  }, [videoUrl]);

  return (
<section aria-labelledby="question-title" className={commonStyles.container}>
  
<h2 id="question-title" className={commonStyles.question}>{question}</h2>
      {isLoading && <p>Loading video...</p>}
      {error && <p>Error loading video: {error}</p>}
      {embedUrl ? (
        <iframe
          width="100%"
          height="315"
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
          className="mb-4"
          onLoad={() => setIsLoading(false)}
          onError={(e) => setError('Failed to load YouTube video')}
        ></iframe>
      ) : videoUrl && (
        <video 
          controls 
          src={videoUrl} 
          className="mb-4 w-full" 
          onLoadedData={() => setIsLoading(false)}
          onError={(e) => setError(e.target.error.message)}
          preload="metadata"
        >
          Your browser does not support the video element.
        </video>
      )}
       <label htmlFor="answer-input" className="sr-only">Your answer</label>
      <input
        id="answer-input"
        type="text"
        onChange={(e) => onChange(e.target.value)}
        value={value || ''}
        placeholder="Enter your answer"
        className={commonStyles.input}
      />
    </section>
  );
};

VideoQuestion.propTypes = {
  question: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string
};
