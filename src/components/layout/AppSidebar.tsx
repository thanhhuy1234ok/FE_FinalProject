import { Layout, Menu, Image } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { MENU_ITEMS } from "../../configs/menu.config";
import { useCurrentApp } from "@/context/use.curent";

const { Sider } = Layout;

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useCurrentApp();

  const menuItems = MENU_ITEMS.filter((item) => item.roles.includes(role!));
  return (
    <Sider
      width={260}
      style={{
        background: "linear-gradient(180deg, #bfdaf3 0%, #0d376c 100%)",
        boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        <Image
          width={260}
          height={210}
          alt="basic"
          src="../src/assets/logo/logo.png"
          preview={false}
        />
      </div>

      <Menu
        style={{
          background: "linear-gradient(180deg, #bfdaf3 0%, #0d376c 100%)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
          fontWeight: "700",
          color: "#fff",
        }}
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[...menuItems]}
      />
    </Sider>
  );
};

export default AppSidebar;
