import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    App,
    Breadcrumb,
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Row,
    Skeleton,
    Space,
    Statistic,
    Tag,
    Typography,
} from "antd";
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    EditOutlined,
    HomeOutlined,
    PlusOutlined,
    TeamOutlined,
} from "@ant-design/icons";

import ModalAdminClass from "./ModalAdminClass";
import ModalAdvisor from "./ModalAdvisor";
import {
    getDetailAdminClassAPI,
    getDetailAdminClassAdviorAPI,
} from "@/services/api";

const { Title, Text } = Typography;

interface IMajor {
    id: number;
    name: string;
    code?: string;
    department_id?: number;
}

interface IYearOfAdmission {
    id: number;
    name?: string;
    year: number;
}

interface IStudent {
    id: string;
    name: string;
    email?: string;
}

interface IAdvisor {
    id: number;
    teacherId?: number | string | null;
    name?: string | null;
    email?: string | null;
    department?: string | null;
    msgv?: string | null;
    isPrimary?: boolean;
    startAt?: string | null;
    endAt?: string | null;
}

interface IAdminClassDetail {
    id: number;
    code: string;
    name: string;
    capacity?: number;
    createdAt?: string;
    updatedAt?: string;
    major?: IMajor | null;
    yearOfAdmission?: IYearOfAdmission | null;
    students?: IStudent[];
    studentCount?: number;
}

