import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GlobalStateContext } from '../context/GlobalStateContext';
import 'tailwindcss/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/custom.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthenticatedStudent } = useContext(GlobalStateContext);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isLoginRoute = location.pathname === '/login';
  const isHiddenNavbarRoute = isDashboardRoute || isLoginRoute;

  const handleLogout = () => {
    // Очищаем все связанные с аутентификацией элементы из localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('rememberedUser');

    // Устанавливаем флаг в sessionStorage, указывающий, что пользователь только что вышел из системы
    sessionStorage.setItem('justLoggedOut', 'true');

    // Очищаем состояние аутентификации в приложении
    setAuthenticatedStudent(null);

    // Переходим на страницу входа
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return (
    <nav className="bg-gray-800 p-4 fixed w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-gray-300 text-2xl font-bold">
          <img src="/logo.jpg" alt="Logo" className="h-16 w-auto rounded" />
        </div>
        <div className="flex items-center">
          {isAuthenticated && !isLoginRoute && (
            <button onClick={handleLogout} className="text-white font-bold p-2 bg-red-600 border border-red-700 rounded hover:bg-red-700 transition duration-300 mr-4">
              Выход
            </button>
          )}
          {!isHiddenNavbarRoute && (
            <div className="lg:hidden" onClick={toggleMenu}>
              <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-white text-2xl`}></i>
            </div>
          )}
        </div>
        <ul className={`lg:flex lg:items-center lg:space-x-4 ${isOpen ? 'block' : 'hidden'} lg:block absolute lg:relative top-full left-0 right-0 bg-gray-800 lg:bg-transparent mt-2 lg:mt-0`}>
          {isAuthenticated && !isHiddenNavbarRoute && (
            <>
              <li className="nav-item">
                <Link to="/" className="text-white font-bold p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition duration-300 block lg:inline-block" onClick={toggleMenu}>
                  Главная
                </Link>
              </li>
              {isAdmin && (
                <>
                  <li className="nav-item">
                    <Link to="/monthly-report" className="text-white font-bold p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition duration-300 block lg:inline-block" onClick={toggleMenu}>
                      Месячный отчет
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/students" className="text-white font-bold p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition duration-300 block lg:inline-block" onClick={toggleMenu}>
                      Управление студентами
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/invoice-generator" className="text-white font-bold p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition duration-300 block lg:inline-block" onClick={toggleMenu}>
                      Счет
                    </Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <Link to="/library" className="text-white font-bold p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition duration-300 block lg:inline-block" onClick={toggleMenu}>
                  Библиотека
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;