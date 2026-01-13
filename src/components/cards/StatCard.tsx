import { Card, Col, Row, Statistic } from "antd";
import CountUp from "react-countup";

interface Props {
  title: string;
  value: number;
  percent: string;
  positive?: boolean;
  icon: React.ReactNode;
  bgColor?: string;
}

const formatter = (value: number | string) => (
  <CountUp end={Number(value)} separator="," />
);

const StatCard = ({
  title,
  value,
  percent,
  positive,
  icon,
  bgColor = "#1677ff",
}: Props) => {
  return (
    <Card className="stat-card">
      <Row justify="space-between" align="middle">
        <Col>
          <div className="stat-title">{title}</div>
          <Statistic value={value} formatter={formatter} />
          <span className={positive ? "positive" : "negative"}>{percent}</span>
        </Col>
        <Col>
          <div className="stat-icon">{icon}</div>
        </Col>
      </Row>
    </Card>
  );
};

export default StatCard;
