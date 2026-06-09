import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
  Popconfirm,
  Tag,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../config/api';
import dayjs from 'dayjs';

const { Option } = Select;

const QUANTITY_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);
const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Received', label: 'Received' },
];

interface Order {
  id: number;
  name: string;
  quantity: number;
  order_date: string;
  status: string;
  created_at: string;
}

const statusTag = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === 'received') {
    return <Tag color="green">Received</Tag>;
  }
  if (normalized === 'pending') {
    return <Tag color="orange">Pending</Tag>;
  }
  return <Tag>{status || '—'}</Tag>;
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/');
      setOrders(response.data);
    } catch {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openCreate = () => {
    setEditingOrder(null);
    form.resetFields();
    form.setFieldsValue({
      order_date: dayjs(),
      quantity: 1,
      status: 'Pending',
    });
    setModalVisible(true);
  };

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    form.setFieldsValue({
      name: order.name,
      quantity: order.quantity,
      order_date: dayjs(order.order_date),
      status: order.status === 'Received' ? 'Received' : 'Pending',
    });
    setModalVisible(true);
  };

  const handleStatusToggle = async (order: Order) => {
    const nextStatus = order.status === 'Received' ? 'Pending' : 'Received';
    try {
      await api.put(`/products/${order.id}`, { status: nextStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
      );
      message.success(`Status updated to ${nextStatus}`);
    } catch {
      message.error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Order deleted');
      fetchOrders();
    } catch {
      message.error('Failed to delete order');
    }
  };

  const handleSubmit = async (values: {
    name: string;
    quantity: number;
    order_date: dayjs.Dayjs;
    status: string;
  }) => {
    try {
      const payload = {
        name: values.name.trim(),
        quantity: values.quantity,
        order_date: values.order_date.toISOString(),
        status: values.status,
      };

      if (editingOrder) {
        await api.put(`/products/${editingOrder.id}`, payload);
        message.success('Order updated');
      } else {
        await api.post('/products/', payload);
        message.success('Order created');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingOrder(null);
      fetchOrders();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || 'Failed to save order');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Order) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 600, height: 'auto' }}
          onClick={() => openEdit(record)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Order) => (
        <button
          type="button"
          onClick={() => handleStatusToggle(record)}
          title="Click to change status"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          {statusTag(status)}
        </button>
      ),
    },
    {
      title: '',
      key: 'delete',
      width: 48,
      align: 'center' as const,
      render: (_: unknown, record: Order) => (
        <Popconfirm
          title="Delete this order?"
          description={record.name}
          onConfirm={() => handleDelete(record.id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            aria-label={`Delete ${record.name}`}
          />
        </Popconfirm>
      ),
    },
  ];

  const orderFormFields = (
    <>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please enter a name' }]}
      >
        <Input placeholder="Order name" />
      </Form.Item>

      <Form.Item
        name="order_date"
        label="Date"
        rules={[{ required: true, message: 'Please select a date' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="quantity"
        label="Quantity"
        rules={[{ required: true, message: 'Please select a quantity' }]}
      >
        <Select placeholder="Select quantity">
          {QUANTITY_OPTIONS.map((n) => (
            <Option key={n} value={n}>
              {n}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Please select a status' }]}
      >
        <Select placeholder="Select status">
          {STATUS_OPTIONS.map((s) => (
            <Option key={s.value} value={s.value}>
              {s.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Orders</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          New Order
        </Button>
      </div>

      <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} />

      <Modal
        title={editingOrder ? 'Edit Order' : 'New Order'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingOrder(null);
        }}
        footer={null}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {orderFormFields}
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingOrder ? 'Save' : 'Create'}
                </Button>
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingOrder(null);
                  }}
                >
                  Cancel
                </Button>
              </Space>
              {editingOrder && (
                <Popconfirm
                  title="Delete this order?"
                  onConfirm={() => {
                    handleDelete(editingOrder.id);
                    setModalVisible(false);
                    setEditingOrder(null);
                  }}
                  okText="Delete"
                  cancelText="Cancel"
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;
