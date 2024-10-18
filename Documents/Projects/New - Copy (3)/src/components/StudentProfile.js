import React, { useState, useEffect, useContext } from 'react';
import { Camera, Edit2, Save, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
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
import '../styles/StudentProfile.css';
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
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const isAdminView = location.pathname.startsWith('/student/');
  const { isFinancialSectionVisible } = useContext(VisibilityContext);
  const { students, setStudents } = useContext(GlobalStateContext);

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
          if (data.image && data.image !== DEFAULT_PROFILE_PIC) {
            setImage(data.image);
            setHasCustomImage(true);
          } else {
            setImage(DEFAULT_PROFILE_PIC);
            setHasCustomImage(false);
          }
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
      alert('Profile saved successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert('Error saving profile. Please try again.');
    }
  };

  const renderField = (label, value, editComponent) => {
    return (
      <div>
        <Label htmlFor={label.toLowerCase()}>{label}</Label>
        {isEditing ? editComponent : <p>{value}</p>}
      </div>
    );
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
                onError={handleImageError}
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
                  {hasCustomImage && !imageError && (
                    <Button onClick={removeImage} className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md custom-button">
                      <Trash2 size={16} />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="md:w-2/3 space-y-4">
            {renderField("Имя", name, 
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
              />
            )}
            {renderField("Возраст (не обязательно)", age, 
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

        <div className="settings-container">
  {showSetPassword && <SetPassword studentId={studentId} allowEditing={!isInferiorView} />}
  
        <div className="settings-container">
        </div></div>


        {showVisibility && !isInferiorView && <Visibility />}
        <div className="mt-6">
</div>
        {isFinancialSectionVisible && (
          <div className="mt-6">
            {/* Add financial section content here */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentProfile;