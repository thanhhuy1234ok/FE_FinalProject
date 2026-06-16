import DataTable from "@/components/share/data.table";
import RenderHeaderTable from "@/components/share/header.table";
import { buildQuery } from "@/helper/buildQuery";
import {
    bulkOpenCourseOfferingAPI,
    getCourseOfferingAPI,
    getTermsAPI,
} from "@/services/api";
import { type ActionType, type ProColumns } from "@ant-design/pro-components";
import {
    Badge,
    Button,
    Grid,
    notification,
    Popconfirm,
    Select,
    Space,
    Tag,
    Typography,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import ModalCourseOffering from "./modal-v2";
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

interface ITermOption {
    label: string;
    value: number;
    semester?: "HK1" | "HK2" | "SUMMER";
    year?: number;
    isActive?: boolean;
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
        id?: number;
        semester?: "HK1" | "HK2" | "SUMMER";
        year?: number;
        isActive?: boolean;
        startDate?: string;
        endDate?: string;
    };
}

const semesterMap: Record<
    string,
    { label: string; shortLabel: string; color: string }
> = {
    HK1: { label: "Học kỳ 1", shortLabel: "HK1", color: "blue" },
    HK2: { label: "Học kỳ 2", shortLabel: "HK2", color: "cyan" },
    SUMMER: { label: "Học kỳ hè", shortLabel: "Hè", color: "orange" },
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
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    const [termOptions, setTermOptions] = useState<ITermOption[]>([]);
    const [selectedTermId, setSelectedTermId] = useState<number | undefined>();
    const [termLoaded, setTermLoaded] = useState(false);

    const selectedTerm = useMemo(() => {
        return termOptions.find((item) => item.value === selectedTermId);
    }, [termOptions, selectedTermId]);

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const res = await getTermsAPI("current=1&pageSize=100");

                const terms = res?.data?.result ?? [];

                const options: ITermOption[] = terms.map((item: any) => {
                    const semesterConfig = semesterMap[item.semester] || {
                        label: item.semester || "Học kỳ",
                        shortLabel: item.semester || "HK",
                        color: "default",
                    };

                    return {
                        label: `${semesterConfig.label} - ${item.year}`,
                        value: Number(item.id),
                        semester: item.semester,
                        year: item.year,
                        isActive: item.isActive,
                    };
                });

                setTermOptions(options);

                const activeTerm = terms.find(
                    (item: any) => item.isActive === true,
                );

                if (activeTerm) {
                    setSelectedTermId(Number(activeTerm.id));
                } else if (terms.length > 0) {
                    setSelectedTermId(Number(terms[0].id));
                }
            } catch (error) {
                notification.error({
                    message: "Không tải được danh sách học kỳ",
                });
            } finally {
                setTermLoaded(true);
            }
        };

        fetchTerms();
    }, []);

    useEffect(() => {
        if (termLoaded) {
            tableRef.current?.reloadAndRest?.();
        }
    }, [selectedTermId, termLoaded]);

    const handleExportData = async () => {
        // TODO
    };

    const handleBulkOpen = async () => {
        try {
            setBulkLoading(true);

            const ids = selectedRowKeys.map((id) => Number(id));
            const res = await bulkOpenCourseOfferingAPI(ids);

            const response = res?.data?.data ?? res?.data;

            notification.success({
                message: "Mở đăng ký thành công",
                description:
                    res?.data?.message ||
                    response?.message ||
                    "Đã cập nhật trạng thái hàng loạt",
            });

            const skipped = response?.skipped ?? response?.data?.skipped;

            if (Array.isArray(skipped) && skipped.length > 0) {
                notification.warning({
                    message: `Có ${skipped.length} lớp chưa được mở`,
                    description: (
                        <div style={{ display: "grid", gap: 4 }}>
                            {skipped.slice(0, 5).map((item: any) => (
                                <div key={item.id}>
                                    <strong>{item.code || item.id}</strong>:{" "}
                                    {item.reason}
                                </div>
                            ))}
                        </div>
                    ),
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
                width: isMobile ? 180 : 260,
                ellipsis: true,
                hideInSearch: true,
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
                width: 160,
                render: (_, record) => <Tag color="blue">{record.code}</Tag>,
            },
            {
                title: "Giảng viên",
                key: "teacherName",
                dataIndex: "teacher",
                width: isMobile ? 120 : 170,
                ellipsis: true,
                hideInSearch: true,
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
                dataIndex: "termId",
                width: isMobile ? 130 : 180,
                align: "center",
                hideInSearch: true,
                render: (_, record) => {
                    const semester = record.term?.semester;
                    const year = record.term?.year;
                    const isActive = record.term?.isActive;

                    if (!semester) return <Text type="secondary">-</Text>;

                    const config = semesterMap[semester] || {
                        label: semester,
                        shortLabel: semester,
                        color: "default",
                    };

                    return (
                        <Space direction="vertical" size={3} align="center">
                            <Space size={4} wrap>
                                <Tag color={config.color}>
                                    {config.shortLabel}
                                </Tag>

                                {isActive && <Tag color="green">ACTIVE</Tag>}
                            </Space>

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
                    const percent = max
                        ? Math.round((enrolled / max) * 100)
                        : 0;

                    return (
                        <Space direction="vertical" size={2}>
                            <Tag
                                color={
                                    percent >= 90
                                        ? "red"
                                        : percent >= 70
                                          ? "orange"
                                          : "green"
                                }
                            >
                                {enrolled}/{max}
                            </Tag>
                            <Text type="secondary">Đã đăng ký</Text>
                        </Space>
                    );
                },
            },
            {
                title: "Trạng thái",
                dataIndex: "status",
                width: isMobile ? 140 : 150,
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
                title: "Chi tiết",
                key: "detail",
                hideInSearch: true,
                align: "center",
                width: isMobile ? 120 : 170,
                fixed: isTablet ? undefined : "right",
                render: (_value, entity) => (
                    <ButtonComponents
                        title={isMobile ? "Chi tiết" : "Xem chi tiết"}
                        key={entity.id}
                        onClick={() => navigate(`${entity.id}`)}
                    />
                ),
            },
        ],
        [isMobile, isTablet, meta.current, meta.pageSize, navigate],
    );

    return (
        <>
            <DataTable<ICourseOffering>
                actionRef={tableRef}
                rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys),
                    getCheckboxProps: (record) => ({
                        disabled:
                            record.status !== "WAITING_REGISTRATION" ||
                            !record.term ||
                            !record.teacherSubject,
                    }),
                }}
                headerTitle={
                    <Space direction="vertical" size={8}>
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

                        <Space direction="vertical" size={6}>
                            <Select
                                allowClear={false}
                                showSearch
                                loading={!termLoaded}
                                placeholder="Chọn học kỳ"
                                style={{
                                    width: isMobile ? "100%" : 340,
                                }}
                                options={termOptions}
                                value={selectedTermId}
                                optionFilterProp="label"
                                onChange={(value) => {
                                    setSelectedTermId(value);
                                    setSelectedRowKeys([]);
                                }}
                                optionRender={(option) => {
                                    const item = option.data as ITermOption;
                                    const config = semesterMap[
                                        item.semester || ""
                                    ] || {
                                        shortLabel: item.semester || "HK",
                                        color: "default",
                                    };

                                    return (
                                        <Space
                                            style={{
                                                width: "100%",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <Space>
                                                <Tag color={config.color}>
                                                    {config.shortLabel}
                                                </Tag>
                                                <span>{item.label}</span>
                                            </Space>

                                            {item.isActive && (
                                                <Tag color="green">
                                                    Đang hoạt động
                                                </Tag>
                                            )}
                                        </Space>
                                    );
                                }}
                            />

                            {selectedTerm && (
                                <Space wrap>
                                    <Tag
                                        color={
                                            selectedTerm.semester === "HK1"
                                                ? "blue"
                                                : selectedTerm.semester ===
                                                    "HK2"
                                                  ? "cyan"
                                                  : "orange"
                                        }
                                        style={{
                                            padding: "4px 10px",
                                        }}
                                    >
                                        {selectedTerm.label}
                                    </Tag>

                                    {selectedTerm.isActive && (
                                        <Tag
                                            color="green"
                                            style={{
                                                padding: "4px 10px",
                                            }}
                                        >
                                            Học kỳ đang hoạt động
                                        </Tag>
                                    )}
                                </Space>
                            )}
                        </Space>
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
                        : (total, range) => (
                              <div>
                                  {range[0]}-{range[1]} trên {total} dòng
                              </div>
                          ),
                }}
                request={async (params, sort, filter) => {
                    if (!termLoaded) {
                        return {
                            data: [],
                            success: true,
                            total: 0,
                        };
                    }

                    const finalParams = {
                        ...params,
                        ...(selectedTermId
                            ? {
                                  termId: selectedTermId,
                              }
                            : {}),
                    };

                    const qs = buildQuery(finalParams, sort, filter);
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
            />
        </>
    );
};

export default ListCourseOffering;
