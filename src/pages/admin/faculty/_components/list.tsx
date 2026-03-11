import { useMemo, useState } from "react";
import { Button, Grid, Tag, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ProColumns } from "@ant-design/pro-components";
import { getFacultyAPI } from "@/services/api";
import { buildQuery } from "@/helper/buildQuery";
import ModalFacullty from "./modal";
import facultyHook from "../_hooks/hook";
import ButtonComponents from "@/components/share/button";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/share/data.table";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const ListFaculty = () => {
    const { tableRef } = facultyHook();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isTablet = !screens.lg;

    const reloadTable = () => {
        tableRef.current?.reload();
    };

    const columns: ProColumns<IFaculty>[] = useMemo(
        () => [
            {
                title: "STT",
                key: "index",
                width: 70,
                align: "center",
                hideInSearch: true,
                render: (_value, _entity, index) => {
                    return (
                        <>{(meta.current - 1) * meta.pageSize + index + 1}</>
                    );
                },
            },
            {
                title: "Mã khoa",
                dataIndex: "code",
                width: 120,
                copyable: !isMobile,
                search: true,
                ellipsis: true,
                render: (value) => (
                    <Text ellipsis={{ tooltip: value }}>{value || "-"}</Text>
                ),
            },
            {
                title: "Tên khoa",
                dataIndex: "name",
                width: isMobile ? 180 : 240,
                ellipsis: true,
                search: true,
                render: (value) => (
                    <Text ellipsis={{ tooltip: value }}>{value || "-"}</Text>
                ),
            },
            {
                title: "Trạng thái",
                dataIndex: "isActive",
                width: 140,
                valueEnum: {
                    true: { text: "Active", status: "Success" },
                    false: { text: "Inactive", status: "Default" },
                },
                render: (_, record) =>
                    record.isActive ? (
                        <Tag color="green">Đang hoạt động</Tag>
                    ) : (
                        <Tag>Ngưng hoạt động</Tag>
                    ),
                search: false,
            },
            {
                title: "Created At",
                dataIndex: "createdAt",
                width: 180,
                valueType: "dateTime",
                search: false,
                hideInTable: isMobile,
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
        [isMobile, isTablet, meta.current, meta.pageSize, navigate],
    );

    return (
        <>
            <DataTable<IFaculty>
                rowKey="id"
                columns={columns}
                actionRef={tableRef}
                scroll={{ x: 900 }}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    simple: isMobile,
                    showTotal: isMobile
                        ? undefined
                        : (total, range) =>
                              `${range[0]}-${range[1]} trên ${total} dòng`,
                }}
                request={async (params, sort, filter) => {
                    const qs = buildQuery(params, sort, filter);
                    const res = await getFacultyAPI(qs);

                    const result: IFaculty[] = res?.data?.result ?? [];
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
                headerTitle="Danh sách khoa"
                search={{
                    layout: "vertical",
                    defaultCollapsed: false,
                    span: isMobile ? 24 : isTablet ? 12 : 6,
                    labelWidth: 90,
                }}
                toolBarRender={() => [
                    <Button
                        key="create"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setOpenModal(true)}
                    >
                        {isMobile ? "Thêm" : "Create Faculty"}
                    </Button>,
                ]}
            />

            <ModalFacullty
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
            />
        </>
    );
};

export default ListFaculty;
