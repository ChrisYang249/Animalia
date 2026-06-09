import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, DatePicker, Select, message } from 'antd';
import { ArrowLeftOutlined, FormOutlined, ExportOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AnimaliaLogo from '../components/AnimaliaLogo';
import { useLikedCatsStore } from '../store/likedCatsStore';
import { useCats } from '../hooks/useCats';
import { api, catImageUrl } from '../config/api';
import './Apply.css';

const { Option } = Select;

const VISIT_TIME_SLOTS = ['10:00 AM', '2:00 PM', '4:00 PM'];
const ADOPTION_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSefypuHv6wYfE5jnlykYe91uJGYEaDhDE7cWPvJz8p-Col78A/viewform';

const Apply = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { likedIds } = useLikedCatsStore();
  const { cats } = useCats();

  const likedCats = useMemo(
    () => cats.filter((cat) => likedIds.includes(cat.id)),
    [cats, likedIds]
  );

  const handleSubmit = async (values: {
    applicant_name: string;
    email?: string;
    phone?: string;
    visit_date: dayjs.Dayjs;
    visit_time: string;
  }) => {
    try {
      await api.post('/applications/', {
        applicant_name: values.applicant_name.trim(),
        email: values.email?.trim() || null,
        phone: values.phone?.trim() || null,
        visit_date: values.visit_date.startOf('day').toISOString(),
        visit_time: values.visit_time,
        liked_cat_ids: likedIds.length > 0 ? likedIds : null,
      });
      navigate('/apply/confirmation');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || 'Failed to submit your request');
    }
  };

  return (
    <div className="apply">
      <div className="apply__card">
        <button type="button" className="apply__back" onClick={() => navigate('/')}>
          <ArrowLeftOutlined /> Back to cats
        </button>

        <div className="apply__header">
          <AnimaliaLogo size="md" />
          <h1 className="apply__title">Schedule your visit</h1>
          <p className="apply__subtitle">
            Tell us a bit about yourself and when you&apos;d like to drop by Animalia.
          </p>
        </div>

        {likedCats.length > 0 && (
          <div className="apply__liked">
            <p className="apply__liked-label">Cats you liked</p>
            <div className="apply__liked-list">
              {likedCats.map((cat) => (
                <div key={cat.id} className="apply__liked-item">
                  <img src={catImageUrl(cat.image)} alt={cat.name} />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ visit_date: dayjs().add(1, 'day') }}
          className="apply__form"
        >
          <Form.Item
            name="applicant_name"
            label="Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input placeholder="Your full name" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="you@example.com" size="large" />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input placeholder="Optional" size="large" />
          </Form.Item>

          <Form.Item
            name="visit_date"
            label="Visit date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="visit_time"
            label="Visit time"
            rules={[{ required: true, message: 'Please select a time' }]}
          >
            <Select placeholder="Select a time slot" size="large">
              {VISIT_TIME_SLOTS.map((slot) => (
                <Option key={slot} value={slot}>
                  {slot}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="apply__adoption-form">
            <p className="apply__adoption-form-label">
              Adoption application <span className="apply__optional">(optional)</span>
            </p>
            <p className="apply__adoption-form-hint">
              Already sure you want to adopt? You can complete our full application now — or skip
              this if you&apos;re only scheduling a visit to meet the cats first.
            </p>
            <a
              href={ADOPTION_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="apply__adoption-form-link"
            >
              <FormOutlined />
              Open adoption form
              <ExportOutlined className="apply__adoption-form-external" />
            </a>
          </div>

          <Button type="primary" htmlType="submit" size="large" className="apply__submit" block>
            Submit visit request
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Apply;
