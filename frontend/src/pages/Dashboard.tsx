import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  TeamOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { api } from '../config/api';

interface DashboardStats {
  total_clients: number;
  total_orders: number;
  pending_orders: number;
  completed_this_month: number;
  storage_locations: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_clients: 0,
    total_orders: 0,
    pending_orders: 0,
    completed_this_month: 0,
    storage_locations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Clients"
              value={stats.total_clients}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#e8612a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.total_orders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#e8612a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={stats.pending_orders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Completed This Month"
              value={stats.completed_this_month}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Storage Locations"
              value={stats.storage_locations}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#e8612a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
