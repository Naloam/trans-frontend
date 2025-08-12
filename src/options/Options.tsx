/**
 * Options Page Entry Point
 * React 应用入口文件
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import OptionsComponent from './OptionsComponent';
import '../styles/tailwind.css'; // Tailwind CSS 样式

// 创建 React 根节点并渲染应用
const container = document.getElementById('options-root');
if (container) {
  const root = createRoot(container);
  root.render(<OptionsComponent />);
} else {
  console.error('Options root element not found');
}