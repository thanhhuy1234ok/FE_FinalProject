import DataTable from "@/components/share/data.table";
import RenderHeaderTable from "@/components/share/header.table";
import { buildQuery } from "@/helper/buildQuery";
import { activateTermAPI, getTermsAPI } from "@/services/api";
import { type ActionType, type ProColumns } from "@ant-design/pro-components";
import {
    Badge,
    Button,
    Grid,
    message,
    Popconfirm,
    Space,
    Tag,
    Typography,
} from "antd";
import { ReloadOutlined, SwapOutlined } from "@ant-design/icons";
import { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import ModalTerm from "./modal.term";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const semesterMap: Record<string, { label: string; color: string }> = {
    HK1: { label: "Học kỳ 1", color: "blue" },
    HK2: { label: "Học kỳ 2", color: "cyan" },
    SUMMER: { label: "Học kỳ hè", color: "orange" },
};

const ListTerm = () => {
    const actionRef = useRef<ActionType>();
    const screens = useBreakpoint();

    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;

    const [open, setModalOpen] = useState<boolean>(false);
    const [loadingActivateId, setLoadingActivateId] = useState<number | null>(
        null,
    );
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    const handleActivateTerm = async (term: ITerm) => {
        try {
            setLoadingActivateId(+term.id);

            await activateTermAPI(+term.id);

            message.success(
                `Đã chuyển sang ${semesterMap[term.semester]?.label ?? term.semester} năm ${term.year}`,
            );

            actionRef.current?.reload();
        } catch (error: any) {
            console.log(error);
            message.error(
                error?.message ?? "Chuyển kỳ học thất bại, vui lòng thử lại",
            );
        } finally {
            setLoadingActivateId(null);
        }
    };

    const columns: ProColumns<ITerm>[] = useMemo(() => {
        return [
            {
                title: "Năm học",
                dataIndex: "year",
                align: "center",
                width: isMobile ? 100 : 120,
                render: (_, record) => <Text strong>{record.year ?? "—"}</Text>,
            },
            {
                title: "Học kỳ",
                dataIndex: "semester",
                align: "center",
                width: isMobile ? 120 : 150,
                valueType: "select",
                valueEnum: {
                    HK1: { text: "HK1" },
                    HK2: { text: "HK2" },
                    SUMMER: { text: "Hè" },
                },
                render: (_, record) => {
                    const semester = semesterMap[record.semester] || {
                        label: record.semester,
                        color: "default",
                    };

                    return <Tag color={semester.color}>{semester.label}</Tag>;
                },
            },
            {
                title: "Bắt đầu",
                dataIndex: "startDate",
                hideInSearch: true,
                align: "center",
                width: isMobile ? 110 : 130,
                render: (_, record) => (
                    <Text>
                        {record.startDate
                            ? dayjs(record.startDate).format("DD/MM/YYYY")
                            : "—"}
                    </Text>
                ),
            },
            {
                title: "Kết thúc",
                dataIndex: "endDate",
                hideInSearch: true,
                align: "center",
                width: isMobile ? 110 : 130,
                render: (_, record) => (
                    <Text>
                        {record.endDate
                            ? dayjs(record.endDate).format("DD/MM/YYYY")
                            : "—"}
                    </Text>
                ),
            },
            {
                title: "Trạng thái",
                dataIndex: "isActive",
                align: "center",
                width: isMobile ? 130 : 150,
                valueType: "select",
                valueEnum: {
                    true: { text: "Hoạt động" },
                    false: { text: "Chưa hoạt động" },
                },
                render: (_, record) =>
                    record.isActive ? (
                        <Badge status="success" text="Đang hoạt động" />
                    ) : (
                        <Badge status="default" text="Chưa hoạt động" />
                    ),
            },
            {
                title: "Ngày tạo",
                dataIndex: "createdAt",
                hideInSearch: true,
                align: "center",
                width: 170,
                hideInTable: isMobile,
                render: (_, record) => (
                    <Text type="secondary">
                        {record.createdAt
                            ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")
                            : "—"}
                    </Text>
                ),
            },
            {
                title: "Thao tác",
                key: "action",
                hideInSearch: true,
                align: "center",
                width: isMobile ? 150 : 180,
                fixed: isMobile ? undefined : "right",
                render: (_, record) => {
                    if (record.isActive) {
                        return (
                            <Button type="default" disabled size="middle">
                                Đang hoạt động
                            </Button>
                        );
                    }

                    return (
                        <Popconfirm
                            title="Kích hoạt kỳ học"
                            description={`Bạn có chắc muốn chuyển sang ${
                                semesterMap[record.semester]?.label ??
                                record.semester
                            } năm ${record.year} không? Hệ thống sẽ kiểm tra ngày kết thúc của kỳ hiện tại trước khi chuyển.`}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            onConfirm={() => handleActivateTerm(record)}
                        >
                            <Button
                                type="primary"
                                icon={<SwapOutlined />}
                                loading={loadingActivateId === record.id}
                                size="middle"
                            >
                                Kích hoạt
                            </Button>
                        </Popconfirm>
                    );
                },
            },
        ];
    }, [isMobile, loadingActivateId]);

    return (
        <>
            <DataTable<ITerm>
                actionRef={actionRef}
                headerTitle={
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 16 }}>
                            Danh sách kỳ học
                        </Text>
                        {!isMobile && (
                            <Text type="secondary">
                                Quản lý thông tin kỳ học và chuyển kỳ đang hoạt
                                động
                            </Text>
                        )}
                    </Space>
                }
                rowKey="id"
                columns={columns}
                scroll={{ x: 980 }}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
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
                    const qs = buildQuery(params, sort, filter);
                    const res = await getTermsAPI(qs);

                    const result: ITerm[] = res?.data?.result ?? [];
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
                    <Button
                        key="reload"
                        icon={<ReloadOutlined />}
                        onClick={() => actionRef.current?.reload()}
                    >
                        Làm mới
                    </Button>,
                    <RenderHeaderTable
                        key="toolbar"
                        showAdd
                        setOpenModal={setModalOpen}
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

            <ModalTerm
                openModal={open}
                setOpenModal={setModalOpen}
                fetchData={() => actionRef.current?.reload()}
            />
        </>
    );
};

export default ListTerm;
