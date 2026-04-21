import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Button,
    Card,
    Descriptions,
    Divider,
    Empty,
    Space,
    Spin,
    Statistic,
    Tag,
    Typography,
    Row,
    Col,
    Tabs,
    message,
} from "antd";
import {
    ArrowLeftOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
    countFacultyAPI,
    detailFacultyAPI,
    getDepartmentsAPI,
    getListTeacherAPI,
} from "@/services/api";
import DataTable from "@/components/share/data.table";
import { buildQuery } from "@/helper/buildQuery";
import CountUp from "react-countup";

const { Title, Text } = Typography;

interface IFacultyStats {
    id: number;
    departmentCount: number;
    teacherCount: number;
    studentCount: number;
}

const defaultStats: IFacultyStats = {
    id: 0,
    departmentCount: 0,
    teacherCount: 0,
    studentCount: 0,
};

const FacultyDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const facultyId = useMemo(() => Number(id || 0), [id]);
    const departmentTableRef = useRef<ActionType | null>(null);
    const teacherTableRef = useRef<ActionType | null>(null);

    const [loading, setLoading] = useState(true);
    const [faculty, setFaculty] = useState<IFaculty | null>(null);
    const [stats, setStats] = useState<IFacultyStats>(defaultStats);

    const fetchDetail = useCallback(async () => {
        if (!facultyId) {
            setFaculty(null);
            return;
        }

        const res = await detailFacultyAPI(facultyId);
        setFaculty(res?.data ?? null);
    }, [facultyId]);

    const fetchStats = useCallback(async () => {
        if (!facultyId) {
            setStats(defaultStats);
            return;
        }

        const res = await countFacultyAPI(facultyId);
        setStats(
            res?.data.result ?? {
                ...defaultStats,
                id: facultyId,
            },
        );
    }, [facultyId]);

    const fetchPageData = useCallback(async () => {
        if (!facultyId) {
            setFaculty(null);
            setStats(defaultStats);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            await Promise.all([fetchDetail(), fetchStats()]);
        } catch (error) {
            console.error(error);
            message.error("Không tải được chi tiết khoa!");
            setFaculty(null);
            setStats({
                ...defaultStats,
                id: facultyId,
            });
        } finally {
            setLoading(false);
        }
    }, [facultyId, fetchDetail, fetchStats]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const formatter = (value: number | string) => {
        return <CountUp end={Number(value)} separator="," />;
    };

    const departmentColumns: ProColumns<IDepartment>[] = [
        {
            title: "#",
            valueType: "indexBorder",
            width: 48,
        },
        {
            title: "Mã bộ môn",
            dataIndex: "code",
            width: 140,
            render: (_, record) =>
                record.code ? <Tag>{record.code}</Tag> : <Tag>N/A</Tag>,
        },
        {
            title: "Tên bộ môn",
            dataIndex: "name",
            ellipsis: true,
        },
        {
            title: "Số giảng viên",
            dataIndex: "teacherCount",
            width: 140,
            align: "center",
            render: (_, record) => (
                <Tag color="blue">{record?.teacherCount ?? 0}</Tag>
            ),
        },
        {
            title: "Số học viên",
            dataIndex: "studentCount",
            width: 140,
            align: "center",
            render: (_, record) => (
                <Tag color="purple">{record.studentCount ?? 0}</Tag>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            ellipsis: true,
            render: (value) => value || "N/A",
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            width: 130,
            render: (_, record) =>
                record.isActive === false ? (
                    <Tag>Tạm ngưng</Tag>
                ) : (
                    <Tag color="green">Đang hoạt động</Tag>
                ),
        },
    ];

    const teacherColumns: ProColumns<ITeacherProfile>[] = [
        {
            title: "#",
            valueType: "indexBorder",
            width: 48,
        },
        {
            title: "Mã GV",
            dataIndex: "msgv",
            width: 120,
            render: (value) =>
                value ? <Tag color="processing">{value}</Tag> : "N/A",
        },
        {
            title: "Họ tên",
            dataIndex: ["user", "name"],
            ellipsis: true,
            render: (value) => value || "N/A",
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            ellipsis: true,
            render: (value) => value || "N/A",
        },
        {
            title: "Bộ môn",
            key: "department",
            render: (_, record) => record?.department?.name || "N/A",
        },
        {
            title: "Chuyên môn",
            dataIndex: "specialization",
            ellipsis: true,
            render: (value) => value || "N/A",
        },
        {
            title: "Trình độ",
            dataIndex: "degree",
            width: 140,
            render: (value) => value || "N/A",
        },
        {
            title: "Trạng thái",
            key: "isActive",
            width: 120,
            render: (_, record) =>
                record?.user?.isActive ? (
                    <Tag color="green">Hoạt động</Tag>
                ) : (
                    <Tag>Tạm ngưng</Tag>
                ),
        },
    ];

    return (
        <PageContainer
            title={`Chi tiết ${faculty?.name ?? "khoa"}`}
            extra={[
                <Button
                    key="reload"
                    onClick={() => {
                        fetchPageData();
                        departmentTableRef.current?.reload();
                        teacherTableRef.current?.reload();
                    }}
                >
                    Tải lại
                </Button>,
                <Button
                    key="back"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>,
            ]}
        >
            <Card style={{ marginBottom: 16 }}>
                {loading ? (
                    <div style={{ padding: 24, textAlign: "center" }}>
                        <Spin />
                    </div>
                ) : !faculty ? (
                    <Empty description="Không tìm thấy khoa" />
                ) : (
                    <>
                        <Space
                            direction="vertical"
                            size={6}
                            style={{ width: "100%" }}
                        >
                            <Title level={4} style={{ margin: 0 }}>
                                {faculty.name}{" "}
                                {faculty.code ? (
                                    <Tag>{faculty.code}</Tag>
                                ) : null}
                            </Title>

                            <Text type="secondary">
                                Trạng thái:{" "}
                                {faculty.isActive ? (
                                    <Tag color="green">Đang hoạt động</Tag>
                                ) : (
                                    <Tag>Tạm ngưng</Tag>
                                )}
                            </Text>
                        </Space>

                        <Divider />

                        <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="ID">
                                {String(faculty.id)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã">
                                {faculty.code || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên khoa" span={2}>
                                {faculty.name || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tạo lúc">
                                {faculty.createdAt
                                    ? new Date(
                                          faculty.createdAt,
                                      ).toLocaleString()
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật">
                                {faculty.updatedAt
                                    ? new Date(
                                          faculty.updatedAt,
                                      ).toLocaleString()
                                    : "N/A"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic
                                        title="Tổng số bộ môn"
                                        value={stats.departmentCount}
                                        prefix={<TeamOutlined />}
                                        formatter={formatter}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic
                                        title="Tổng số giảng viên"
                                        value={stats.teacherCount}
                                        prefix={<UserOutlined />}
                                        formatter={formatter}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic
                                        title="Tổng số học viên"
                                        value={stats.studentCount}
                                        prefix={<TeamOutlined />}
                                        formatter={formatter}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Card>

            <Card>
                <Tabs
                    defaultActiveKey="departments"
                    items={[
                        {
                            key: "departments",
                            label: "Bộ môn",
                            children: (
                                <DataTable<IDepartment>
                                    actionRef={departmentTableRef}
                                    rowKey="id"
                                    columns={departmentColumns}
                                    search={false}
                                    options={false}
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                    }}
                                    request={async (params, sort, filter) => {
                                        const qs = buildQuery(
                                            {
                                                ...params,
                                                facultyId: facultyId,
                                            },
                                            sort,
                                            filter,
                                        );

                                        const res = await getDepartmentsAPI(qs);
                                        const result: IDepartment[] =
                                            res?.data?.result ?? [];

                                        const nextMeta = res?.data?.meta ?? {
                                            current: params.current ?? 1,
                                            pageSize: params.pageSize ?? 10,
                                            pages: 0,
                                            total: result.length,
                                        };

                                        return {
                                            data: result,
                                            success: true,
                                            total:
                                                nextMeta.total ?? result.length,
                                        };
                                    }}
                                    locale={{
                                        emptyText: (
                                            <div
                                                style={{
                                                    padding: 24,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <Empty description="Khoa này chưa có bộ môn" />
                                            </div>
                                        ),
                                    }}
                                />
                            ),
                        },
                        {
                            key: "teachers",
                            label: "Giảng viên",
                            children: (
                                <DataTable<ITeacherProfile>
                                    actionRef={teacherTableRef}
                                    rowKey="id"
                                    columns={teacherColumns}
                                    search={false}
                                    options={false}
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                    }}
                                    request={async (params, sort, filter) => {
                                        const qs = buildQuery(
                                            {
                                                ...params,
                                                facultyId: facultyId,
                                            },
                                            sort,
                                            filter,
                                        );

                                        const res = await getListTeacherAPI(qs);
                                        const result: ITeacherProfile[] =
                                            res?.data?.result ?? [];

                                        const nextMeta = res?.data?.meta ?? {
                                            current: params.current ?? 1,
                                            pageSize: params.pageSize ?? 10,
                                            pages: 0,
                                            total: result.length,
                                        };

                                        return {
                                            data: result,
                                            success: true,
                                            total:
                                                nextMeta.total ?? result.length,
                                        };
                                    }}
                                    locale={{
                                        emptyText: (
                                            <div
                                                style={{
                                                    padding: 24,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <Empty description="Khoa này chưa có giảng viên" />
                                            </div>
                                        ),
                                    }}
                                />
                            ),
                        },
                    ]}
                />
            </Card>
        </PageContainer>
    );
};

export default FacultyDetailPage;
