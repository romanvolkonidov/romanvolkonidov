import React, { useState } from 'react';

const Test = () => {
  const [curriculum, setCurriculum] = useState([]);
  const [homework, setHomework] = useState([]);
  const [newPart, setNewPart] = useState({ number: '', name: '', completionDate: '', completionPercentage: 0, subpoints: [] });
  const [newSubpoint, setNewSubpoint] = useState({ number: '', name: '', description: '' });
  const [newHomework, setNewHomework] = useState({ text: '', files: [], links: '', videos: '', audios: '' });
  const [filter, setFilter] = useState('all');

  const handleAddPart = () => {
    setCurriculum([...curriculum, newPart]);
    setNewPart({ number: '', name: '', completionDate: '', completionPercentage: 0, subpoints: [] });
  };

  const handleAddSubpoint = () => {
    setNewPart({ ...newPart, subpoints: [...newPart.subpoints, newSubpoint] });
    setNewSubpoint({ number: '', name: '', description: '' });
  };

  const handleEditPart = (index, updatedPart) => {
    const updatedCurriculum = curriculum.map((part, i) => (i === index ? updatedPart : part));
    setCurriculum(updatedCurriculum);
  };

  const handleAddHomework = () => {
    setHomework([...homework, newHomework]);
    setNewHomework({ text: '', files: [], links: '', videos: '', audios: '' });
  };

  const filteredCurriculum = curriculum.filter(part => {
    if (filter === 'completed') {
      return part.completionDate;
    } else if (filter === 'future') {
      return !part.completionDate;
    } else {
      return true;
    }
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Enter Curriculum</h1>
      <form className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Part Number</label>
          <input
            type="number"
            value={newPart.number}
            onChange={(e) => setNewPart({ ...newPart, number: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Part Name</label>
          <input
            type="text"
            value={newPart.name}
            onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Completion Date</label>
          <input
            type="date"
            value={newPart.completionDate}
            onChange={(e) => setNewPart({ ...newPart, completionDate: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Completion Percentage</label>
          <input
            type="number"
            value={newPart.completionPercentage}
            onChange={(e) => setNewPart({ ...newPart, completionPercentage: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Subpoint Number</label>
          <input
            type="number"
            value={newSubpoint.number}
            onChange={(e) => setNewSubpoint({ ...newSubpoint, number: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Subpoint Name</label>
          <input
            type="text"
            value={newSubpoint.name}
            onChange={(e) => setNewSubpoint({ ...newSubpoint, name: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Subpoint Description</label>
          <textarea
            value={newSubpoint.description}
            onChange={(e) => setNewSubpoint({ ...newSubpoint, description: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button type="button" onClick={handleAddSubpoint} className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4">
          Add Subpoint
        </button>
        <button type="button" onClick={handleAddPart} className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Add Part
        </button>
      </form>

      <h2 className="text-xl font-bold mb-4">Subpoints</h2>
      <ul>
        {newPart.subpoints.map((subpoint, index) => (
          <li key={index} className="mb-2 p-2 border border-gray-300 rounded-md">
            <p><strong>Number:</strong> {subpoint.number}</p>
            <p><strong>Name:</strong> {subpoint.name}</p>
            <p><strong>Description:</strong> {subpoint.description}</p>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mb-4">Enter Homework</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Homework Text</label>
          <textarea
            value={newHomework.text}
            onChange={(e) => setNewHomework({ ...newHomework, text: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Attach Files</label>
          <input
            type="file"
            multiple
            onChange={(e) => setNewHomework({ ...newHomework, files: e.target.files })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Links</label>
          <input
            type="text"
            value={newHomework.links}
            onChange={(e) => setNewHomework({ ...newHomework, links: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Videos</label>
          <input
            type="text"
            value={newHomework.videos}
            onChange={(e) => setNewHomework({ ...newHomework, videos: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Audios</label>
          <input
            type="text"
            value={newHomework.audios}
            onChange={(e) => setNewHomework({ ...newHomework, audios: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button type="button" onClick={handleAddHomework} className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Add Homework
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Curriculum Parts</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Part Number</th>
              <th className="py-2">Part Name</th>
              <th className="py-2">Completion Date</th>
              <th className="py-2">Completion Percentage</th>
              <th className="py-2">Subpoints</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCurriculum.map((part, index) => (
              <tr key={index} className="border-t">
                <td className="py-2">{part.number}</td>
                <td className="py-2">{part.name}</td>
                <td className="py-2">{part.completionDate || 'Future Lesson'}</td>
                <td className="py-2">{part.completionPercentage}%</td>
                <td className="py-2">
                  <ul>
                    {part.subpoints.map((subpoint, subIndex) => (
                      <li key={subIndex}>
                        <strong>{part.number}.{subpoint.number} {subpoint.name}:</strong> {subpoint.description}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-2">
                  <button
                    onClick={() => handleEditPart(index, { ...part, name: prompt('Edit Part Name', part.name) })}
                    className="px-2 py-1 bg-yellow-500 text-white rounded-md"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Homework</h2>
        <ul>
          {homework.map((hw, index) => (
            <li key={index} className="mb-2 p-2 border border-gray-300 rounded-md">
              <p><strong>Text:</strong> {hw.text}</p>
              <p><strong>Files:</strong> {hw.files.length} files attached</p>
              <p><strong>Links:</strong> {hw.links}</p>
              <p><strong>Videos:</strong> {hw.videos}</p>
              <p><strong>Audios:</strong> {hw.audios}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex space-x-4">
        <button onClick={() => setFilter('completed')} className="px-4 py-2 bg-green-500 text-white rounded-md">Completed Lessons</button>
        <button onClick={() => setFilter('future')} className="px-4 py-2 bg-yellow-500 text-white rounded-md">Future Lessons</button>
        <button onClick={() => setFilter('homework')} className="px-4 py-2 bg-red-500 text-white rounded-md">Homework</button>
      </div>
    </div>
  );
};

export default Test;