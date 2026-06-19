import DataTable from "@/components/share/data.table";
import departmentHook from "../_hooks/department.hook";
import type { ProColumns } from "@ant-design/pro-components";
import { getDepartmentsAPI } from "@/services/api";
import { buildQuery } from "@/helper/buildQuery";
import { useState } from "react";
import RenderHeaderTable from "@/components/share/header.table";
import ButtonComponents from "@/components/share/button";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import ModalDepartment from "./modal/modal-department";

const ListDepartment = () => {
    const { tableRef } = departmentHook();
    const [openModal, setOpenModal] = useState(false);

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });

    const navigate = useNavigate();

    const reloadTable = () => {
        tableRef.current?.reload();
    };

    const columns: ProColumns<IDepartment>[] = [
        {
            title: "STT",
            dataIndex: "id",
            width: 70,
            search: false,
            render: (_, __, index) =>
                (meta.current - 1) * meta.pageSize + index + 1,
        },
        {
            key: "name",
            title: "Tên bộ môn",
            dataIndex: "name",
            valueType: "text",
            fieldProps: {
                placeholder: "Nhập tên bộ môn",
            },
        },
        {
            key: "code",
            title: "Mã bộ môn",
            dataIndex: "code",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            width: 200,
            sorter: true,
            hideInSearch: true,
            render: (_, record) =>
                dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss"),
        },
        {
            title: "Thao tác",
            hideInSearch: true,
            align: "center",
            width: 180,
            render: (_, entity) => (
                <ButtonComponents
                    title="Xem chi tiết"
                    onClick={() =>
                        navigate(`/manage-curriculum/department/${entity.id}`)
                    }
                />
            ),
        },
    ];

    return (
        <>
            <DataTable<IDepartment>
                actionRef={tableRef}
                headerTitle="Danh sách bộ môn"
                rowKey="id"
                columns={columns}
                scroll={{ x: true }}
                options={false}
                pagination={{
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    showTotal: (total, range) => (
                        <div>
                            {range[0]}-{range[1]} trên {total} bộ môn
                        </div>
                    ),
                }}
                request={async (params, sort, filter) => {
                    const current = Number(params.current ?? 1);
                    const pageSize = Number(params.pageSize ?? 10);

                    const qs = buildQuery(
                        {
                            ...params,
                            current,
                            pageSize,
                        },
                        sort,
                        filter,
                    );

                    const res = await getDepartmentsAPI(qs);

                    const result: IDepartment[] = res?.data?.result ?? [];

                    const nextMeta = res?.data?.meta ?? {
                        current,
                        pageSize,
                        pages: 0,
                        total: result.length,
                    };

                    setMeta({
                        current: Number(nextMeta.current ?? current),
                        pageSize: Number(nextMeta.pageSize ?? pageSize),
                        pages: Number(nextMeta.pages ?? 0),
                        total: Number(nextMeta.total ?? result.length),
                    });

                    return {
                        data: result,
                        success: true,
                        total: Number(nextMeta.total ?? result.length),
                    };
                }}
                search={{
                    layout: "vertical",
                    defaultCollapsed: false,
                    span: 6,
                    labelWidth: 80,
                }}
                toolBarRender={() => [
                    <RenderHeaderTable
                        key="add"
                        showAdd
                        setOpenModal={setOpenModal}
                    />,
                ]}
            />

            <ModalDepartment
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
            />
        </>
    );
};

export default ListDepartment;
