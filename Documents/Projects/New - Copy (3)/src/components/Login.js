import React, { useState, useContext } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"; // Adjust import as needed
import { Input } from "@/components/ui/Input"; // Adjust import as needed
import { Button } from "@/components/ui/Button"; // Adjust import as needed
import Label from "@/components/ui/Label"; // Adjust import as needed
import { User, Lock } from 'lucide-react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import '../styles/Login.css';

const Login = () => {
  const { setAuthenticatedStudent } = useContext(GlobalStateContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const adminUsername = 'admin';
      const adminPassword = '2206';

      if (username === adminUsername && password === adminPassword) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', 'true');
        setError('');
        navigate('/');
        return;
      }

      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const student = students.find(s => s.username === username && s.password === password);

      if (student) {
        setAuthenticatedStudent(student);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', 'false');
        setError('');

        // Save student-specific data to Firestore
        const studentDocRef = doc(db, 'students', student.id);
        await setDoc(studentDocRef, { lastLogin: new Date() }, { merge: true });

        navigate(`/dashboard/${student.id}`);
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('Error logging in');
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="main flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700">
      <Card className="w-full max-w-[90%] bg-black bg-opacity-50 backdrop-blur-md border border-gray-600">
        <CardHeader className="space-y-1 flex justify-center flex-col items-center">
          <div className="flex items-center space-x-4">
            <img src="./../../logo.jpg" className="logo" alt="Logo" />
            <CardTitle className="text-3xl font-bold text-center text-white">Вход</CardTitle>
          </div>
          <p className="text-sm text-center text-gray-400">Введите свои учетные данные для доступа к аккаунту</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-200">Имя пользователя</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full text-black placeholder-gray-500 border-gray-600 focus:border-white focus:ring-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-200">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full text-black placeholder-gray-500 border-gray-600 focus:border-white focus:ring-white"
                  required
                />
              </div>
            </div>
            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="w-full bg-black hover:#333 text-black font-semibold transition-colors duration-300"
              >
                Войти
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-center pb-4">
            <a href="#" className="text-sm text-gray-400 hover:text-white"></a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;