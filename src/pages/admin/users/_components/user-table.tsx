import DataTable from "@/components/share/data.table";
import { buildQuery } from "@/helper/buildQuery";
import { getUserAPI } from "@/services/api";
import { type ProColumns } from "@ant-design/pro-components";
import { Badge, Popconfirm, Space, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";
import "@/styles/user.table.scss";
import dayjs from "dayjs";
import RenderHeaderTable from "@/components/share/header.table";
import UserModal from "./user-modal";
import userHooks from "../_hooks/user.hook";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ROLE_MAP } from "@/types/constans";
import UserProfileDrawer from "./user-detail";

const { Text } = Typography;

const UserTable = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { roles, handleDeleteUser, isDeleteUser, tableRef } = userHooks();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IUserTable | null>(null);
    // const [openModalImport, setOpenModalImport] = useState(false);
    const [dataUpdate, setDataUpdate] = useState<IUserTable | null>(null);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    const handleExportData = () => {
        window.alert("me");
    };

    const columns: ProColumns<IUserTable>[] = [
        {
            title: "ID",
            render: (_text, _record, index) => {
                return <>{index + 1}</>;
            },
            hideInSearch: true,
        },
        {
            title: "Name",
            dataIndex: "name",
            render: (_text, record, _index, _action) => {
                return (
                    <span
                        style={{
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            setOpenViewDetail(true);
                            setDataInit(record);
                        }}
                    >
                        {record.name}
                    </span>
                );
            },
            sorter: true, // ✅ sort.name
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: true, // (nếu backend bạn support sort email thì thêm vào buildQuery)
        },
        {
            title: "Role",
            dataIndex: "role", // 🔥 quan trọng: để filter key = "role"
            key: "role", // 🔥 quan trọng: ổn định key
            onFilter: (value, record) => record.role?.name === value,
            render: (_text, record) => (
                <Tooltip title={ROLE_MAP[record.role?.name ?? "UNKNOWN"].label}>
                    <Text ellipsis style={{ maxWidth: 150 }}>
                        {record.role?.name === "TEACHER" ? (
                            <Tag color="gold">Giáo viên</Tag>
                        ) : record.role?.name === "STUDENT" ? (
                            <Tag color="blue">Học sinh</Tag>
                        ) : record.role?.name === "ADMIN" ? (
                            <Tag color="red">Quản trị viên</Tag>
                        ) : (
                            "N/A"
                        )}
                    </Text>
                </Tooltip>
            ),
            filters:
                roles?.map((r) => ({
                    text: r.name,
                    value: r.name,
                })) ?? [],
            filterMultiple: false,
            filterSearch: true,
            hideInSearch: true,
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            filters: [
                { text: "Đang hoạt động", value: true },
                { text: "Đã khóa", value: false },
            ],
            filterMultiple: false,
            onFilter: (value, record) => record.isActive === value,
            render: (_, record) =>
                record.isActive ? (
                    <Tag color="success">
                        <Badge status="success" text="Đang hoạt động" />
                    </Tag>
                ) : (
                    <Tag color="default">
                        <Badge status="default" text="Đã khóa" />
                    </Tag>
                ),
            hideInSearch: true,
        },
        {
            title: "CreatedAt",
            dataIndex: "createdAt",
            width: 200,
            sorter: true,
            render: (_text, record) => {
                return (
                    <>{dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")}</>
                );
            },
            hideInSearch: true,
        },
        {
            title: "Actions",
            hideInSearch: true,
            width: 50,
            key: "id",
            render: (_value, entity, _index, _action) => (
                <Space>
                    {/* <Access
                        permission={ALL_PERMISSIONS.ROLES.UPDATE}
                        hideChildren
                    >
                        
                    </Access> */}
                    <EditOutlined
                        style={{
                            color: entity.isActive ? "#ffa500" : "#bfbfbf",
                            cursor: entity.isActive ? "pointer" : "not-allowed",
                            opacity: entity.isActive ? 1 : 0.6,
                        }}
                        type=""
                        onClick={async () => {
                            if (entity.isActive) {
                                setDataUpdate(entity);
                                setOpenModal(true);
                            }
                            return;
                        }}
                    />
                    {/* <Access
                        permission={ALL_PERMISSIONS.ROLES.DELETE}
                        hideChildren
                    >
                        
                    </Access> */}
                    {entity.isActive ? (
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa user"}
                            description={"Bạn có chắc chắn muốn xóa user này ?"}
                            onConfirm={() => handleDeleteUser(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{
                                loading: isDeleteUser,
                            }}
                        >
                            <span
                                style={{
                                    cursor: "pointer",
                                    margin: "0 10px",
                                }}
                            >
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: "#ff4d4f",
                                    }}
                                />
                            </span>
                        </Popconfirm>
                    ) : (
                        <DeleteOutlined
                            style={{
                                fontSize: 20,
                                color: "#bfbfbf",
                                cursor: "not-allowed",
                                opacity: 0.6,
                                margin: "0 10px",
                            }}
                        />
                    )}
                </Space>
            ),
        },
    ];

    const reloadTable = () => {
        tableRef.current?.reload();
    };

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
                    layout: "vertical",
                    defaultCollapsed: false,
                    span: 6, // giảm độ rộng mỗi field để đỡ loãng
                    labelWidth: 55, // label gọn
                }}
            />

            <UserModal
                dataUpdate={dataUpdate}
                openModal={openModal}
                refreshTable={reloadTable}
                setOpenModal={setOpenModal}
                setDataUpdate={setDataUpdate}
            />
            <UserProfileDrawer
                open={openViewDetail}
                setOpen={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
};

export default UserTable;
