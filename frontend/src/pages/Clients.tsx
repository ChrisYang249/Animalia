import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '../config/api';

interface Client {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

const emptyDisplay = (value?: string | null) => value || '—';

const normalizePayload = (values: { name: string; email?: string; phone?: string }) => ({
  name: values.name.trim(),
  email: values.email?.trim() || null,
  phone: values.phone?.trim() || null,
});

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch {
      message.error('Failed to fetch clients');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Client) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 600, height: 'auto' }}
          onClick={() => handleEdit(record)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => emptyDisplay(text),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => emptyDisplay(text),
    },
  ];

  const handleSubmit = async (values: { name: string; email?: string; phone?: string }) => {
    try {
      await api.post('/clients/', normalizePayload(values));
      message.success('Client created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchClients();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || 'Failed to create client');
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    editForm.setFieldsValue({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values: { name: string; email?: string; phone?: string }) => {
    if (!selectedClient) return;

    try {
      await api.put(`/clients/${selectedClient.id}`, normalizePayload(values));
      message.success('Client updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedClient(null);
      fetchClients();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || 'Failed to update client');
    }
  };

  const clientFormFields = (
    <>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please enter a name' }]}
      >
        <Input placeholder="Client name" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[{ type: 'email', message: 'Please enter a valid email' }]}
      >
        <Input placeholder="Optional" />
      </Form.Item>

      <Form.Item name="phone" label="Phone">
        <Input placeholder="Optional" />
      </Form.Item>
    </>
  );

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Clients</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          New Client
        </Button>
      </div>

      <Table columns={columns} dataSource={clients} loading={loading} rowKey="id" />

      <Modal
        title="New Client"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {clientFormFields}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Client"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setSelectedClient(null);
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          {clientFormFields}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Clients;
