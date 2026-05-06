/**
 * 根组件 — 路由表
 * /login      → 登录页
 * /register   → 注册页
 * /album/:id  → 相册详情
 * /           → 首页（相册列表）
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AlbumDetail from './pages/AlbumDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/album/:id" element={<ProtectedRoute><AlbumDetail /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
