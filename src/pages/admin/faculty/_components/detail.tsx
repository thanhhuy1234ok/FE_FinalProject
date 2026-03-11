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
    Tag,
    Typography,
    message,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { detailFacultyAPI, getDepartmentsAPI } from "@/services/api";
import DataTable from "@/components/share/data.table";
import { buildQuery } from "@/helper/buildQuery";

const { Title, Text } = Typography;

const FacultyDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const facultyId = useMemo(() => Number(id || 0), [id]);
    const departmentTableRef = useRef<ActionType | null>(null);

    const [loading, setLoading] = useState(true);
    const [faculty, setFaculty] = useState<IFaculty | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!facultyId) {
            setFaculty(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await detailFacultyAPI(facultyId);
            setFaculty(res?.data ?? null);
        } catch (err) {
            console.log(err);
            message.error("Không tải được chi tiết khoa!");
            setFaculty(null);
        } finally {
            setLoading(false);
        }
    }, [facultyId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

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

    return (
        <PageContainer
            title={`Chi tiết ${faculty?.name ?? "khoa"}`}
            extra={[
                <Button
                    key="reload"
                    onClick={() => {
                        fetchDetail();
                        departmentTableRef.current?.reload();
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
                    </>
                )}
            </Card>

            <Card>
                <Title level={5} style={{ marginTop: 0 }}>
                    Chi tiết bộ môn
                </Title>

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
                                facultyId,
                            },
                            sort,
                            filter,
                        );

                        const res = await getDepartmentsAPI(qs);

                        const result: IDepartment[] = res?.data?.result ?? [];
                        const nextMeta = res?.data?.meta ?? {
                            current: params.current ?? 1,
                            pageSize: params.pageSize ?? 10,
                            pages: 0,
                            total: result.length,
                        };

                        return {
                            data: result,
                            success: true,
                            total: nextMeta.total ?? result.length,
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
            </Card>
        </PageContainer>
    );
};

export default FacultyDetailPage;
