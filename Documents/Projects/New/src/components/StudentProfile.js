import React, { useState, useEffect } from 'react';
import { Camera, Edit2, Save, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import Label from './ui/Label';
import Textarea from './ui/Textarea';
import { Button } from './ui/Button';
import { db } from '../firebase'; // Adjust this import based on your Firebase configuration file location
import { doc, getDoc, setDoc } from 'firebase/firestore';

const StudentProfile = ({ studentId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('/api/placeholder/200/200');

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!studentId) {
        console.error("studentId is undefined");
        return;
      }

      try {
        const docRef = doc(db, 'studentProfiles', studentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && isMounted) {
          const data = docSnap.data();
          setName(data.name || '');
          setAge(data.age || '');
          setLearningGoals(data.learningGoals || '');
          setDescription(data.description || '');
          setImage(data.image || '/api/placeholder/200/200');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage('/api/placeholder/200/200');
  };

  const saveProfile = async () => {
    if (!studentId) {
      console.error("studentId is undefined");
      return;
    }

    try {
      const docRef = doc(db, 'studentProfiles', studentId);
      await setDoc(docRef, { name, age, learningGoals, description, image }, { merge: true });
      alert('Profile saved successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert('Error saving profile. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="relative w-full aspect-square max-w-[200px] mx-auto">
              <img
                src={image}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              {isEditing && (
                <>
                  <label htmlFor="image-upload" className="absolute bottom-2 right-2 bg-white rounded-full p-2 cursor-pointer shadow-md custom-button">
                    <Camera size={16} />
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <Button onClick={removeImage} className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md custom-button">
                    <Trash2 size={16} />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="md:w-2/3 space-y-4">
            <div>
              <Label htmlFor="name">Имя</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-lg font-semibold">{name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="age">Возраст (не обязательно)</Label>
              {isEditing ? (
                <Input
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                />
              ) : (
                <p>{age}</p>
              )}
            </div>
            <div>
              <Label htmlFor="learningGoals">Цели обучения</Label>
              {isEditing ? (
                <Textarea
                  id="learningGoals"
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  placeholder="Describe your learning goals"
                  rows={3}
                />
              ) : (
                <p>{learningGoals}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">О себе/О моем ребенке</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about yourself or your child"
                  rows={4}
                />
              ) : (
                <p>{description}</p>
              )}
            </div>
            {isEditing ? (
              <Button onClick={saveProfile} className="w-full custom-button">
                <Save className="mr-2 h-4 w-4" /> Сохранить
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="w-full custom-button">
                <Edit2 className="mr-2 h-4 w-4" /> Редактировать профиль
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfile;