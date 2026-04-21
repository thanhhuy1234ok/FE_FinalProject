import DataTable from "@/components/share/data.table";

import { buildQuery } from "@/helper/buildQuery";
import { getRoomsAPI } from "@/services/api";
import { type ActionType, type ProColumns } from "@ant-design/pro-components";
import { Badge, Button, Grid, Space, Typography } from "antd";
import { useMemo, useRef, useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import RenderHeaderTable from "@/components/share/header.table";
import ModalRoom from "./modal";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const ListRoom = () => {
    const tableRef = useRef<ActionType>();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isTablet = !!screens.md && !screens.lg;

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    const [openModal, setOpenModal] = useState(false);
    const [dataUpdate, setDataUpdate] = useState<IRoom | null>(null);

    const columns: ProColumns<IRoom>[] = useMemo(() => {
        return [
            {
                title: "ID",
                dataIndex: "id",
                width: 80,
                hideInSearch: true,
            },
            {
                title: "Tên phòng",
                dataIndex: "name",
                width: 180,
            },
            {
                title: "Mã phòng",
                dataIndex: "code",
                width: 150,
            },
            {
                title: "Tòa nhà",
                key: "building",
                hideInSearch: true,
                width: 180,
                render: (_, record) => (
                    <Text type="secondary">{record.building.name}</Text>
                ),
            },
            {
                title: "Sức chứa",
                dataIndex: "capacity",
                width: 120,
                hideInSearch: true,
            },
            {
                title: "Trạng thái",
                dataIndex: "isActive",
                width: 120,
                align: "center",
                filters: true,
                valueEnum: {
                    true: { text: "Hoạt động", status: "Success" },
                    false: { text: "Ngừng", status: "Default" },
                },
                render: (_, record) =>
                    record.isActive ? (
                        <Badge status="success" text="Hoạt động" />
                    ) : (
                        <Badge status="default" text="Ngừng" />
                    ),
            },
            {
                title: "Hành động",
                key: "action",
                hideInSearch: true,
                width: 120,
                fixed: isTablet ? undefined : "right",
                render: (_, record) => (
                    <Space>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setDataUpdate(record);
                                setOpenModal(true);
                            }}
                        />
                    </Space>
                ),
            },
        ];
    }, [isTablet]);

    return (
        <>
            <DataTable<IRoom>
                actionRef={tableRef}
                headerTitle={"Danh sách phòng học"}
                rowKey="id"
                columns={columns}
                scroll={{ x: 1000 }}
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
                                  {range[0]}-{range[1]} trên {total} rows
                              </div>
                          ),
                }}
                request={async (params, sort, filter) => {
                    const qs = buildQuery(params, sort, filter);
                    const res = await getRoomsAPI(qs);

                    const result: IRoom[] = res?.data?.result ?? [];
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
                    };
                }}
                toolBarRender={() => [
                    <RenderHeaderTable
                        key="toolbar"
                        setOpenModal={setOpenModal}
                        showAdd
                    />,
                ]}
            />

            <ModalRoom
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={() => tableRef.current?.reload()}
            />
        </>
    );
};

export default ListRoom;
