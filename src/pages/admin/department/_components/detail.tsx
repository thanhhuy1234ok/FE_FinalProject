import { useEffect, useMemo, useState } from "react";
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
    Tabs,
    message,
} from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";

import { detailDepartmentAPI } from "@/services/api";

import SubjectTab from "./tab/subject.tab";
import CurriculumTab from "./tab/curriculum.tab";
import MajorTab from "./tab/major.tab";

const { Title, Text } = Typography;

const DepartmentDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const departmentId = useMemo(() => Number(id || 0), [id]);

    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState<IDepartment | null>(null);
    const [activeTab, setActiveTab] = useState<
        "curriculums" | "subjects" | "majors"
    >("majors");

    const fetchDetail = async () => {
        if (!departmentId) return;

        try {
            setLoading(true);
            const res = await detailDepartmentAPI(departmentId);
            setDepartment(res?.data ?? null);
        } catch (err) {
            console.log(err);
            message.error("Không tải được chi tiết bộ môn!");
            setDepartment(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!departmentId) return;
        void fetchDetail();
    }, [departmentId]);

    return (
        <PageContainer
            title={`Chi tiết ${department?.name ?? "bộ môn"}`}
            extra={[
                <Button
                    key="back"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>,
                <Button
                    key="reload"
                    icon={<ReloadOutlined />}
                    onClick={fetchDetail}
                >
                    Làm mới
                </Button>,
            ]}
        >
            <Card style={{ marginBottom: 16 }}>
                {loading ? (
                    <div style={{ padding: 24, textAlign: "center" }}>
                        <Spin />
                    </div>
                ) : !department ? (
                    <Empty description="Không tìm thấy bộ môn" />
                ) : (
                    <>
                        <Space
                            direction="vertical"
                            size={6}
                            style={{ width: "100%" }}
                        >
                            <Title level={4} style={{ margin: 0 }}>
                                {department.name}
                                {department.code ? (
                                    <Tag style={{ marginLeft: 8 }}>
                                        {department.code}
                                    </Tag>
                                ) : null}
                            </Title>

                            <Text type="secondary">
                                Trạng thái:{" "}
                                {department.isActive ? (
                                    <Tag color="green">Đang hoạt động</Tag>
                                ) : (
                                    <Tag>Tạm ngưng</Tag>
                                )}
                            </Text>
                        </Space>

                        <Divider />

                        <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="ID">
                                {String(department.id)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã">
                                {department.code || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên bộ môn" span={2}>
                                {department.name || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tạo lúc">
                                {department.createdAt
                                    ? new Date(
                                          department.createdAt,
                                      ).toLocaleString()
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật">
                                {department.updatedAt
                                    ? new Date(
                                          department.updatedAt,
                                      ).toLocaleString()
                                    : "N/A"}
                            </Descriptions.Item>
                        </Descriptions>
                    </>
                )}
            </Card>

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) =>
                        setActiveTab(
                            key as "curriculums" | "subjects" | "majors",
                        )
                    }
                    items={[
                        {
                            key: "majors",
                            label: "Chuyên ngành",
                            children: (
                                <MajorTab
                                    departmentId={departmentId}
                                    active={activeTab === "majors"}
                                />
                            ),
                        },
                        {
                            key: "curriculums",
                            label: "Chương trình đào tạo",
                            children: (
                                <CurriculumTab
                                    departmentId={departmentId}
                                    active={activeTab === "curriculums"}
                                />
                            ),
                        },

                        {
                            key: "subjects",
                            label: "Môn học",
                            children: (
                                <SubjectTab
                                    departmentId={departmentId}
                                    active={activeTab === "subjects"}
                                />
                            ),
                        },
                    ]}
                />
            </Card>
        </PageContainer>
    );
};

export default DepartmentDetailPage;
