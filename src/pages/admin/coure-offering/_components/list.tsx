import DataTable from "@/components/share/data.table";
import RenderHeaderTable from "@/components/share/header.table";
import { buildQuery } from "@/helper/buildQuery";
import {
    bulkOpenCourseOfferingAPI,
    getCourseOfferingAPI,
} from "@/services/api";
import { type ActionType, type ProColumns } from "@ant-design/pro-components";
import {
    Badge,
    Button,
    Grid,
    notification,
    Popconfirm,
    Space,
    Tag,
    Typography,
} from "antd";
import { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import ModalCourseOffering from "./modal";
import ButtonComponents from "@/components/share/button";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface IMeta {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
}

interface ICourseOffering {
    id: number;
    maxStudents?: number;
    enrolledCount?: number;
    status:
        | "CREATED"
        | "WAITING_REGISTRATION"
        | "OPEN"
        | "CLOSED"
        | "IN_PROGRESS"
        | "FINISHED";
    createdAt?: string;
    code: string;
    teacherSubject?: {
        teacher?: {
            user?: {
                name?: string;
            };
        };
        subject?: {
            code?: string;
            name?: string;
            credit?: number;
        };
    };
    adminClass?: {
        id: number;
        name: string;
    } | null;
    term?: {
        semester?: "HK1" | "HK2" | "SUMMER";
        year?: number;
        startDate?: string;
        endDate?: string;
    };
}

const semesterMap: Record<string, { label: string; color: string }> = {
    HK1: { label: "Học kỳ 1", color: "blue" },
    HK2: { label: "Học kỳ 2", color: "cyan" },
    SUMMER: { label: "Học kỳ hè", color: "orange" },
};

const courseOfferingStatusMap: Record<
    string,
    {
        text: string;
        status: "success" | "processing" | "default" | "warning" | "error";
    }
> = {
    CREATED: { text: "Đã tạo", status: "default" },
    WAITING_REGISTRATION: { text: "Chờ đăng ký", status: "warning" },
    OPEN: { text: "Đang mở", status: "success" },
    CLOSED: { text: "Đã đóng", status: "default" },
    IN_PROGRESS: { text: "Đang học", status: "processing" },
    FINISHED: { text: "Đã kết thúc", status: "error" },
};

const ListCourseOffering = () => {
    const tableRef = useRef<ActionType>();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isTablet = !!screens.md && !screens.lg;
    const navigate = useNavigate();
    const [meta, setMeta] = useState<IMeta>({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    const [openModal, setOpenModal] = useState(false);
    const [openModalImport, setOpenModalImport] = useState(false);
    const [selectedRecord, setSelectedRecord] =
        useState<ICourseOffering | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    const handleExportData = async () => {
        // TODO: xử lý export sau
    };

    const handleBulkOpen = async () => {
        try {
            setBulkLoading(true);

            const ids = selectedRowKeys.map((id) => Number(id));
            const res = await bulkOpenCourseOfferingAPI(ids);

            notification.success({
                message: "Mở đăng ký thành công",
                description: res?.message || "Đã cập nhật trạng thái hàng loạt",
            });

            const skipped = res?.data?.skipped;
            if (Array.isArray(skipped) && skipped.length > 0) {
                notification.warning({
                    message: "Một số lớp chưa được mở",
                    description: skipped
                        .slice(0, 3)
                        .map(
                            (item: any) =>
                                `${item.code || item.id}: ${item.reason}`,
                        )
                        .join(" | "),
                });
            }

            setSelectedRowKeys([]);
            tableRef.current?.reload();
        } catch (error: any) {
            const errMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Mở đăng ký thất bại";

            notification.error({
                message: "Mở đăng ký thất bại",
                description: Array.isArray(errMessage)
                    ? errMessage[0]
                    : errMessage,
            });
        } finally {
            setBulkLoading(false);
        }
    };

    const columns: ProColumns<ICourseOffering>[] = useMemo(
        () => [
            {
                title: "STT",
                valueType: "indexBorder",
                width: 60,
                align: "center",
                hideInSearch: true,
                fixed: isTablet || isMobile ? undefined : "left",
                render: (_text, _record, index) => (
                    <Text>
                        {(meta.current - 1) * meta.pageSize + index + 1}
                    </Text>
                ),
            },
            {
                title: "Môn học",
                key: "subject",
                dataIndex: "subject",
                width: isMobile ? 180 : 240,
                ellipsis: true,
                render: (_, record) => {
                    const code = record.teacherSubject?.subject?.code || "-";
                    const name = record.teacherSubject?.subject?.name || "-";
                    const credit = record.teacherSubject?.subject?.credit;

                    return (
                        <Space direction="vertical" size={2}>
                            <Tag color="blue" style={{ width: "fit-content" }}>
                                {code}
                            </Tag>
                            <Text strong ellipsis>
                                {name}
                            </Text>
                            <Text type="secondary">
                                Tín chỉ: {credit ?? "-"}
                            </Text>
                        </Space>
                    );
                },
            },
            {
                title: "Mã lớp học phần",
                dataIndex: "code",
                width: 150,
                render: (_, record) => <Tag color="blue">{record.code}</Tag>,
            },
            {
                title: "Giảng viên",
                key: "teacherName",
                dataIndex: "teacher",
                width: isMobile ? 120 : 150,
                ellipsis: true,
                render: (_, record) => (
                    <Text ellipsis>
                        {record.teacherSubject?.teacher?.user?.name || "-"}
                    </Text>
                ),
            },
            {
                title: "Lớp áp dụng",
                key: "adminClass",
                dataIndex: "adminClass",
                width: isMobile ? 130 : 180,
                ellipsis: true,
                hideInSearch: true,
                render: (_, record) =>
                    record.adminClass?.name ? (
                        <Text>{record.adminClass.name}</Text>
                    ) : (
                        <Text type="secondary">Không có lớp áp dụng</Text>
                    ),
            },
            {
                title: "Kỳ học",
                dataIndex: "semester",
                width: isMobile ? 100 : 150,
                align: "center",
                valueType: "select",
                valueEnum: {
                    HK1: { text: "HK1" },
                    HK2: { text: "HK2" },
                    SUMMER: { text: "Hè" },
                },
                render: (_, record) => {
                    const semester = record.term?.semester;
                    const year = record.term?.year;

                    if (!semester) {
                        return <Text type="secondary">-</Text>;
                    }

                    const config = semesterMap[semester] || {
                        label: semester,
                        color: "default",
                    };

                    return (
                        <Space direction="vertical" size={2} align="center">
                            <Tag color={config.color}>{config.label}</Tag>
                            <Text type="secondary">{year ?? "-"}</Text>
                        </Space>
                    );
                },
            },
            {
                title: "Sĩ số",
                key: "capacity",
                width: isMobile ? 100 : 150,
                align: "center",
                hideInSearch: true,
                render: (_, record) => {
                    const enrolled = record.enrolledCount ?? 0;
                    const max = record.maxStudents ?? 0;

                    return (
                        <Space direction="vertical" size={0}>
                            <Text strong>
                                {enrolled}/{max}
                            </Text>
                            <Text type="secondary">Đã đăng ký / tối đa</Text>
                        </Space>
                    );
                },
            },
            {
                title: "Trạng thái",
                dataIndex: "status",
                width: isMobile ? 140 : 140,
                align: "center",
                valueType: "select",
                valueEnum: {
                    CREATED: { text: "Đã tạo" },
                    WAITING_REGISTRATION: { text: "Chờ đăng ký" },
                    OPEN: { text: "Đang mở" },
                    CLOSED: { text: "Đã đóng" },
                    IN_PROGRESS: { text: "Đang học" },
                    FINISHED: { text: "Đã kết thúc" },
                },
                render: (_, record) => {
                    const config = courseOfferingStatusMap[record.status] || {
                        text: record.status || "-",
                        status: "default" as const,
                    };

                    return <Badge status={config.status} text={config.text} />;
                },
            },
            {
                title: "Ngày tạo",
                dataIndex: "createdAt",
                hideInSearch: true,
                align: "center",
                width: 150,
                hideInTable: isMobile,
                render: (_, record) => (
                    <Text type="secondary">
                        {record.createdAt
                            ? dayjs(record.createdAt).format("DD/MM/YYYY")
                            : "—"}
                    </Text>
                ),
            },
            {
                title: "Detail",
                key: "detail",
                hideInSearch: true,
                align: "center",
                width: isMobile ? 120 : 170,
                fixed: isTablet ? undefined : "right",
                render: (_value, entity) => {
                    return (
                        <ButtonComponents
                            title={isMobile ? "Chi tiết" : "Xem chi tiết"}
                            key={entity.id}
                            onClick={() => navigate(`${entity.id}`)}
                        />
                    );
                },
            },
        ],
        [isMobile, isTablet],
    );

    return (
        <>
            <DataTable<ICourseOffering>
                actionRef={tableRef}
                rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys),
                    getCheckboxProps: (record) => ({
                        disabled: record.status !== "WAITING_REGISTRATION",
                    }),
                }}
                headerTitle={
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 16 }}>
                            Danh sách lớp học phần
                        </Text>
                        {!isMobile && (
                            <Text type="secondary">
                                Quản lý môn học mở theo kỳ, giảng viên và số
                                lượng sinh viên
                            </Text>
                        )}
                    </Space>
                }
                rowKey="id"
                columns={columns}
                scroll={{ x: 1100 }}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    simple: isMobile,
                    showTotal: isMobile
                        ? undefined
                        : (total, range) => {
                              return (
                                  <div>
                                      {range[0]}-{range[1]} trên {total} dòng
                                  </div>
                              );
                          },
                }}
                request={async (params, sort, filter) => {
                    const qs = buildQuery(params, sort, filter);
                    const res = await getCourseOfferingAPI(qs);

                    const result: ICourseOffering[] = res?.data?.result ?? [];
                    const nextMeta = res?.data?.meta ?? {
                        current: params.current ?? 1,
                        pageSize: params.pageSize ?? 10,
                        pages: 0,
                        total: result.length,
                    };

                    setMeta(nextMeta);

                    return {
                        data: result,
                        success: true,
                        total: nextMeta.total ?? result.length,
                    };
                }}
                toolBarRender={() => [
                    <Popconfirm
                        key="bulk-open"
                        title="Mở đăng ký hàng loạt"
                        description={`Bạn có chắc muốn mở đăng ký ${selectedRowKeys.length} lớp học phần đã chọn?`}
                        onConfirm={handleBulkOpen}
                        okText="Mở đăng ký"
                        cancelText="Hủy"
                        disabled={selectedRowKeys.length === 0}
                    >
                        <Button
                            type="primary"
                            loading={bulkLoading}
                            disabled={selectedRowKeys.length === 0}
                        >
                            Mở đăng ký ({selectedRowKeys.length})
                        </Button>
                    </Popconfirm>,

                    <RenderHeaderTable
                        key="toolbar"
                        handleExportData={handleExportData}
                        setOpenModalImport={setOpenModalImport}
                        setOpenModal={(value) => {
                            if (typeof value === "function") return;
                            if (value === true) setSelectedRecord(null);
                            setOpenModal(value);
                        }}
                        showExport
                        showImport={false}
                        showAdd
                    />,
                ]}
                search={{
                    layout: "vertical",
                    defaultCollapsed: false,
                    span: isMobile ? 24 : isTablet ? 12 : 8,
                    labelWidth: "auto",
                }}
                cardProps={{
                    bodyStyle: {
                        padding: isMobile ? 12 : 16,
                    },
                }}
            />

            <ModalCourseOffering
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={() => tableRef.current?.reload()}
                dataUpdate={selectedRecord || undefined}
            />
        </>
    );
};

export default ListCourseOffering;
