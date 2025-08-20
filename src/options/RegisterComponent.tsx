import React, { useState, useEffect } from 'react';

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

interface User {
  id: string; // UUID格式，所以是string类型
  username: string;
}

interface RegisterResponse {
  id: string;
  username: string;
}

interface LoginResponse {
  message: string;
  user: User;
}

interface ErrorResponse {
  detail?: string;
}

const RegisterComponent: React.FC<{ onRegisterSuccess?: () => void }> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查密码是否匹配
    if (formData.password !== formData.confirmPassword) {
      setError('密码和确认密码不匹配');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          confirm_password: formData.confirmPassword // 注意：后端使用的是下划线格式
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.detail || '注册失败');
      }

      console.log('注册成功:', data);
      
      // 注册成功后自动登录
      try {
        const loginResponse = await fetch('http://localhost:8000/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          }),
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          const errorData = loginData as ErrorResponse;
          throw new Error(errorData.detail || '自动登录失败');
        }

        const loginResult = loginData as LoginResponse;

        // 存储用户信息到localStorage
        localStorage.setItem('user', JSON.stringify(loginResult.user));
        localStorage.setItem('username', loginResult.user.username);
        
        console.log('自动登录成功:', loginResult);
        
        // 存储用户信息到localStorage
        localStorage.setItem('user', JSON.stringify(loginResult.user));
        localStorage.setItem('username', loginResult.user.username);
        
        // 设置用户信息状态
        setUser(loginResult.user);
        
        // 调用注册成功回调
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
        
        // 跳转到首页或其他页面
        window.location.href = '/'; // 可以根据实际路由修改这个跳转地址
      } catch (loginError: any) {
        throw new Error(`注册成功但登录失败: ${loginError.message}`);
      }
    } catch (err: any) {
      console.error('注册错误详情:', err);
      setError(err.message || '注册过程中发生错误');
      console.error('注册错误:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      {user && (
        <div className="sm:mx-auto sm:w-full sm:max-w-sm mb-6">
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">
              欢迎，{user.username}！您的账户已成功创建。
            </div>
          </div>
        </div>
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          创建新账户
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {error}
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
              用户名
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
              密码
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
              确认密码
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterComponent;