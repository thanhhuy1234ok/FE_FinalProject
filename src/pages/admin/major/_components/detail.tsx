import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    App,
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Row,
    Select,
    Space,
    Spin,
    Tabs,
    Tag,
    Typography,
} from "antd";
import {
    ArrowLeftOutlined,
    BookOutlined,
    ApartmentOutlined,
    ReadOutlined,
} from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import { getMajorDetailAPI } from "@/services/api";
import { CurriculumStatus } from "@/types/status";

const { Title, Text } = Typography;
const { Option } = Select;

interface IFaculty {
    id: number;
    name: string;
    code?: string;
}

interface IDepartment {
    id: number;
    name: string;
    code?: string;
    faculty?: IFaculty;
}

interface IAdminClass {
    id: number;
    code: string;
    name: string;
    capacity?: number;
    status: AdminClassStatus;
    yearOfAdmission?: {
        id: number;
        year?: number | string;
        name?: string;
    };
}

interface ICurriculum {
    id: number;
    name: string;
    status: string;
    total_credits_required?: number;
    yearOfAdmission?: {
        id: number;
        year?: number | string;
        name?: string;
    };
}

interface IMajorDetail {
    id: number;
    code: string;
    name: string;
    description?: string;
    status: AdminClassStatus;
    department_id?: number;
    department?: IDepartment;
    createdAt?: string;
    updatedAt?: string;
    adminClasses?: IAdminClass[];
    curriculums?: ICurriculum[];
}
export enum AdminClassStatus {
    PENDING = "PENDING",
    STUDYING = "STUDYING",
    GRADUATED = "GRADUATED",
}

export const renderStatusTag = (status?: any) => {
    switch (status) {
        case AdminClassStatus.PENDING:
            return <Tag color="warning">Chờ mở lớp</Tag>;

        case AdminClassStatus.STUDYING:
            return <Tag color="success">Đang học</Tag>;

        case AdminClassStatus.GRADUATED:
            return <Tag color="blue">Đã tốt nghiệp</Tag>;

        default:
            return <Tag>Mặc định</Tag>;
    }
};

const renderCurriculumStatus = (status: any) => {
    switch (status) {
        case CurriculumStatus.ACTIVE:
            return <Tag color="success">Đang áp dụng</Tag>;

        case CurriculumStatus.DRAFT:
            return <Tag color="processing">Bản nháp</Tag>;

        case CurriculumStatus.ARCHIVED:
            return <Tag color="default">Đã lưu trữ</Tag>;

        default:
            return <Tag>Không xác định</Tag>;
    }
};

const MajorDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { message } = App.useApp();

    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<IMajorDetail | null>(null);
    const [selectedYearId, setSelectedYearId] = useState<number | undefined>();

    const fetchDetail = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const res = await getMajorDetailAPI(Number(id));
            const data = res?.data?.data ?? res?.data ?? null;
            setDetail(data);
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Không thể tải chi tiết chuyên ngành",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const adminClasses = useMemo(() => detail?.adminClasses ?? [], [detail]);
    const curriculums = useMemo(() => detail?.curriculums ?? [], [detail]);

    const yearOptions = useMemo(() => {
        const map = new Map<number, string>();

        adminClasses.forEach((item) => {
            const yearId = item.yearOfAdmission?.id;
            const yearLabel = String(
                item.yearOfAdmission?.year ?? item.yearOfAdmission?.name ?? "",
            );

            if (yearId && yearLabel) {
                map.set(yearId, yearLabel);
            }
        });

        return Array.from(map.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => Number(b.label) - Number(a.label));
    }, [adminClasses]);

    const filteredAdminClasses = useMemo(() => {
        if (!selectedYearId) return adminClasses;

        return adminClasses.filter(
            (item) => item.yearOfAdmission?.id === selectedYearId,
        );
    }, [adminClasses, selectedYearId]);

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!detail) {
        return (
            <Card style={{ margin: 16 }}>
                <Empty description="Không có dữ liệu chuyên ngành" />
                <div style={{ marginTop: 16 }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div style={{ padding: 16 }}>
            <ProCard
                bordered
                headerBordered
                style={{ marginBottom: 16 }}
                title={
                    <Space direction="vertical" size={0}>
                        <Title level={4} style={{ margin: 0 }}>
                            {detail.name}
                        </Title>
                        <Text type="secondary">
                            Mã chuyên ngành: {detail.code}
                        </Text>
                    </Space>
                }
                extra={
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                }
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Card size="small" bordered>
                            <Space direction="vertical" size={4}>
                                <Text type="secondary">Trạng thái</Text>
                                {renderStatusTag(detail.status)}
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card size="small" bordered>
                            <Space direction="vertical" size={4}>
                                <Text type="secondary">Bộ môn</Text>
                                <Text strong>
                                    {detail.department?.name || "--"}
                                </Text>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card size="small" bordered>
                            <Space direction="vertical" size={4}>
                                <Text type="secondary">Khoa</Text>
                                <Text strong>
                                    {detail.department?.faculty?.name || "--"}
                                </Text>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </ProCard>

            <Card bordered>
                <Tabs
                    defaultActiveKey="general"
                    items={[
                        {
                            key: "general",
                            label: (
                                <Space size={6}>
                                    <BookOutlined />
                                    <span>Thông tin chung</span>
                                </Space>
                            ),
                            children: (
                                <Descriptions bordered column={1} size="middle">
                                    <Descriptions.Item label="Tên chuyên ngành">
                                        {detail.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Mã chuyên ngành">
                                        {detail.code}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        {renderStatusTag(detail.status)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Bộ môn">
                                        {detail.department?.name || "--"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Mô tả">
                                        {detail.description || "--"}
                                    </Descriptions.Item>
                                </Descriptions>
                            ),
                        },
                        {
                            key: "classes",
                            label: (
                                <Space size={6}>
                                    <ApartmentOutlined />
                                    <span>Lớp hành chính</span>
                                </Space>
                            ),
                            children: (
                                <>
                                    <div style={{ marginBottom: 16 }}>
                                        <Space wrap>
                                            <Text strong>
                                                Lọc theo năm nhập học:
                                            </Text>
                                            <Select
                                                allowClear
                                                placeholder="Chọn năm nhập học"
                                                style={{ minWidth: 220 }}
                                                value={selectedYearId}
                                                onChange={(value) =>
                                                    setSelectedYearId(value)
                                                }
                                            >
                                                {yearOptions.map((item) => (
                                                    <Option
                                                        key={item.value}
                                                        value={item.value}
                                                    >
                                                        {item.label}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Space>
                                    </div>

                                    {filteredAdminClasses.length > 0 ? (
                                        <Row gutter={[16, 16]}>
                                            {filteredAdminClasses.map(
                                                (item) => (
                                                    <Col
                                                        xs={24}
                                                        md={12}
                                                        xl={8}
                                                        key={item.id}
                                                    >
                                                        <Card
                                                            size="small"
                                                            title={item.name}
                                                            extra={renderStatusTag(
                                                                item.status,
                                                            )}
                                                        >
                                                            <Descriptions
                                                                column={1}
                                                                size="small"
                                                            >
                                                                <Descriptions.Item label="Mã lớp">
                                                                    {item.code}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="Sĩ số">
                                                                    {item.capacity ??
                                                                        "--"}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="Năm nhập học">
                                                                    {item
                                                                        .yearOfAdmission
                                                                        ?.year ??
                                                                        item
                                                                            .yearOfAdmission
                                                                            ?.name ??
                                                                        "--"}
                                                                </Descriptions.Item>
                                                            </Descriptions>
                                                        </Card>
                                                    </Col>
                                                ),
                                            )}
                                        </Row>
                                    ) : (
                                        <Empty description="Không có lớp hành chính phù hợp" />
                                    )}
                                </>
                            ),
                        },
                        {
                            key: "curriculums",
                            label: (
                                <Space size={6}>
                                    <ReadOutlined />
                                    <span>Chương trình đào tạo</span>
                                </Space>
                            ),
                            children:
                                curriculums.length > 0 ? (
                                    <Row gutter={[16, 16]}>
                                        {curriculums.map((item) => (
                                            <Col
                                                xs={24}
                                                md={12}
                                                xl={8}
                                                key={item.id}
                                            >
                                                <Card
                                                    size="small"
                                                    title={item.name}
                                                    extra={renderCurriculumStatus(
                                                        item.status,
                                                    )}
                                                >
                                                    <Descriptions
                                                        column={1}
                                                        size="small"
                                                    >
                                                        <Descriptions.Item label="Năm nhập học">
                                                            {item
                                                                .yearOfAdmission
                                                                ?.year ??
                                                                item
                                                                    .yearOfAdmission
                                                                    ?.name ??
                                                                "--"}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label="Tổng tín chỉ">
                                                            {item.total_credits_required ??
                                                                "--"}
                                                        </Descriptions.Item>
                                                    </Descriptions>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <Empty description="Chưa có chương trình đào tạo" />
                                ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default MajorDetailPage;
