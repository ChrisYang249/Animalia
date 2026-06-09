import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AnimaliaLogo from '../components/AnimaliaLogo';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      await login(values.username, values.password);
      message.success('Login successful');
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__logo-wrap">
          <AnimaliaLogo size="md" />
        </div>

        <h2 className="login-page__title">Staff Portal</h2>
        <p className="login-page__subtitle">Animalia Welfare and More</p>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          className="login-page__form"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-page__submit"
              size="large"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>

        <Link to="/" className="login-page__back">
          <ArrowLeftOutlined /> Back to cat browse
        </Link>
      </div>
    </div>
  );
};

export default Login;
