import React, { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { User, Lock } from 'lucide-react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import '../styles/Login.css';

const Login = () => {
  const { setAuthenticatedStudent } = useContext(GlobalStateContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const autoLogin = async () => {
      const rememberedUser = localStorage.getItem('rememberedUser');
      const justLoggedOut = sessionStorage.getItem('justLoggedOut');
      
      if (rememberedUser && !justLoggedOut) {
        const { username, password } = JSON.parse(rememberedUser);
        await handleLogin(null, username, password);
      }
      
      // Очищаем флаг выхода из системы
      sessionStorage.removeItem('justLoggedOut');
    };

    autoLogin();
  }, [location]);

  const handleLogin = async (e, autoUsername = null, autoPassword = null) => {
    if (e) e.preventDefault();
    setError('');

    const loginUsername = autoUsername || username;
    const loginPassword = autoPassword || password;

    try {
      const adminUsername = 'admin';
      const adminPassword = '2206';

      if (loginUsername === adminUsername && loginPassword === adminPassword) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', 'true');
        if (rememberMe) {
          localStorage.setItem('rememberedUser', JSON.stringify({ username: loginUsername, password: loginPassword }));
        } else {
          localStorage.removeItem('rememberedUser');
        }
        setError('');
        navigate('/', { replace: true });
        return;
      }

      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const student = students.find(s => s.username === loginUsername && s.password === loginPassword);

      if (student) {
        setAuthenticatedStudent(student);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', 'false');
        if (rememberMe) {
          localStorage.setItem('rememberedUser', JSON.stringify({ username: loginUsername, password: loginPassword }));
        } else {
          localStorage.removeItem('rememberedUser');
        }
        setError('');

        // Сохраняем данные о входе студента в Firestore
        const studentDocRef = doc(db, 'students', student.id);
        await setDoc(studentDocRef, { lastLogin: new Date() }, { merge: true });

        navigate(`/dashboard/${student.id}`, { replace: true });
      } else {
        setError('Неверное имя пользователя или пароль');
      }
    } catch (error) {
      setError('Ошибка входа в систему');
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-700">
      <div className="flex-1 max-w-md px-4 py-8 sm:px-6 lg:px-8">
        <Card className="w-full bg-black bg-opacity-50 backdrop-blur-md border border-gray-600">
          <CardHeader className="space-y-1 flex justify-center flex-col items-center">
            <div className="flex items-center space-x-4">
              <img src="./../../logo.jpg" className="logo w-12 h-12 object-contain" alt="Logo" />
              <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">Вход</CardTitle>
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
                    className="pl-10 w-full text-white bg-gray-800 placeholder-gray-500 border-gray-600 focus:border-white focus:ring-white"
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
                    className="pl-10 w-full text-white bg-gray-800 placeholder-gray-500 border-gray-600 focus:border-white focus:ring-white"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center">
  <input
    type="checkbox"
    id="rememberMe"
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
  />
  <label 
    htmlFor="rememberMe" 
    className="text-sm cursor-pointer"
    style={{
      color: 'white !important',
      fontWeight: 'bold',
      display: 'inline-block !important',
      opacity: '1 !important',
      position: 'static !important',
      visibility: 'visible !important'
    }}
  >
    Запомнить меня
  </label>
</div>
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors duration-300"
                >
                  Войти
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;