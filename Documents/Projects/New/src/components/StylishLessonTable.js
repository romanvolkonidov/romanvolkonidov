import React from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';

const LessonRow = ({ lesson, course, chapter, onUncheck, onDateChange, onProgressChange, onHomeworkResultChange, onFileChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <>
      <tr className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
        <td className="p-4">
          <Input
            type="date"
            value={lesson.date || new Date().toISOString().split('T')[0]}
            onChange={(e) => onDateChange(lesson.lessonId, e)}
            className="w-full"
          />
        </td>
        <td className="p-4 font-medium text-gray-900">{course.name}</td>
        <td className="p-4">{chapter.name}</td>
        <td className="p-4">{lesson.name}</td>
        <td className="p-4">
          <Progress value={lesson.progress || 0} className="w-full" />
          <span className="text-sm text-gray-500 mt-1">{lesson.progress || 0}%</span>
        </td>
        <td className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center"
          >
            {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </td>
        <td className="p-4">
          <Button onClick={() => onUncheck(course.id, chapter.id, lesson.id)} variant="destructive" size="sm">
            <X className="mr-2 h-4 w-4" /> Uncheck
          </Button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan="7" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Homework</h4>
                {lesson.homeworks?.map((hw) => (
                  <div key={hw.id} className="mb-4">
                    <p className="text-sm text-gray-600">{hw.text}</p>
                    {renderFileLinks(hw.files, 'File', lesson.id, hw.id, 'files')}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Hand In Homework</h4>
                {lesson.homeworks?.map((hw) => (
                  <div key={hw.id} className="mb-4">
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => onFileChange(lesson.id, hw.id, e, 'handInFiles')}
                      className="mb-2"
                    />
                    {renderFileLinks(lesson.selectedHomeworks?.[hw.id]?.handInFiles || [], 'Hand In File', lesson.id, hw.id, 'handInFiles')}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Homework Results</h4>
                {lesson.homeworks?.map((hw) => (
                  <div key={hw.id} className="mb-4">
                    <Input
                      type="number"
                      value={lesson.selectedHomeworks?.[hw.id]?.result || 0}
                      onChange={(e) => onHomeworkResultChange(lesson.id, hw.id, e)}
                      className="mb-2"
                    />
                    <Progress value={lesson.selectedHomeworks?.[hw.id]?.result || 0} className="w-full mb-2" />
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => onFileChange(lesson.id, hw.id, e, 'resultFiles')}
                      className="mb-2"
                    />
                    {renderFileLinks(lesson.selectedHomeworks?.[hw.id]?.resultFiles || [], 'Result File', lesson.id, hw.id, 'resultFiles')}
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const renderFileLinks = (files, label, lessonId, homeworkId, fileType) => (
  <div className="flex flex-wrap gap-2">
    {files.map((file, index) => (
      <a
        key={index}
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 text-sm underline"
      >
        {`${label} ${index + 1}`}
      </a>
    ))}
  </div>
);

const StylishLessonTable = ({ selectedLessons = [], courses, onUncheck, onDateChange, onProgressChange, onHomeworkResultChange, onFileChange }) => {
  const sortedLessons = [...selectedLessons].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="p-4">Date</th>
            <th className="p-4">Course</th>
            <th className="p-4">Chapter</th>
            <th className="p-4">Lesson</th>
            <th className="p-4">Progress</th>
            <th className="p-4">Details</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedLessons.map((lesson) => {
            const course = courses.find(c => c.id === lesson.courseId);
            const chapter = course?.chapters.find(ch => ch.id === lesson.chapterId);

            if (!course || !chapter) return null;

            return (
              <LessonRow
                key={lesson.lessonId}
                lesson={lesson}
                course={course}
                chapter={chapter}
                onUncheck={onUncheck}
                onDateChange={onDateChange}
                onProgressChange={onProgressChange}
                onHomeworkResultChange={onHomeworkResultChange}
                onFileChange={onFileChange}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StylishLessonTable;