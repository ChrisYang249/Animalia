import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  message,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Card,
  Statistic,
  Badge,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  BoxPlotOutlined,
} from '@ant-design/icons';
import { api } from '../config/api';

interface StorageLocation {
  id: number;
  freezer: string;
  shelf: string;
  box: string;
  position?: string;
  is_available: boolean;
  notes?: string;
  created_at: string;
}

const Storage = () => {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StorageLocation | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total_locations: 0,
    available_locations: 0,
    freezer_count: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [locationsRes, statsRes] = await Promise.all([
        api.get('/storage/locations'),
        api.get('/storage/statistics'),
      ]);
      setLocations(locationsRes.data);
      setStats(statsRes.data);
    } catch {
      message.error('Failed to fetch storage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: StorageLocation) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const payload = {
        ...values,
        freezer: Array.isArray(values.freezer) ? values.freezer[0] : values.freezer,
      };
      if (editing) {
        await api.put(`/storage/locations/${editing.id}`, payload);
        message.success('Location updated');
      } else {
        await api.post('/storage/locations', payload);
        message.success('Location created');
      }
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || 'Failed to save location');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/storage/locations/${id}`);
      message.success('Location deleted');
      fetchData();
    } catch {
      message.error('Failed to delete location');
    }
  };

  const freezerOptions = [...new Set(locations.map((l) => l.freezer))];

  const columns = [
    {
      title: 'Freezer',
      dataIndex: 'freezer',
      key: 'freezer',
      render: (text: string) => <strong>{text}</strong>,
    },
    { title: 'Shelf', dataIndex: 'shelf', key: 'shelf' },
    {
      title: 'Box',
      dataIndex: 'box',
      key: 'box',
      render: (text: string) => (
        <Space>
          <InboxOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (text: string) => text || '—',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: StorageLocation) => (
        <Badge
          status={record.is_available ? 'success' : 'error'}
          text={record.is_available ? 'Available' : 'Full'}
        />
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (text: string) => text || '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: StorageLocation) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Storage</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add Location
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total Locations" value={stats.total_locations} prefix={<InboxOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Available"
              value={stats.available_locations}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Freezers" value={stats.freezer_count} prefix={<BoxPlotOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={locations}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 20, showTotal: (total) => `${total} locations` }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Location' : 'Add Location'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="freezer"
                label="Freezer"
                rules={[{ required: true, message: 'Required' }]}
              >
                {editing ? (
                  <Input />
                ) : (
                  <Select placeholder="Select or type" showSearch mode="tags" maxTagCount={1}>
                    {freezerOptions.map((f) => (
                      <Select.Option key={f} value={f}>
                        {f}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shelf" label="Shelf" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Shelf-A" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="box" label="Box" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Box-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="Position">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>
          {editing && (
            <Form.Item name="is_available" label="Status">
              <Select>
                <Select.Option value={true}>Available</Select.Option>
                <Select.Option value={false}>Full</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Optional notes" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            {editing ? 'Update' : 'Create'}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Storage;
