import { Layout, Menu } from "antd";
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
        background: "linear-gradient(180deg, #56a1e8 0%, #afc5e4 100%)",
        boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          paddingLeft: 24,
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        Trường của Huy
      </div>

      <Menu
        style={{
          background: "linear-gradient(180deg, #56a1e8 0%, #afc5e4 100%)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
          fontWeight: "700",
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
