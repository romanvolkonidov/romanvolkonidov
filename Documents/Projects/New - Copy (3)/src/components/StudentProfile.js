import React, { useState, useEffect, useContext } from 'react';
import { Camera, Edit2, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import Label from './ui/Label';
import Textarea from './ui/Textarea';
import { Button } from './ui/Button';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import SetPassword from './SetPassword';
import Visibility from './Visibility';
import { VisibilityContext } from '../context/VisibilityContext';
import { GlobalStateContext } from '../context/GlobalStateContext';
import NotificationSender from './NotificationSender';

const DEFAULT_PROFILE_PIC = '/icons/profile.png';

const StudentProfile = ({ studentId, showSetPassword = true, showVisibility = false, isInferiorView = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(DEFAULT_PROFILE_PIC);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isFinancialSectionVisible } = useContext(VisibilityContext);
  const { students, setStudents } = useContext(GlobalStateContext);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!studentId) {
        console.error("studentId is undefined");
        return;
      }

      try {
        const docRef = doc(db, 'studentProfiles', studentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setAge(data.age || '');
          setLearningGoals(data.learningGoals || '');
          setDescription(data.description || '');
          if (data.image && data.image !== DEFAULT_PROFILE_PIC) {
            setImage(data.image);
            setHasCustomImage(true);
          } else {
            setImage(DEFAULT_PROFILE_PIC);
            setHasCustomImage(false);
          }
        } else {

        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [studentId]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setHasCustomImage(true);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(DEFAULT_PROFILE_PIC);
    setHasCustomImage(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImage(DEFAULT_PROFILE_PIC);
    setHasCustomImage(false);
    setImageError(true);
  };

  const saveProfile = async () => {
    if (!studentId) {
      console.error("studentId is undefined");
      return;
    }

    try {
      const docRef = doc(db, 'studentProfiles', studentId);
      const profileData = { 
        name, 
        age, 
        learningGoals, 
        description,
        image: hasCustomImage && !imageError ? image : null
      };
      await setDoc(docRef, profileData, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const renderField = (label, value, editComponent) => {
    return (
      <div className="space-y-1">
        <Label htmlFor={label.toLowerCase()}>{label}</Label>
        {isEditing ? editComponent : <p className="text-gray-700">{value || 'Не указано'}</p>}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold text-center">{name || 'Имя не указано'}</h1>
          {isEditing && (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите ваше имя"
              className="mt-4 bg-white text-black"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Профиль студента</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                <img
                  src={image}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={handleImageError}
                />
                {isEditing && (
                  <>
                    <label htmlFor="image-upload" className="absolute bottom-2 right-2 bg-white rounded-full p-2 cursor-pointer shadow-md">
                      <Camera size={16} />
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {hasCustomImage && !imageError && (
                      <Button onClick={removeImage} variant="outline" size="icon" className="absolute top-2 right-2 rounded-full">
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="col-span-2 space-y-4">
              {renderField("Возраст", age, 
                <Input
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Введите ваш возраст"
                />
              )}
              {renderField("Цели обучения", learningGoals, 
                <Textarea
                  id="learningGoals"
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  placeholder="Опишите ваши цели обучения"
                  rows={3}
                />
              )}
              {renderField("О себе/О моем ребенке", description, 
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Расскажите немного о себе или о вашем ребенке"
                  rows={4}
                />
              )}
              {isEditing ? (
                <Button onClick={saveProfile} className="w-full">
                  <Save className="mr-2 h-4 w-4" /> Сохранить
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Edit2 className="mr-2 h-4 w-4" /> Редактировать профиль
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showSetPassword && (
          <SetPassword studentId={studentId} allowEditing={!isInferiorView} />
        )}
        <NotificationSender studentId={studentId} />
      </div>

      {showVisibility && !isInferiorView && (
        <Card>
          <CardHeader>
            <CardTitle>Настройки видимости</CardTitle>
          </CardHeader>
          <CardContent>
            <Visibility />
          </CardContent>
        </Card>
      )}

      {isFinancialSectionVisible && (
        <Card>
          <CardHeader>
            <CardTitle>Финансовая информация</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add financial section content here */}
          </CardContent>
        </Card>
      )}

    
    </div>
  );
};

export default StudentProfile;