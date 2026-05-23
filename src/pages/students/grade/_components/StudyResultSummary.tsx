import { Card, Col, Row, Statistic } from "antd";
import {
    BookOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TrophyOutlined,
} from "@ant-design/icons";

interface IProps {
    results: IStudyResult[];
}

const StudyResultSummary = ({ results }: IProps) => {
    const publishedResults = results.filter((item) => item.isPublished);
    const passed = publishedResults.filter((item) => item.isPassed).length;
    const failed = publishedResults.filter((item) => !item.isPassed).length;

    const totalCredit = publishedResults.reduce(
        (sum, item) => sum + Number(item.credit || 0),
        0,
    );

    const gpa =
        totalCredit > 0
            ? publishedResults.reduce(
                  (sum, item) =>
                      sum +
                      Number(item.totalScore || 0) * Number(item.credit || 0),
                  0,
              ) / totalCredit
            : 0;

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16 }}>
                    <Statistic
                        title="Môn đã có điểm"
                        value={publishedResults.length}
                        prefix={<BookOutlined />}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16 }}>
                    <Statistic
                        title="Điểm trung bình"
                        value={gpa}
                        precision={2}
                        prefix={<TrophyOutlined />}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16 }}>
                    <Statistic
                        title="Đã qua"
                        value={passed}
                        valueStyle={{ color: "#52c41a" }}
                        prefix={<CheckCircleOutlined />}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16 }}>
                    <Statistic
                        title="Chưa qua"
                        value={failed}
                        valueStyle={{ color: "#ff4d4f" }}
                        prefix={<CloseCircleOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default StudyResultSummary;