const AdminClassDetail = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const [dataDetail, setDataDetail] = useState<IAdminClassDetail | null>(
        null,
    );
    const [advisor, setAdvisor] = useState<IAdvisor | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [openAdvisorModal, setOpenAdvisorModal] = useState(false);
    const [visibleStudentCount, setVisibleStudentCount] = useState(10);

    const fetchDetail = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const res = await getDetailAdminClassAPI(+id);
            const result = res?.data?.data ?? res?.data ?? null;
            setDataDetail(result);
        } catch (error) {
            message.error("Không thể tải chi tiết lớp hành chính");
        } finally {
            setLoading(false);
        }
    };

    const fetchAdvisor = async () => {
        if (!id) return;

        try {
            setAdvisorLoading(true);
            const res = await getDetailAdminClassAdviorAPI(+id);
            const raw = res?.data?.data ?? res?.data ?? null;
            const advisorRaw = Array.isArray(raw) ? raw[0] : raw;

            if (!advisorRaw) {
                setAdvisor(null);
                return;
            }

            setAdvisor({
                id: advisorRaw.id,
                msgv: advisorRaw.teacher?.msgv ?? advisorRaw.msgv ?? null,
                teacherId:
                    advisorRaw.teacher?.id ?? advisorRaw.teacherId ?? null,
                name: advisorRaw.teacher?.user?.name ?? advisorRaw.name ?? null,
                email:
                    advisorRaw.teacher?.user?.email ?? advisorRaw.email ?? null,
                department:
                    advisorRaw.teacher?.department?.name ??
                    advisorRaw.department ??
                    null,
                isPrimary: advisorRaw.isPrimary ?? false,
                startAt: advisorRaw.startAt ?? null,
                endAt: advisorRaw.endAt ?? null,
            });
        } catch (error) {
            setAdvisor(null);
            message.error("Không thể tải giáo viên hướng dẫn");
        } finally {
            setAdvisorLoading(false);
        }
    };

    const fetchAll = async () => {
        await Promise.all([fetchDetail(), fetchAdvisor()]);
    };

    useEffect(() => {
        setVisibleStudentCount(10);
        fetchAll();
    }, [id]);

    const students = dataDetail?.students ?? [];
    const studentCount = students.length || dataDetail?.studentCount || 0;
    const hasAdvisor = !!advisor;

    const visibleStudents = useMemo(() => {
        return students.slice(0, visibleStudentCount);
    }, [students, visibleStudentCount]);

    const hasMoreStudents = studentCount > visibleStudentCount;

    if (loading) {
        return (
            <Card>
                <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
        );
    }

    if (!dataDetail) {
        return (
            <Card>
                <Empty description="Không tìm thấy thông tin lớp học">
                    <Button onClick={() => navigate("/manage-subject/class")}>
                        Quay lại danh sách
                    </Button>
                </Empty>
            </Card>
        );
    }

    return (
        <>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <span>
                                    <HomeOutlined /> Trang chủ
                                </span>
                            ),
                        },
                        {
                            title: "Lớp hành chính",
                        },
                        {
                            title: dataDetail.name,
                        },
                    ]}
                />

                <Card>
                    <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                    >
                        <Col xs={24} md={16}>
                            <Space direction="vertical" size={4}>
                                <Space wrap>
                                    <Button
                                        icon={<ArrowLeftOutlined />}
                                        onClick={() => navigate(-1)}
                                    >
                                        Quay lại
                                    </Button>

                                    <Tag color="blue">{dataDetail.code}</Tag>
                                </Space>

                                <Title level={3} style={{ margin: 0 }}>
                                    {dataDetail.name}
                                </Title>

                                <Text type="secondary">
                                    Thông tin chi tiết lớp học
                                </Text>
                            </Space>
                        </Col>

                        <Col xs={24} md={8}>
                            <Row justify="end">
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => setOpenModal(true)}
                                >
                                    Chỉnh sửa
                                </Button>
                            </Row>
                        </Col>
                    </Row>
                </Card>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Sĩ số hiện tại"
                                value={studentCount}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Năm nhập học"
                                value={
                                    dataDetail.yearOfAdmission?.year ??
                                    dataDetail.yearOfAdmission?.name ??
                                    "—"
                                }
                                prefix={<CalendarOutlined />}
                                formatter={(value) => String(value)}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card title="Thông tin lớp">
                    <Descriptions
                        bordered
                        column={{ xs: 1, sm: 1, md: 2 }}
                        size="middle"
                    >
                        <Descriptions.Item label="Mã lớp">
                            <Tag color="blue">{dataDetail.code}</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tên lớp">
                            <Text strong>{dataDetail.name}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Chuyên ngành">
                            {dataDetail.major?.name || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Năm nhập học">
                            {dataDetail.yearOfAdmission?.year ??
                                dataDetail.yearOfAdmission?.name ??
                                "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Sĩ số hiện tại">
                            {studentCount}
                        </Descriptions.Item>

                        <Descriptions.Item label="Sức chứa">
                            {dataDetail.capacity ?? "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày tạo">
                            {dataDetail.createdAt
                                ? new Date(
                                      dataDetail.createdAt,
                                  ).toLocaleDateString()
                                : "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Cập nhật gần nhất">
                            {dataDetail.updatedAt
                                ? new Date(
                                      dataDetail.updatedAt,
                                  ).toLocaleDateString()
                                : "—"}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card
                    title="Giáo viên hướng dẫn"
                    loading={advisorLoading}
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setOpenAdvisorModal(true)}
                            disabled={hasAdvisor}
                            title={
                                hasAdvisor
                                    ? "Lớp này đã có giảng viên hướng dẫn"
                                    : "Thêm giảng viên hướng dẫn"
                            }
                        >
                            {hasAdvisor ? "Đã có GVHD" : "Thêm GVHD"}
                        </Button>
                    }
                >
                    {!advisor ? (
                        <Empty description="Chưa có giáo viên hướng dẫn" />
                    ) : (
                        <div
                            style={{
                                border: "1px solid #f0f0f0",
                                borderRadius: 12,
                                padding: 16,
                                background: "#fff",
                            }}
                        >
                            <Row
                                justify="space-between"
                                align="middle"
                                gutter={[16, 16]}
                            >
                                <Col flex="auto">
                                    <Space direction="vertical" size={4}>
                                        <Space wrap>
                                            <Text
                                                strong
                                                style={{ fontSize: 16 }}
                                            >
                                                {advisor.name || "—"}
                                            </Text>

                                            {advisor.isPrimary ? (
                                                <Tag color="gold">
                                                    Giáo viên chủ nhiệm
                                                </Tag>
                                            ) : null}
                                        </Space>

                                        <Text type="secondary">
                                            {advisor.email || "Không có email"}
                                        </Text>

                                        <Text type="secondary">
                                            Bộ môn:{" "}
                                            {advisor.department ||
                                                "Chưa cập nhật"}
                                        </Text>

                                        <Text type="secondary">
                                            Ngày bắt đầu:{" "}
                                            {advisor.startAt
                                                ? new Date(
                                                      advisor.startAt,
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </Text>

                                        <Text type="secondary">
                                            Ngày kết thúc:{" "}
                                            {advisor.endAt
                                                ? new Date(
                                                      advisor.endAt,
                                                  ).toLocaleDateString()
                                                : "Chưa có"}
                                        </Text>
                                    </Space>
                                </Col>

                                <Col>
                                    <Tag
                                        color="purple"
                                        style={{ fontSize: 14 }}
                                    >
                                        {advisor.msgv ||
                                            `GV #${advisor.teacherId ?? "—"}`}
                                    </Tag>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Card>

                <Card title={`Danh sách sinh viên (${studentCount})`}>
                    {!studentCount ? (
                        <Empty description="Chưa có sinh viên trong lớp này" />
                    ) : (
                        <Space
                            direction="vertical"
                            size={12}
                            style={{ width: "100%" }}
                        >
                            {visibleStudents.map((student) => (
                                <Card
                                    key={student.id}
                                    size="small"
                                    styles={{ body: { padding: 12 } }}
                                >
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                            <Space
                                                direction="vertical"
                                                size={0}
                                            >
                                                <Text strong>
                                                    {student.name}
                                                </Text>
                                                <Text type="secondary">
                                                    {student.email ??
                                                        "Không có email"}
                                                </Text>
                                            </Space>
                                        </Col>

                                        <Col>
                                            <Tag>{student.id}</Tag>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}

                            {hasMoreStudents && (
                                <div
                                    style={{
                                        textAlign: "center",
                                        marginTop: 8,
                                    }}
                                >
                                    <Button
                                        onClick={() =>
                                            setVisibleStudentCount(
                                                (prev) => prev + 10,
                                            )
                                        }
                                    >
                                        Xem thêm
                                    </Button>
                                </div>
                            )}
                        </Space>
                    )}
                </Card>
            </Space>

            <ModalAdminClass
                openModal={openModal}
                setOpenModal={setOpenModal}
                setDataInit={(value) =>
                    setDataDetail(value as IAdminClassDetail | null)
                }
                fetchData={fetchAll}
            />

            <ModalAdvisor
                openModal={openAdvisorModal}
                setOpenModal={setOpenAdvisorModal}
                adminClassId={Number(id)}
                departmentId={dataDetail?.major?.department_id}
                hasAdvisor={hasAdvisor}
                fetchData={fetchAll}
            />
        </>
    );
};

export default AdminClassDetail;
