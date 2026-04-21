import ButtonComponents from "@/components/share/button";
import DataTable from "@/components/share/data.table";
import RenderHeaderTable from "@/components/share/header.table";
import { buildQuery } from "@/helper/buildQuery";
import { getCampusAPI } from "@/services/api";
import { PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { Space } from "antd";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/user.table.scss";

const TableCampusBuildingRoom = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openModalImport, setOpenModalImport] = useState(false);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<ICampus | null>(null);
    const navigate = useNavigate();
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0,
    });

    const handleViewDetail = (id: number) => {
        navigate(`${id}/buildings`);
    };
    const columns: ProColumns<ICampus>[] = [
        {
            title: "Id",
            dataIndex: "id",
            key: "id",
            width: 250,
            render: (_text, record, _index, _action) => {
                return <span>{record.id}</span>;
            },
            hideInSearch: true,
        },
        {
            title: "Tên cơ sở",
            dataIndex: "name",
            render: (_text, record, _index, _action) => {
                return (
                    <a
                        href="#"
                        onClick={() => {
                            setOpenViewDetail(true);
                            setDataUpdate(record);
                        }}
                    >
                        {record.name}
                    </a>
                );
            },
        },
        {
            title: "Vị trí",
            dataIndex: "address",
            hideInSearch: true,
        },
        {
            title: "Actions",
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <ButtonComponents
                        icon={<PlusOutlined />}
                        onClick={() => {
                            console.log(entity.id);
                            handleViewDetail(+entity.id);
                        }}
                        title="Xem chi tiết cơ sở"
                        isVisible={true}
                    />
                </Space>
            ),
        },
    ];

    const tableRef = useRef<ActionType>();
    return (
        <div className="user-page">
            <DataTable<ICampus>
                actionRef={tableRef}
                headerTitle="Danh sách Campus"
                rowKey="id"
                columns={columns}
                request={async (params, sort, filter) => {
                    // ✅ build query = params + sort + filter
                    const qs = buildQuery(params, sort, filter);
                    const res = await getCampusAPI(qs);

                    const result: ICampus[] = res?.data?.result ?? [];
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
                scroll={{ x: true }}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    showTotal: (total, range) => {
                        return (
                            <div>
                                {" "}
                                {range[0]}-{range[1]} trên {total} rows
                            </div>
                        );
                    },
                }}
                rowSelection={false}
                toolBarRender={() => [
                    <RenderHeaderTable
                        key="toolbar"
                        setOpenModalImport={setOpenModalImport}
                        setOpenModal={setOpenModal}
                        showExport
                        showImport
                        showAdd
                    />,
                ]}
            />
        </div>
    );
};

export default TableCampusBuildingRoom;
