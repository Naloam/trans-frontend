import React, { useState } from 'react';

interface LoginFormData {
  username: string;
  password: string;
}

interface User {
  id: string; // UUID格式，所以是string类型
  username: string;
}

interface LoginResponse {
  message: string;
  user: User;
}

interface ErrorResponse {
  detail?: string;
}

const LoginComponent: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      console.log('响应状态:', response.status, response.statusText);
      console.log('响应头:', Object.fromEntries(response.headers.entries()));

      // 检查响应内容类型
      const contentType = response.headers.get('Content-Type');
      console.log('Content-Type:', contentType);

      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // 如果不是JSON，读取文本内容
        const textData = await response.text();
        console.log('非JSON响应内容:', textData);
        throw new Error(`服务器返回非JSON响应: ${textData.substring(0, 100)}...`);
      }

      console.log('响应数据:', data);

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.detail || '登录失败');
      }

      const loginData = data as LoginResponse;

      // 存储用户信息到localStorage
      localStorage.setItem('user', JSON.stringify(loginData.user));
      localStorage.setItem('username', loginData.user.username);
      
      console.log('登录成功:', loginData);
      
      // 调用登录成功回调
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error('登录错误详情:', err);
      setError(err.message || '登录过程中发生错误');
      console.error('登录错误:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          登录到您的账户
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                密码
              </label>
            </div>
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
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;