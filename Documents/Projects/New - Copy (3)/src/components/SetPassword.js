import React, { useState, useContext, useEffect } from 'react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SetPassword = ({ studentId, allowEditing = true }) => {
  const { students, setStudents } = useContext(GlobalStateContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchStudentCredentials = async () => {
      try {
        const studentDoc = await getDoc(doc(db, 'students', studentId));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          setUsername(studentData.username || '');
          setPassword(studentData.password || '');
        }
      } catch (error) {
        console.error("Error fetching student credentials:", error);
        toast.error('Не удалось загрузить данные студента');
      }
    };

    fetchStudentCredentials();
  }, [studentId]);

  const handleSetCredentials = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    try {
      const studentDoc = doc(db, 'students', studentId);
      const updatedUsername = newUsername || username;
      const updatedPassword = newPassword || password;
      await updateDoc(studentDoc, { 
        username: updatedUsername, 
        password: updatedPassword 
      });

      const updatedStudents = students.map(student => 
        student.id === studentId ? { ...student, username: updatedUsername, password: updatedPassword } : student
      );

      setStudents(updatedStudents);
      setUsername(updatedUsername);
      setPassword(updatedPassword);
      toast.success('Учетные данные успешно обновлены');
      setIsEditing(false);
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error updating credentials:", error);
      toast.error('Ошибка при обновлении учетных данных');
    }
  };

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Учетные данные</CardTitle>
        </CardHeader>
        <CardContent>
          {username && password ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Логин</label>
                <p className="font-semibold">{username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Пароль</label>
                <p className="font-semibold">{password}</p>
              </div>
              {allowEditing && !isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  Изменить учетные данные
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="mb-2">Учетные данные еще не установлены.</p>
              {allowEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  Установить начальные учетные данные
                </Button>
              )}
            </div>
          )}
          
          {allowEditing && isEditing && (
            <div className="space-y-4 mt-4">
              <Input
                type="text"
                placeholder={username ? 'Новый логин' : 'Логин'}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder={password ? 'Новый пароль' : 'Пароль'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button 
                onClick={handleSetCredentials}
                className="w-full"
              >
                {username && password ? 'Обновить учетные данные' : 'Установить учетные данные'}
              </Button>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  setNewUsername('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                variant="secondary"
                className="w-full"
              >
                Отмена
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default SetPassword;