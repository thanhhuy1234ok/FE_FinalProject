import { Form, Input, Button, App, type FormProps } from 'antd';
import '@/styles/login.scss';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LoginAPI } from '@/services/api';
import { useCurrentApp } from '@/context/use.curent';

type LoginValues = {
  username: string; // email
  password: string;
};
export default function LoginPage() {
  const navigate = useNavigate();
  const { message, notification } = App.useApp();
  const { setIsAuthenticated, setUser } = useCurrentApp();

  const [isSubmit, setIsSubmit] = useState(false);

  const onFinish: FormProps<LoginValues>["onFinish"] = async (values) => {
    try {
      setIsSubmit(true);
      const res = await LoginAPI(values.username, values.password);

      if (res?.data) {
        setIsAuthenticated(true);
        setUser(res.data.user);

        localStorage.setItem("access_token", res.data.access_token);

        message.success("Đăng nhập tài khoản thành công!");
        navigate(`/`);
        return;
      }

      notification.error({
        message: "Có lỗi xảy ra",
        description:
          res?.message && Array.isArray(res.message) ? res.message[0] : res?.message,
        duration: 5,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Vui lòng thử lại.";

      notification.error({
        message: "Đăng nhập thất bại",
        description: errorMessage,
        duration: 5,
      });
    } finally {
      setIsSubmit(false);
    }
  };

  const setChangePassword = (open: boolean) => {
    console.log(open)
    navigate('/auth/forgot-password');
  }
  return (
    <div className="login-container">
      <div className="right-section">
        <div className="login-form">
          <h2>Đăng nhập</h2>

          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              label="Tài khoản"
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
            >
              <Input placeholder="Nhập tài khoản" size="large" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" size="large" />
            </Form.Item>

            <div className="forgot-password">
              <Button type="link" onClick={() => setChangePassword(true)}>
                Quên mật khẩu ?
              </Button>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="login-btn"
                loading={isSubmit}
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>

          <p className="support-text">
            Vui lòng liên hệ{' '}
            <a href="mailto:itsupport@congnghe.edu.com">
              itsupport@congnghe.edu.com
            </a>{' '}
            nếu cần hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
}


