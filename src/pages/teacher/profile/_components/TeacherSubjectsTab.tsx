import { BookOutlined, CodeOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Space, Tag, Typography } from "antd";

const { Text, Title } = Typography;

const TeacherSubjectsTab = ({ subjects = [] }: any) => {
    if (!subjects.length) {
        return <Empty description="Chưa có môn giảng dạy" />;
    }

    return (
        <Row gutter={[20, 20]}>
            {subjects.map((subject: any) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={subject.id}>
                    <Card
                        hoverable
                        style={{
                            borderRadius: 20,
                            height: "100%",
                            border: "1px solid #f0f0f0",
                        }}
                        bodyStyle={{ padding: 20 }}
                    >
                        <Space direction="vertical" size={14}>
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 16,
                                    background: "#f5f7ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 24,
                                    color: "#1677ff",
                                }}
                            >
                                <CodeOutlined />
                            </div>

                            <div>
                                <Title level={5} style={{ marginBottom: 4 }}>
                                    {subject.name}
                                </Title>
                                <Text type="secondary">
                                    Mã môn: {subject.code || "-"}
                                </Text>
                            </div>

                            <Space wrap>
                                <Tag color="processing">
                                    <BookOutlined /> {subject.credit || 0} tín
                                    chỉ
                                </Tag>
                                <Tag color="blue">Đang giảng dạy</Tag>
                            </Space>
                        </Space>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default TeacherSubjectsTab;
