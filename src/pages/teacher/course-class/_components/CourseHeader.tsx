import { ArrowLeftOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Col, Row, Space, Tag, Typography } from "antd";

const { Title, Text } = Typography;

interface IProps {
    course: any;
    subject: any;
    students: any[];
    onBack: () => void;
}

const CourseHeader = ({ course, subject, students, onBack }: IProps) => {
    return (
        <Card
            style={{
                borderRadius: 24,
                border: "none",
                background: "linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)",
            }}
        >
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Space direction="vertical" size={10}>
                        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                            Quay lại
                        </Button>

                        <Title level={2} style={{ color: "#fff", margin: 0 }}>
                            {subject.name}
                        </Title>

                        <Text style={{ color: "#eef6ff" }}>
                            Mã lớp: {course.code}
                        </Text>

                        <Space wrap>
                            <Tag color="blue">{subject.code}</Tag>
                            <Tag color="gold">{subject.credit} tín chỉ</Tag>
                            <Tag color="green">
                                {course.term?.semester} - {course.term?.year}
                            </Tag>
                        </Space>
                    </Space>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        style={{
                            borderRadius: 20,
                            background: "rgba(255,255,255,0.96)",
                        }}
                    >
                        <Space>
                            <Avatar
                                size={60}
                                style={{
                                    background: "#1677ff",
                                    fontWeight: 700,
                                    fontSize: 22,
                                }}
                            >
                                {subject.code?.slice(0, 2)}
                            </Avatar>

                            <div>
                                <Text type="secondary">Sĩ số lớp</Text>
                                <Title level={3} style={{ margin: 0 }}>
                                    {students.length}/{course.maxStudents || 0}
                                </Title>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default CourseHeader;
