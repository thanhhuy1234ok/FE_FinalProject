import DataTable from "@/components/share/data.table";
import { buildQuery } from "@/helper/buildQuery";
import { callBulkCreateUser, getUserAPI } from "@/services/api";
import { type ProColumns } from "@ant-design/pro-components";
import {
    Badge,
    Dropdown,
    Grid,
    Popconfirm,
    Space,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import { useMemo, useState } from "react";
import "@/styles/user.table.scss";
import dayjs from "dayjs";
import RenderHeaderTable from "@/components/share/header.table";
import UserModal from "./user-modal";
import userHooks from "../_hooks/user.hook";
import {
    DeleteOutlined,
    EditOutlined,
    EllipsisOutlined,
} from "@ant-design/icons";
import { ROLE_MAP } from "@/types/constans";
import UserProfileDrawer from "./user-detail";
import ImportExcelData from "@/components/share/data-import/import.data";
import templateFile from "@/components/share/data-import/template.xlsx?url";
import ButtonComponents from "@/components/share/button";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const UserTable = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { roles, handleDeleteUser, tableRef } = userHooks();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IUserDetail | null>(null);
    const [openModalImport, setOpenModalImport] = useState(false);
    const [dataUpdate, setDataUpdate] = useState<IUserDetail | null>(null);
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

    const handleExportData = () => {
        window.alert("me");
    };

    const columns: ProColumns<IUserDetail>[] = useMemo(
        () => [
            {
                title: "ID",
                key: "index",
                width: 70,
                align: "center",
                render: (_text, _record, index) => <>{index + 1}</>,
                hideInSearch: true,
            },
            {
                title: "Name",
                dataIndex: "name",
                width: isMobile ? 150 : 180,
                ellipsis: true,
                render: (_text, record) => {
                    return (
                        <Text
                            ellipsis={{ tooltip: record.name }}
                            style={{
                                cursor: "pointer",
                                maxWidth: "100%",
                                display: "inline-block",
                            }}
                            onClick={() => {
                                setOpenViewDetail(true);
                                setDataInit(record);
                            }}
                        >
                            {record.name}
                        </Text>
                    );
                },
                sorter: true,
            },
            {
                title: "Email",
                dataIndex: "email",
                width: isMobile ? 180 : 240,
                ellipsis: true,
                sorter: true,
                render: (value) => (
                    <Text
                        ellipsis={{ tooltip: value }}
                        style={{ maxWidth: "100%", display: "inline-block" }}
                    >
                        {value}
                    </Text>
                ),
            },
            {
                title: "Role",
                dataIndex: "role",
                key: "role",
                width: 140,
                onFilter: (value, record) =>
                    record.role?.name !== "ADMIN" &&
                    record.role?.name === value,
                render: (_text, record) => {
                    if (record.role?.name === "ADMIN") return null;

                    const roleKey = record.role?.name ?? "UNKNOWN";
                    const roleLabel = ROLE_MAP[roleKey]?.label ?? roleKey;

                    return (
                        <Tooltip title={roleLabel}>
                            <Text ellipsis style={{ maxWidth: 120 }}>
                                {record.role?.name === "TEACHER" ? (
                                    <Tag color="gold">Giáo viên</Tag>
                                ) : record.role?.name === "STUDENT" ? (
                                    <Tag color="blue">Học sinh</Tag>
                                ) : (
                                    "N/A"
                                )}
                            </Text>
                        </Tooltip>
                    );
                },
                filters:
                    roles
                        ?.filter((r) => r.name !== "ADMIN")
                        .map((r) => ({
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
                width: isMobile ? 130 : 160,
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
                width: 180,
                sorter: true,
                render: (_text, record) => (
                    <Text>
                        {dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")}
                    </Text>
                ),
                hideInSearch: true,
            },
            {
                title: "Detail",
                key: "detail",
                hideInSearch: true,
                align: "center",
                width: isMobile ? 110 : 150,
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
            {
                title: "Actions",
                hideInSearch: true,
                width: 80,
                key: "id",
                align: "center",
                fixed: isTablet ? undefined : "right",
                render: (_value, entity) => {
                    const menuItems = [
                        {
                            key: "edit",
                            label: (
                                <Space>
                                    <EditOutlined />
                                    Chỉnh sửa
                                </Space>
                            ),
                            disabled: !entity.isActive,
                            onClick: () => {
                                setDataUpdate(entity);
                                setOpenModal(true);
                            },
                        },
                        {
                            key: "delete",
                            label: entity.isActive ? (
                                <Popconfirm
                                    title={`Xác nhận xóa người dùng ${entity.email}`}
                                    onConfirm={() =>
                                        handleDeleteUser(entity.id)
                                    }
                                    okText="Xác nhận"
                                    cancelText="Hủy"
                                >
                                    <Space>
                                        <DeleteOutlined
                                            style={{ color: "#ff4d4f" }}
                                        />
                                        Xóa
                                    </Space>
                                </Popconfirm>
                            ) : (
                                <Space
                                    style={{
                                        color: "#bfbfbf",
                                        cursor: "not-allowed",
                                    }}
                                >
                                    <DeleteOutlined />
                                    Xóa
                                </Space>
                            ),
                            disabled: !entity.isActive,
                        },
                    ];

                    return (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                            }}
                        >
                            <Dropdown
                                menu={{ items: menuItems }}
                                trigger={["click"]}
                                placement="bottomRight"
                            >
                                <EllipsisOutlined
                                    style={{
                                        fontSize: 20,
                                        cursor: "pointer",
                                        padding: 6,
                                    }}
                                />
                            </Dropdown>
                        </div>
                    );
                },
            },
        ],
        [roles, isMobile, isTablet, navigate, handleDeleteUser],
    );

    const reloadTable = () => {
        tableRef.current?.reload();
    };

    return (
        <div className="user-page">
            <DataTable<IUserDetail>
                actionRef={tableRef}
                headerTitle="Danh sách người dùng"
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
                                      {range[0]}-{range[1]} trên {total} rows
                                  </div>
                              );
                          },
                }}
                request={async (params, sort, filter) => {
                    const qs = buildQuery(params, sort, filter);
                    const res = await getUserAPI(qs);

                    const result: IUserDetail[] = res?.data?.result ?? [];
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
                        setOpenModalImport={setOpenModalImport}
                        setOpenModal={setOpenModal}
                        showExport
                        showImport
                        showAdd
                    />,
                ]}
                search={{
                    layout: "vertical",
                    defaultCollapsed: false,
                    span: isMobile ? 24 : isTablet ? 12 : 6,
                    labelWidth: 55,
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

            <ImportExcelData<IUserExcel>
                openModalImport={openModalImport}
                setOpenModalImport={setOpenModalImport}
                fetchData={reloadTable}
                headers={["Name", "Email", "Role", "Major", "Class", "Year"]}
                dataMapping={[
                    "name",
                    "email",
                    "role",
                    "major",
                    "class",
                    "yearOfAdmission",
                ]}
                templateFileUrl={templateFile}
                apiFunction={callBulkCreateUser}
                rowKey="email"
                transformData={(rows) =>
                    rows.map((r) => ({ ...r, password: "123456" }))
                }
            />
        </div>
    );
};

export default UserTable;
