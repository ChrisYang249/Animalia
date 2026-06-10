import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Tag,
  message,
  Popconfirm,
  Modal,
  DatePicker,
  TimePicker,
  Select,
  Tooltip,
} from 'antd';
import { DeleteOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { api, catImageUrl } from '../config/api';
import './VisitRequests.css';

dayjs.extend(customParseFormat);

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
  calendar_event_id?: string | null;
  created_at: string;
}

const STATUS_CYCLE = ['submitted', 'reviewed', 'contacted'] as const;

const TIME_FORMATS = ['h:mm A', 'h:mmA', 'h A', 'hA', 'HH:mm', 'H:mm'];

const parseVisitTime = (text: string): Dayjs | null => {
  const cleaned = text.trim().toUpperCase();
  for (const format of TIME_FORMATS) {
    const parsed = dayjs(cleaned, format, false);
    if (parsed.isValid()) return parsed;
  }
  return null;
};

const statusTag = (status: string) => {
  if (status === 'contacted') return <Tag color="green">Contacted</Tag>;
  if (status === 'reviewed') return <Tag color="blue">Reviewed</Tag>;
  return <Tag color="orange">Submitted</Tag>;
};

const emptyDisplay = (value?: string | null) => value || '—';

const VisitRequests = () => {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingRequest, setBookingRequest] = useState<VisitRequest | null>(null);
  const [bookingDate, setBookingDate] = useState<Dayjs | null>(null);
  const [bookingTime, setBookingTime] = useState<Dayjs | null>(null);
  const [bookingDuration, setBookingDuration] = useState(60);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

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

  const openBookingModal = (request: VisitRequest) => {
    setBookingRequest(request);
    setBookingDate(dayjs(request.visit_date));
    setBookingTime(parseVisitTime(request.visit_time));
    setBookingDuration(60);
  };

  const handleBook = async () => {
    if (!bookingRequest || !bookingDate || !bookingTime) {
      message.warning('Please pick a date and time');
      return;
    }

    const start = bookingDate
      .hour(bookingTime.hour())
      .minute(bookingTime.minute())
      .second(0);

    setBookingSubmitting(true);
    try {
      const response = await api.post<VisitRequest>(
        `/applications/${bookingRequest.id}/book`,
        {
          start_time: start.format('YYYY-MM-DDTHH:mm:ss'),
          duration_minutes: bookingDuration,
        }
      );
      setRequests((prev) =>
        prev.map((r) => (r.id === bookingRequest.id ? response.data : r))
      );
      message.success('Visit booked — calendar invite sent');
      setBookingRequest(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || 'Failed to book the visit');
    } finally {
      setBookingSubmitting(false);
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
      title: 'Booking',
      key: 'booking',
      align: 'center' as const,
      render: (_: unknown, record: VisitRequest) =>
        record.calendar_event_id ? (
          <Tag icon={<CheckCircleOutlined />} color="green">
            Booked
          </Tag>
        ) : (
          <Tooltip title="Book this visit on Google Calendar">
            <Button
              icon={<CalendarOutlined />}
              size="small"
              onClick={() => openBookingModal(record)}
            >
              Book
            </Button>
          </Tooltip>
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
        Adoption visit requests from the public apply form. Click a status tag to update it,
        or Book to add the visit to the staff Google Calendar.
      </p>
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={`Book visit — ${bookingRequest?.applicant_name ?? ''}`}
        open={bookingRequest !== null}
        onCancel={() => setBookingRequest(null)}
        onOk={handleBook}
        okText="Book & send invite"
        confirmLoading={bookingSubmitting}
      >
        <p style={{ color: '#666' }}>
          Requested: {bookingRequest ? dayjs(bookingRequest.visit_date).format('MMM D, YYYY') : ''}{' '}
          at {bookingRequest?.visit_time}
          {bookingRequest?.email
            ? ` — invite will be emailed to ${bookingRequest.email}`
            : ' — no applicant email, event is calendar-only'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DatePicker
            value={bookingDate}
            onChange={setBookingDate}
            style={{ width: '100%' }}
            placeholder="Visit date"
          />
          <TimePicker
            value={bookingTime}
            onChange={setBookingTime}
            format="h:mm A"
            minuteStep={15}
            use12Hours
            style={{ width: '100%' }}
            placeholder="Start time"
          />
          <Select
            value={bookingDuration}
            onChange={setBookingDuration}
            options={[
              { value: 30, label: '30 minutes' },
              { value: 45, label: '45 minutes' },
              { value: 60, label: '1 hour' },
              { value: 90, label: '1.5 hours' },
              { value: 120, label: '2 hours' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default VisitRequests;
