import { Row, Col } from "antd";
import {
  DollarOutlined,
  UserOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import StatCard from "../../../components/cards/StatCard";

const StatSection = () => {
  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} md={12} lg={6}>
        <StatCard
          title="Today's Sales"
          value={53000}
          percent="+30%"
          positive
          icon={<DollarOutlined />}
        />
      </Col>

      <Col xs={24} md={12} lg={6}>
        <StatCard
          title="Today's Users"
          value={3200}
          percent="+20%"
          positive
          icon={<UserOutlined />}
        />
      </Col>

      <Col xs={24} md={12} lg={6}>
        <StatCard
          title="New Clients"
          value={1200}
          percent="-20%"
          icon={<HeartOutlined />}
        />
      </Col>

      <Col xs={24} md={12} lg={6}>
        <StatCard
          title="New Orders"
          value={13200}
          percent="+10%"
          positive
          icon={<ShoppingCartOutlined />}
        />
      </Col>
    </Row>
  );
};

export default StatSection;
