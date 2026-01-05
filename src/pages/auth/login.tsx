import { App, Button, Form, Input, Typography } from "antd";
import type { FormProps } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

import { useCurrentApp } from "@/context/use.curent";
import { LoginAPI } from "@/services/api";

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
        navigate(`/${res.data.user.role?.name?.toLowerCase()}`);
        return;
      }

      notification.error({
        message: "Có lỗi xảy ra",
        description:
          res?.message && Array.isArray(res.message) ? res.message[0] : res?.message,
        duration: 5,
      });
    } catch (err: unknown) {
      notification.error({
        message: "Đăng nhập thất bại",
        description: err?.message ?? "Vui lòng thử lại.",
        duration: 5,
      });
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-grid" />

      <main className="login-shell" aria-label="Trang đăng nhập">
        <section className="login-card">
          <header className="login-head">
            <Typography.Title level={2} className="login-title">
              Welcome back School AG
            </Typography.Title>
            <Typography.Paragraph className="login-subtitle">
              Vui lòng nhập thông tin để tiếp tục.
            </Typography.Paragraph>
          </header>

          <Form<LoginValues>
            name="login-form"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark
          >
            <Form.Item
              label="Email"
              name="username"
              rules={[
                { required: true, message: "Email không được để trống!" },
                { type: "email", message: "Email không đúng định dạng!" },
              ]}

            >
              <Input placeholder="admin@schoolag.com"
                style={{
                  height: '42px',
                  backgroundColor: "rgba(0, 0, 0, .25)!important",
                }} />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Mật khẩu không được để trống!" }]}
            >
              <Input.Password
                style={{
                  height: '42px',
                  backgroundColor: "rgba(0, 0, 0, .25)!important",
                }}
                placeholder="Vui lòng nhập mật khẩu"
              />

            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmit}
              className="login-btn"
              block
            >
              Đăng nhập
            </Button>
          </Form>

          <p className="login-footnote">
            © {new Date().getFullYear()} SchoolAG • Secure Admin Access
          </p>
        </section>
      </main>
    </div>
  );
}
