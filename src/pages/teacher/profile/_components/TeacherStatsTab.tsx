import {
    BookOutlined,
    ScheduleOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";

const TeacherStatsCards = ({ stats }: any) => {
    return (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={6}>
                <Card>
                    <Statistic
                        title="Môn phụ trách"
                        value={stats?.totalSubjects || 0}
                        prefix={<BookOutlined />}
                    />
                </Card>
            </Col>

            <Col xs={24} md={6}>
                <Card>
                    <Statistic
                        title="Lớp đang dạy"
                        value={stats?.totalCourses || 0}
                        prefix={<ScheduleOutlined />}
                    />
                </Card>
            </Col>

            <Col xs={24} md={6}>
                <Card>
                    <Statistic
                        title="Sinh viên"
                        value={stats?.totalStudents || 0}
                        prefix={<TeamOutlined />}
                    />
                </Card>
            </Col>

            <Col xs={24} md={6}>
                <Card>
                    <Statistic
                        title="Tổng buổi học"
                        value={stats?.totalLessons || 0}
                        prefix={<ScheduleOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default TeacherStatsCards;
