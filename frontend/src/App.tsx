import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Home from './pages/Home';
import Apply from './pages/Apply';
import ApplyConfirmation from './pages/ApplyConfirmation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Clients from './pages/Clients';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#e8612a',
        },
        components: {
          Menu: {
            itemSelectedBg: '#fdeee6',
            itemSelectedColor: '#e8612a',
            itemHoverColor: '#e8612a',
          },
        },
      }}
    >
      <AntdApp>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/apply/confirmation" element={<ApplyConfirmation />} />
            <Route path="/staff/login" element={<Login />} />
            <Route path="/login" element={<Navigate to="/staff/login" replace />} />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="orders" element={<Orders />} />
              <Route path="storage" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
