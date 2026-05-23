import { Button, Card, Col, Row, Space, Typography } from "antd";

const { Title, Text } = Typography;

type Props = {
    onReload: () => void;
    onBack: () => void;
};

const PaymentHeaderCard = ({ onReload, onBack }: Props) => {
    return (
        <Card style={{ borderRadius: 16 }}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        Thanh toán học phí
                    </Title>
                    <Text type="secondary">
                        Kiểm tra danh sách môn học và thanh toán qua VNPay.
                    </Text>
                </Col>

                <Col>
                    <Space>
                        <Button onClick={onReload}>Tải lại</Button>
                        <Button onClick={onBack}>Quay lại</Button>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
};

export default PaymentHeaderCard;
