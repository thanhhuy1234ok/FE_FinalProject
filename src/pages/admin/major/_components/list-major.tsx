import { useRef, useState } from "react";
import {
    PageContainer,
    type ActionType,
    type ProColumns,
} from "@ant-design/pro-components";
import { Tag, Space, Button } from "antd";

import DataTable from "@/components/share/data.table";
import { getMajorsAPI } from "@/services/api";
import { buildQuery } from "@/helper/buildQuery";
import ButtonComponents from "@/components/share/button";
import RenderHeaderTable from "@/components/share/header.table";
import ModalMajor from "./modal";
import { useNavigate } from "react-router-dom";

const ListMajor = () => {
    const tableRef = useRef<ActionType>();
    const [open, setOpenModal] = useState<boolean>(false);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });
    const navigate = useNavigate();
    const columns: ProColumns<IMajor>[] = [
        {
            title: "STT",
            dataIndex: "id",
            width: 70,
            render: (_, __, index) =>
                (meta.current - 1) * meta.pageSize + index + 1,
            search: false,
        },
        {
            title: "Tên chuyên ngành",
            dataIndex: "name",
            sorter: true,
        },
        {
            title: "Code",
            dataIndex: "code",
            width: 120,
        },
        {
            title: "Bộ môn",
            dataIndex: ["department", "name"],
            search: false,
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            width: 120,
            render: (_, record) =>
                record.isActive ? (
                    <Tag color="green">Active</Tag>
                ) : (
                    <Tag color="red">Inactive</Tag>
                ),

            search: false,
        },
        {
            title: "Action",
            width: 160,
            render: (_, record) => {
                return (
                    <Space>
                        <ButtonComponents
                            title="Xem chi tiết"
                            onClick={() => {
                                navigate(`${+record.id}`);
                            }}
                        />
                    </Space>
                );
            },
            search: false,
        },
    ];

    return (
        <>
            <DataTable<IMajor>
                actionRef={tableRef}
                headerTitle="Danh sách chuyên ngành"
                rowKey="id"
                columns={columns}
                request={async (params, sort, filter) => {
                    const qs = buildQuery(params, sort, filter);

                    const res = await getMajorsAPI(qs);

                    return {
                        data: res?.data?.result ?? [],
                        success: true,
                        total: res?.data?.meta?.total ?? 0,
                    };
                }}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    // simple: isMobile,
                    // showTotal: isMobile
                    //     ? undefined
                    //     : (total, range) => {
                    //           return (
                    //               <div>
                    //                   {range[0]}-{range[1]} trên {total} rows
                    //               </div>
                    //           );
                    //       },
                }}
                toolBarRender={() => [
                    <RenderHeaderTable showAdd setOpenModal={setOpenModal} />,
                ]}
            />

            <ModalMajor
                openModal={open}
                setOpenModal={setOpenModal}
                reloadTable={() => tableRef.current?.reload()}
            />
        </>
    );
};

export default ListMajor;
