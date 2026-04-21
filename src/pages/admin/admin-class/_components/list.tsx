import { useMemo, useRef, useState } from "react";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { Badge, Button, Dropdown, Grid, Space, Tag, Typography } from "antd";
import { EyeOutlined, MoreOutlined } from "@ant-design/icons";

import DataTable from "@/components/share/data.table";
import RenderHeaderTable from "@/components/share/header.table";
import { buildQuery } from "@/helper/buildQuery";
import { getAdminClassAPI } from "@/services/api";
import ModalAdminClass from "./ModalAdminClass";
import { useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface IMajor {
    id: number;
    name: string;
    code?: string;
}

interface IYearOfAdmission {
    id: number;
    name?: string;
    year: number;
}

type AdminClassStatus = "PENDING" | "STUDYING" | "GRADUATED";

export interface IAdminClass {
    id: number;
    code: string;
    name: string;
    capacity?: number;
    currentStudentCount?: number;
    status: AdminClassStatus;
    createdAt?: string;
    updatedAt?: string;
    major?: IMajor | null;
    major_id?: number;
    yearOfAdmission?: IYearOfAdmission | null;
    yearOfAdmissionId?: number;
}

interface IMeta {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
}

const adminClassStatusMap: Record<
    AdminClassStatus,
    {
        text: string;
        status: "default" | "processing" | "success";
    }
> = {
    PENDING: {
        text: "Chờ mở lớp",
        status: "default",
    },
    STUDYING: {
        text: "Đang học",
        status: "processing",
    },
    GRADUATED: {
        text: "Đã tốt nghiệp",
        status: "success",
    },
};

const ListAdminClass = () => {
    const tableRef = useRef<ActionType>();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const navigate = useNavigate();

    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState<IAdminClass | null>(null);
    const [meta, setMeta] = useState<IMeta>({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    const columns: ProColumns<IAdminClass>[] = useMemo(
        () => [
            {
                title: "ID",
                dataIndex: "id",
                width: 70,
                hideInSearch: true,
                align: "center",
            },
            {
                title: "Mã lớp",
                dataIndex: "code",
                width: 130,
                render: (_, record) => <Tag color="blue">{record.code}</Tag>,
            },
            {
                title: "Tên lớp",
                dataIndex: "name",
                ellipsis: true,
                render: (_, record) => <Text strong>{record.name}</Text>,
            },
            {
                title: "Chuyên ngành",
                dataIndex: ["major", "name"],
                hideInSearch: true,
                render: (_, record) =>
                    record.major ? (
                        <Space direction="vertical" size={0}>
                            <Text>{record.major.name}</Text>
                            {record.major.code ? (
                                <Text type="secondary">
                                    {record.major.code}
                                </Text>
                            ) : null}
                        </Space>
                    ) : (
                        "—"
                    ),
            },
            {
                title: "Năm nhập học",
                dataIndex: "yearOfAdmissionId",
                width: 130,
                align: "center",
                valueType: "select",
                render: (_, record) => record.yearOfAdmission?.year ?? "—",
            },
            {
                title: "Sĩ số",
                dataIndex: "currentStudentCount",
                width: 140,
                align: "center",
                hideInSearch: true,
                render: (_, record) => {
                    const current = record.currentStudentCount ?? 0;
                    const capacity = record.capacity ?? 0;

                    return (
                        <Text>
                            {current} / {capacity}
                        </Text>
                    );
                },
            },
            {
                title: "Trạng thái",
                dataIndex: "status",
                width: 150,
                align: "center",
                valueType: "select",
                valueEnum: {
                    PENDING: { text: "Chờ mở lớp" },
                    STUDYING: { text: "Đang học" },
                    GRADUATED: { text: "Đã tốt nghiệp" },
                },
                render: (_, record) => {
                    const config =
                        adminClassStatusMap[record.status] ??
                        adminClassStatusMap.PENDING;

                    return <Badge status={config.status} text={config.text} />;
                },
            },
            {
                title: "Ngày tạo",
                dataIndex: "createdAt",
                width: 160,
                hideInSearch: true,
                valueType: "dateTime",
            },
            {
                title: "Hành động",
                valueType: "option",
                width: 90,
                fixed: "right",
                align: "center",
                render: (_, record) => {
                    const items: MenuProps["items"] = [
                        {
                            key: "view",
                            label: "Xem chi tiết",
                            icon: <EyeOutlined />,
                            onClick: () => navigate(`${record.id}`),
                        },
                    ];

                    return (
                        <Dropdown menu={{ items }} trigger={["click"]}>
                            <Button type="text" icon={<MoreOutlined />} />
                        </Dropdown>
                    );
                },
            },
        ],
        [navigate],
    );

    return (
        <>
            <DataTable<IAdminClass>
                actionRef={tableRef}
                headerTitle="Danh sách lớp hành chính"
                rowKey="id"
                columns={columns}
                scroll={{ x: 1200 }}
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
                                  {range[0]}-{range[1]} trên {total} lớp
                              </div>
                          ),
                }}
                request={async (params, sort, filter) => {
                    const qs = buildQuery(params, sort, filter);
                    const res = await getAdminClassAPI(qs);

                    const result: IAdminClass[] = res?.data?.result ?? [];
                    const nextMeta = res?.data?.meta ?? {
                        current: params.current ?? 1,
                        pageSize: params.pageSize ?? 10,
                        pages: 0,
                        total: 0,
                    };

                    setMeta(nextMeta);

                    return {
                        data: result,
                        success: true,
                        total: nextMeta.total,
                    };
                }}
                toolBarRender={() => [
                    <RenderHeaderTable
                        key="add-admin-class"
                        showAdd
                        setOpenModal={() => {
                            setDataInit(null);
                            setOpenModal(true);
                        }}
                    />,
                ]}
            />

            <ModalAdminClass
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchData={() => tableRef.current?.reload()}
            />
        </>
    );
};

export default ListAdminClass;
