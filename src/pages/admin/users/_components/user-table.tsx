import DataTable from "@/components/share/data.table";
import { buildQuery } from "@/helper/buildQuery";
import { getUserAPI } from "@/services/api";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { Badge, Tag, Tooltip, Typography } from "antd";
import { useRef, useState } from "react";
import '@/styles/user.table.scss'
import dayjs from "dayjs";
import RenderHeaderTable from "@/components/share/header.table";
import UserModal from "./user-modal";

const { Text } = Typography;


const UserTable = () => {
    const tableRef = useRef<ActionType | null>(null);
    const [openModal, setOpenModal] = useState<boolean>(false);
    // const [openModalImport, setOpenModalImport] = useState(false);
    const [dataUpdate, setDataUpdate] = useState<IUserTable | null>(null);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    const handleExportData = () => {
        window.alert("me")
    }


    const columns: ProColumns<IUserTable>[] = [
        {
            title: "Id",
            dataIndex: "id",
            hideInSearch: true,
            width: 180,
            ellipsis: true,
            render: (_, record) => {
                const id = record?.id ?? "";
                return (
                    <Tooltip title={id}>
                        <Text
                            copyable={{ text: id as string }}
                            style={{ maxWidth: 160 }}
                            ellipsis
                        >
                            {id}
                        </Text>
                    </Tooltip>
                );
            },
            sorter: true
        },
        {
            title: "Name",
            dataIndex: "name",
            sorter: true, // ✅ sort.name
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: true, // (nếu backend bạn support sort email thì thêm vào buildQuery)
        },
        {
            title: "Status",
            dataIndex: "isActive",
            render: (_text, record) => {
                return (
                    <>
                        <Tag color="success"><Badge status="success" /> {record.isActive ? "Đang hoạt động" : "oFF"}</Tag>
                    </>
                )
            }
        },
        {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (_text, record) => {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
            hideInSearch: true,
        },

    ];

    const reloadTable = () => {
        tableRef.current?.reload();
    }

    return (
        <div className="user-page">
            <DataTable<IUserTable>
                actionRef={tableRef}
                headerTitle="Danh sách người dùng"
                rowKey="id"
                columns={columns}
                scroll={{ x: true }}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    showTotal: (total, range) => (
                        <div>
                            {range[0]}-{range[1]} trên {total} rows
                        </div>
                    ),
                }}
                request={async (params, sort, filter) => {
                    // ✅ build query = params + sort + filter
                    const qs = buildQuery(params, sort, filter);

                    const res = await getUserAPI(qs);

                    const result: IUserTable[] = res?.data?.result ?? [];
                    const nextMeta =
                        res?.data?.meta ?? ({
                            current: params.current ?? 1,
                            pageSize: params.pageSize ?? 10,
                            pages: 0,
                            total: result.length,
                        });

                    setMeta(nextMeta);

                    return {
                        data: result,
                        success: true,
                        total: nextMeta.total ?? result.length,
                    };
                }}
                toolBarRender={() => [
                    <RenderHeaderTable
                        key="toolbar"
                        handleExportData={handleExportData}
                        // setOpenModalImport={setOpenModalImport}
                        setOpenModal={setOpenModal}
                        showExport
                        showImport
                        showAdd
                    />,
                ]}

                search={{
                    layout: 'vertical',
                    defaultCollapsed: false,
                    span: 6,          // giảm độ rộng mỗi field để đỡ loãng
                    labelWidth: 55,   // label gọn

                }}
            />

            <UserModal
                dataUpdate={dataUpdate}
                openModal={openModal}
                refreshTable={reloadTable}
                setOpenModal={setOpenModal}
                setDataUpdate={setDataUpdate}
            />
        </div>

    );
};

export default UserTable;
