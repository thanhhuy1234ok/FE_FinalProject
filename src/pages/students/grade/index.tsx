import { useEffect, useState } from "react";
import {
    Card,
    Col,
    Empty,
    Input,
    Row,
    Select,
    Space,
    Spin,
    Typography,
    message,
} from "antd";
import { SearchOutlined, TrophyOutlined } from "@ant-design/icons";

import StudyResultSummary from "./_components/StudyResultSummary";
import StudyResultTable from "./_components/StudyResultTable";
import {
    getMyFindStudyResultsAPI,
    getMyStudyResultsAPI,
    getTermsAPI,
} from "@/services/api";

const { Title, Text } = Typography;

const StudyResultPage = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<IStudyResult[]>([]);

    const [keyword, setKeyword] = useState("");
    const [termId, setTermId] = useState<number | undefined>();
    const [termOptions, setTermOptions] = useState<any[]>([]);

    const fetchResults = async (keywordValue = keyword, termValue = termId) => {
        try {
            setLoading(true);

            const query = new URLSearchParams();

            if (keywordValue.trim()) {
                query.append("keyword", keywordValue.trim());
            }

            if (termValue) {
                query.append("termId", String(termValue));
            }

            const res = await getMyFindStudyResultsAPI(query.toString());

            const data =
                res?.data?.data || res?.data?.result || res?.data || [];

            setResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log(error);
            message.error("Không tải được kết quả học tập");
        } finally {
            setLoading(false);
        }
    };

    const fetchTerms = async () => {
        try {
            const res = await getTermsAPI("current=1&pageSize=100");

            const data = res?.data?.result || [];

            setTermOptions(
                data.map((item: ITerm) => ({
                    label: `${item.semester} - ${item.year}${
                        item.isActive ? " (Đang hoạt động)" : ""
                    }`,
                    value: item.id,
                })),
            );
        } catch (error) {
            console.log(error);
            message.error("Không tải được danh sách học kỳ");
        }
    };

    useEffect(() => {
        fetchTerms();
        fetchResults("", undefined);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchResults(keyword, termId);
        }, 400);

        return () => clearTimeout(timer);
    }, [keyword, termId]);

    return (
        <div style={{ padding: 24 }}>
            <Card
                style={{
                    borderRadius: 18,
                    marginBottom: 20,
                    background:
                        "linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)",
                    color: "#fff",
                }}
                styles={{
                    body: {
                        padding: 28,
                    },
                }}
            >
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Space direction="vertical" size={4}>
                            <Title
                                level={3}
                                style={{ color: "#fff", margin: 0 }}
                            >
                                Kết quả học tập
                            </Title>

                            <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                                Theo dõi điểm số, tín chỉ và trạng thái qua môn
                            </Text>
                        </Space>
                    </Col>

                    <Col>
                        <TrophyOutlined
                            style={{ fontSize: 54, opacity: 0.9 }}
                        />
                    </Col>
                </Row>
            </Card>

            <StudyResultSummary results={results} />

            <Card
                style={{
                    borderRadius: 16,
                    marginTop: 20,
                    marginBottom: 20,
                }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={14}>
                        <Input
                            allowClear
                            size="large"
                            prefix={<SearchOutlined />}
                            placeholder="Tìm theo môn học, mã môn, mã lớp học phần..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </Col>

                    <Col xs={24} md={10}>
                        <Select
                            allowClear
                            size="large"
                            style={{ width: "100%" }}
                            placeholder="Lọc theo học kỳ"
                            value={termId}
                            options={termOptions}
                            onChange={(value) => setTermId(value)}
                        />
                    </Col>
                </Row>
            </Card>

            <Spin spinning={loading}>
                {results.length === 0 ? (
                    <Card style={{ borderRadius: 16 }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Chưa có kết quả học tập"
                        />
                    </Card>
                ) : (
                    <StudyResultTable results={results} />
                )}
            </Spin>
        </div>
    );
};

export default StudyResultPage;
