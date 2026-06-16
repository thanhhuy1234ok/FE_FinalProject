import DataTable from "@/components/share/data.table";
import { buildQuery } from "@/helper/buildQuery";
import { callBulkCreateUser, getUserAPI } from "@/services/api";
import { type ProColumns } from "@ant-design/pro-components";
import {
    Badge,
    Dropdown,
    Grid,
    Space,
    Tag,
    Tooltip,
    Typography,
    Button,
} from "antd";
import { useMemo, useState } from "react";
import "@/styles/user.table.scss";
import dayjs from "dayjs";
import RenderHeaderTable from "@/components/share/header.table";
import UserModal from "./user-modal";
import userHooks from "../_hooks/user.hook";
import {
    EditOutlined,
    EllipsisOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { ROLE_MAP } from "@/types/constans";
import ImportExcelData from "@/components/share/data-import/import.data";
import templateFile from "@/components/share/data-import/template.xlsx?url";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const UserTable = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { roles, handleDeleteUser, tableRef } = userHooks();
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
                title: "STT",
                dataIndex: "id",
                width: 70,
                align: "center",
                search: false,
                render: (_, __, index) =>
                    (meta.current - 1) * meta.pageSize + index + 1,
            },
            {
                title: "Name",
                dataIndex: "name",
                width: isMobile ? 150 : 190,
                ellipsis: true,
                sorter: true,
                render: (_text, record) => (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            minHeight: 36,
                        }}
                    >
                        <Text
                            ellipsis={{ tooltip: record.name }}
                            style={{
                                maxWidth: "100%",
                                display: "inline-block",
                                fontWeight: 500,
                            }}
                        >
                            {record.name}
                        </Text>
                    </div>
                ),
            },
            {
                title: "Email",
                dataIndex: "email",
                width: isMobile ? 180 : 240,
                ellipsis: true,
                sorter: true,
                render: (value) => (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            minHeight: 36,
                        }}
                    >
                        <Text
                            ellipsis={{ tooltip: value }}
                            style={{
                                maxWidth: "100%",
                                display: "inline-block",
                                color: "#595959",
                            }}
                        >
                            {value}
                        </Text>
                    </div>
                ),
            },
            {
                title: "Role",
                dataIndex: ["role", "name"],
                key: "role.name",
                width: 140,
                align: "center",
                filters:
                    roles
                        ?.filter((r) => r.name !== "ADMIN")
                        .map((r) => ({
                            text: ROLE_MAP[r.name]?.label ?? r.name,
                            value: r.name,
                        })) ?? [],
                filterMultiple: false,
                filterSearch: true,
                hideInSearch: true,
                render: (_text, record) => {
                    if (record.role?.name === "ADMIN") return null;

                    const roleKey = record.role?.name ?? "UNKNOWN";
                    const roleLabel = ROLE_MAP[roleKey]?.label ?? roleKey;

                    return (
                        <Tooltip title={roleLabel}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minHeight: 36,
                                }}
                            >
                                {record.role?.name === "TEACHER" ? (
                                    <Tag
                                        color="gold"
                                        style={{ marginInlineEnd: 0 }}
                                    >
                                        Giáo viên
                                    </Tag>
                                ) : record.role?.name === "STUDENT" ? (
                                    <Tag
                                        color="blue"
                                        style={{ marginInlineEnd: 0 }}
                                    >
                                        Học sinh
                                    </Tag>
                                ) : (
                                    <Text type="secondary">N/A</Text>
                                )}
                            </div>
                        </Tooltip>
                    );
                },
            },
            {
                title: "Status",
                dataIndex: "isActive",
                key: "isActive",
                width: isMobile ? 130 : 160,
                align: "center",
                filters: [
                    { text: "Đang hoạt động", value: true },
                    { text: "Đã khóa", value: false },
                ],
                filterMultiple: false,
                onFilter: (value, record) => record.isActive === value,
                hideInSearch: true,
                render: (_, record) => (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: 36,
                        }}
                    >
                        {record.isActive ? (
                            <Tag color="success" style={{ marginInlineEnd: 0 }}>
                                <Badge status="success" text="Đang hoạt động" />
                            </Tag>
                        ) : (
                            <Tag color="default" style={{ marginInlineEnd: 0 }}>
                                <Badge status="default" text="Đã khóa" />
                            </Tag>
                        )}
                    </div>
                ),
            },
            {
                title: "Bộ môn",
                key: "deparment",
                hideInSearch: true,
                dataIndex: "deparment",
                align: "center",
                width: isMobile ? 110 : 150,
                fixed: isTablet ? undefined : "right",
                // render: () => <Text type="secondary">{re}</Text>,
                render: (_, record) => (
                    <Text type="secondary">
                        {record.teacher?.department?.name ?? "-"}
                    </Text>
                ),
            },
            {
                title: "CreatedAt",
                dataIndex: "createdAt",
                width: 170,
                sorter: true,
                hideInSearch: true,
                render: (_text, record) => (
                    <Text style={{ whiteSpace: "nowrap" }}>
                        {dayjs(record.createdAt).format("DD-MM-YYYY HH:mm")}
                    </Text>
                ),
            },
            {
                title: "Actions",
                hideInSearch: true,
                width: 90,
                key: "id",
                align: "center",
                fixed: isTablet ? undefined : "right",
                render: (_value, entity) => {
                    const menuItems = [
                        {
                            key: "edit",
                            label: (
                                <Space size={8}>
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
                            key: "detail",
                            label: (
                                <Space size={8}>
                                    <UserOutlined />
                                    Xem chi tiết
                                </Space>
                            ),
                            disabled: !entity.isActive,
                            onClick: () => {
                                navigate(`${entity.id}`);
                            },
                        },
                    ];

                    return (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 36,
                            }}
                        >
                            <Dropdown
                                menu={{ items: menuItems }}
                                trigger={["click"]}
                                placement="bottomRight"
                            >
                                <Button
                                    type="text"
                                    shape="circle"
                                    icon={
                                        <EllipsisOutlined
                                            style={{ fontSize: 18 }}
                                        />
                                    }
                                />
                            </Dropdown>
                        </div>
                    );
                },
            },
        ],
        [
            roles,
            isMobile,
            isTablet,
            navigate,
            handleDeleteUser,
            meta.current,
            meta.pageSize,
        ],
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

            <ImportExcelData<IStudentExcel>
                openModalImport={openModalImport}
                setOpenModalImport={setOpenModalImport}
                fetchData={reloadTable}
                headers={[
                    "Tên sinh viên",
                    "Email",
                    "Giới tính",
                    "Số điện thoại",
                    "Chuyên ngành",
                    "Năm nhập học",
                    "Lớp học",
                ]}
                dataMapping={[
                    "name",
                    "email",
                    "gender",
                    "phone",
                    "majorName",
                    "yearAdmission",
                    "className",
                ]}
                templateFileUrl={templateFile}
                apiFunction={callBulkCreateUser}
                rowKey="email"
                transformData={(rows) =>
                    rows.map((r) => ({
                        ...r,
                        password: "123456",
                        yearAdmission: Number(r.yearAdmission),
                    }))
                }
            />
        </div>
    );
};

export default UserTable;
