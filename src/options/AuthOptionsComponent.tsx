import React, { useState, useEffect } from 'react';
import LoginComponent from './LoginComponent';
import RegisterComponent from './RegisterComponent';

type View = 'settings' | 'login' | 'register';

interface AuthOptionsComponentProps {
  onBackToSettings: () => void;
}

interface User {
  id: string;
  username: string;
}

const AuthOptionsComponent: React.FC<AuthOptionsComponentProps> = ({ onBackToSettings }) => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [user, setUser] = useState<User | null>(null);

  // 检查用户是否已登录
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    // 登录成功后更新用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // 登录成功后返回设置页面
        onBackToSettings();
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }
  };

  const handleRegisterSuccess = () => {
    // 注册成功后更新用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // 注册成功后返回设置页面
        onBackToSettings();
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }
  };

  const handleLogout = () => {
    // 清除用户信息
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    setUser(null);
    // 切换到登录视图
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentView === 'login' && '用户登录'}
                {currentView === 'register' && '用户注册'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    欢迎, <span className="font-medium">{user.username}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    登出
                  </button>
                  <button 
                    onClick={onBackToSettings}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    返回设置
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setCurrentView('login')}
                    className={`text-sm ${currentView === 'login' ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    登录
                  </button>
                  <button 
                    onClick={() => setCurrentView('register')}
                    className={`text-sm ${currentView === 'register' ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    注册
                  </button>
                  <button 
                    onClick={onBackToSettings}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    返回设置
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'login' && <LoginComponent onLoginSuccess={handleLoginSuccess} />}
        {currentView === 'register' && <RegisterComponent onRegisterSuccess={handleRegisterSuccess} />}
      </main>
    </div>
  );
};

export default AuthOptionsComponent;