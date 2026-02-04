import { Layout, Space, Badge, Avatar } from "antd";
import { BellOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useBreadcrumb } from "../../hooks/useBreadcrumb";
import { useCurrentApp } from "@/context/use.curent";
const { Header } = Layout;

const AppHeader = () => {
  const { breadcrumb, title } = useBreadcrumb();
  const { user } = useCurrentApp();
  return (
    <Header
      style={{
        background: "#fff",
        padding: "px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Left */}
      <div>
        <div style={{ fontSize: 12, color: "#8c8c8c" }}>
          {breadcrumb.join(" / ")}
        </div>
      </div>

      {/* Right */}
      <Space size="middle">
        <Badge count={4}>
          <BellOutlined style={{ fontSize: 18 }} />
        </Badge>

        <SettingOutlined style={{ fontSize: 18 }} />

        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span style={{ fontSize: "15px", fontWeight: "700" }}>
            {user?.email}
          </span>
        </Space>
      </Space>
    </Header>
  );
};

export default AppHeader;
