import { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api, catImageUrl } from '../config/api';
import './VisitRequests.css';

interface LikedCat {
  id: number;
  name: string;
  image: string;
}

interface VisitRequest {
  id: number;
  applicant_name: string;
  email?: string | null;
  phone?: string | null;
  visit_date: string;
  visit_time: string;
  liked_cats: LikedCat[];
  status: string;
  created_at: string;
}

const STATUS_CYCLE = ['submitted', 'reviewed', 'contacted'] as const;

const statusTag = (status: string) => {
  if (status === 'contacted') return <Tag color="green">Contacted</Tag>;
  if (status === 'reviewed') return <Tag color="blue">Reviewed</Tag>;
  return <Tag color="orange">Submitted</Tag>;
};

const emptyDisplay = (value?: string | null) => value || '—';

const VisitRequests = () => {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get<VisitRequest[]>('/applications/');
      setRequests(response.data);
    } catch {
      message.error('Failed to load visit requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusCycle = async (request: VisitRequest) => {
    const currentIndex = STATUS_CYCLE.indexOf(request.status as (typeof STATUS_CYCLE)[number]);
    const nextStatus =
      STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length] ?? 'submitted';

    try {
      await api.patch(`/applications/${request.id}`, { status: nextStatus });
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: nextStatus } : r))
      );
      message.success(`Status updated to ${nextStatus}`);
    } catch {
      message.error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/applications/${id}`);
      message.success('Visit request deleted');
      fetchRequests();
    } catch {
      message.error('Failed to delete visit request');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'applicant_name',
      key: 'applicant_name',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
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
    {
      title: 'Visit',
      key: 'visit',
      render: (_: unknown, record: VisitRequest) => (
        <span>
          {dayjs(record.visit_date).format('MMM D, YYYY')}
          <br />
          <span style={{ color: '#888' }}>{record.visit_time}</span>
        </span>
      ),
    },
    {
      title: 'Liked cats',
      key: 'liked_cats',
      render: (_: unknown, record: VisitRequest) =>
        record.liked_cats.length === 0 ? (
          '—'
        ) : (
          <div className="visit-requests__cats">
            {record.liked_cats.map((cat) => (
              <img
                key={cat.id}
                src={catImageUrl(cat.image)}
                alt={cat.name || 'Cat'}
                title={cat.name || undefined}
                className="visit-requests__cat-thumb"
              />
            ))}
          </div>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: VisitRequest) => (
        <button
          type="button"
          onClick={() => handleStatusCycle(record)}
          title="Click to change status"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          {statusTag(status)}
        </button>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: '',
      key: 'delete',
      width: 48,
      align: 'center' as const,
      render: (_: unknown, record: VisitRequest) => (
        <Popconfirm
          title="Delete this visit request?"
          description={record.applicant_name}
          onConfirm={() => handleDelete(record.id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            aria-label={`Delete request from ${record.applicant_name}`}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Visit Requests</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Adoption visit requests from the public apply form. Click a status tag to update it.
      </p>
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
      />
    </div>
  );
};

export default VisitRequests;
