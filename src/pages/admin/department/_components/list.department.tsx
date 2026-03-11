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
    const [openModalImport, setOpenModalImport] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0,
    });
    const navigate = useNavigate();
    const handleExportData = () => {
        window.alert("me");
    };
    const reloadTable = () => {
        tableRef.current?.reload();
    };
    const columns: ProColumns<IDepartment>[] = [
        {
            title: "ID",
            render: (_text, _record, index) => {
                return <>{index + 1}</>;
            },
            hideInSearch: true,
        },
        {
            key: "name",
            title: "name",
            dataIndex: "name",
        },
        {
            key: "code",
            dataIndex: "code",
            title: "code",
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
            title: "Detail",
            hideInSearch: true,
            align: "center",
            render: (_value, entity) => {
                return (
                    <>
                        <ButtonComponents
                            title="Xem chi tiết bộ môn"
                            key={entity.id}
                            onClick={() => navigate(`${entity.id}`)}
                        />
                    </>
                );
            },
        },
    ];
    return (
        <>
            <DataTable<IDepartment>
                actionRef={tableRef}
                headerTitle="Danh sách Bộ môn"
                rowKey="id"
                columns={columns}
                scroll={{ x: true }}
                options={false}
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
                    const res = await getDepartmentsAPI(qs);

                    const result: IDepartment[] = res?.data?.result ?? [];
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
                search={{
                    layout: "vertical",
                    defaultCollapsed: false,
                    span: 6, // giảm độ rộng mỗi field để đỡ loãng
                    labelWidth: 55, // label gọn
                }}
                toolBarRender={() => [
                    <RenderHeaderTable showAdd setOpenModal={setOpenModal} />,
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
