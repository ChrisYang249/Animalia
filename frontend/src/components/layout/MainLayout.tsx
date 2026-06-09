import { Layout, Menu, Avatar, Dropdown, Space, Button, Badge, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  ShoppingOutlined,
  HomeOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import AnimaliaLogo from '../AnimaliaLogo';
import { useState, useEffect } from 'react';
import { api } from '../../config/api';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingVisits, setPendingVisits] = useState(0);
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setPendingVisits(response.data.pending_visit_requests ?? 0);
      } catch {
        setPendingVisits(0);
      }
    };
    fetchPending();
  }, [location.pathname]);

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    {
      key: '/visit-requests',
      icon: <CalendarOutlined />,
      label: (
        <span>
          Visit Requests{' '}
          {pendingVisits > 0 && <Badge count={pendingVisits} size="small" />}
        </span>
      ),
    },
    { key: '/clients', icon: <TeamOutlined />, label: 'Clients' },
    { key: '/orders', icon: <ShoppingOutlined />, label: 'Orders' },
    { key: '/', icon: <HomeOutlined />, label: 'Return to Cat Browse' },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        navigate('/staff/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth={72}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          borderRight: '1px solid #f0ebe6',
          background: '#fff',
        }}
      >
        <div
          style={{
            height: 64,
            margin: collapsed ? '12px 8px' : '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10,
          }}
        >
          <AnimaliaLogo size={collapsed ? 'xs' : 'sm'} />
          {!collapsed && (
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: '#1a1a1a',
                lineHeight: 1.2,
              }}
            >
              Animalia
            </span>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            borderBottom: '1px solid #f0ebe6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 48, height: 48, marginRight: 8 }}
            />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: token.colorPrimary }}>
              Animalia Staff Portal
            </h2>
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />} />
              <span>{user?.full_name}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 12,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
