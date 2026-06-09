import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Button,
  Modal,
  Form,
  Upload,
  Typography,
  message,
  Popconfirm,
  Tag,
  Empty,
} from 'antd';
import {
  TeamOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { api, catImageUrl } from '../config/api';
import type { Cat } from '../data/cats';
import './Dashboard.css';

interface DashboardStats {
  total_clients: number;
  total_orders: number;
  pending_orders: number;
  completed_this_month: number;
  pending_visit_requests: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    total_clients: 0,
    total_orders: 0,
    pending_orders: 0,
    completed_this_month: 0,
    pending_visit_requests: 0,
  });
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  const fetchCats = useCallback(async () => {
    setCatsLoading(true);
    try {
      const response = await api.get<Cat[]>('/cats/all');
      setCats(response.data);
    } catch {
      message.error('Failed to load cats');
    } finally {
      setCatsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch {
        message.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    fetchCats();
  }, [fetchCats]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/cats/${id}`);
      message.success('Cat removed');
      fetchCats();
    } catch {
      message.error('Failed to remove cat');
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      message.error('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj);

    setUploading(true);
    try {
      await api.post('/cats/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Cat added');
      setUploadOpen(false);
      form.resetFields();
      setFileList([]);
      fetchCats();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || 'Failed to add cat');
    } finally {
      setUploading(false);
    }
  };

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
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Clients"
              value={stats.total_clients}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#e8612a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.total_orders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#e8612a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={stats.pending_orders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed This Month"
              value={stats.completed_this_month}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/visit-requests')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="New Visit Requests"
              value={stats.pending_visit_requests}
              prefix={<CalendarOutlined />}
              valueStyle={{
                color: stats.pending_visit_requests > 0 ? '#faad14' : '#e8612a',
              }}
            />
          </Card>
        </Col>
      </Row>

      <div className="dashboard-cats__header">
        <h2 className="dashboard-cats__title">Cat profiles</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadOpen(true)}>
          Add cat
        </Button>
      </div>

      {catsLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : cats.length === 0 ? (
        <Empty description="No cats yet — add your first profile" />
      ) : (
        <Row gutter={[16, 16]}>
          {cats.map((cat) => (
            <Col key={cat.id} xs={12} sm={8} md={6} lg={4}>
              <Card
                className="dashboard-cats__card"
                cover={
                  <img
                    src={catImageUrl(cat.image)}
                    alt="Cat profile"
                    className="dashboard-cats__image"
                  />
                }
                actions={[
                  <Popconfirm
                    key="delete"
                    title="Remove this cat?"
                    description="This profile will be permanently removed."
                    onConfirm={() => handleDelete(cat.id)}
                    okText="Remove"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} aria-label="Remove cat" />
                  </Popconfirm>,
                ]}
              >
                <Tag color={cat.status === 'available' ? 'green' : 'default'}>
                  {cat.status}
                </Tag>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Add cat profile"
        open={uploadOpen}
        onCancel={() => {
          setUploadOpen(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={420}
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Upload a photo with the cat&apos;s name stamped on the image (upper-right corner, as shown
          on existing profiles). Names are not entered separately.
        </Typography.Paragraph>

        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item label="Photo" required>
            <Upload
              listType="picture"
              maxCount={1}
              accept="image/jpeg,image/png,image/webp"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: list }) => setFileList(list)}
            >
              <Button icon={<UploadOutlined />}>Choose image</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={uploading} block>
            Upload
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;
