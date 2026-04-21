import { useState } from "react";
import type { ProColumns } from "@ant-design/pro-components";
import { message, Tag } from "antd";

import DataTable from "@/components/share/data.table";

import { getSubjectsAPI } from "@/services/api";
import { buildQuery } from "@/helper/buildQuery";
import RenderHeaderTable from "@/components/share/header.table";
import ModalSubject from "./modal";

const SubjectList = () => {
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0,
    });
    const [open, setModalOpen] = useState<boolean>(false);

    const columns: ProColumns<ISubject>[] = [
        {
            title: "STT",
            dataIndex: "id",
            width: 70,
            render: (_, __, index) =>
                (meta.current - 1) * meta.pageSize + index + 1,
            search: false,
        },
        {
            title: "Mã môn",
            dataIndex: "code",
        },
        {
            title: "Tên môn học",
            dataIndex: "name",
        },
        {
            title: "Số tín chỉ",
            dataIndex: "credit",
        },
        {
            title: "Bộ môn",
            dataIndex: ["department", "name"],
        },
    ];

    return (
        <>
            <DataTable<ISubject>
                rowKey="id"
                headerTitle="Danh sách môn học"
                columns={columns}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                }}
                request={async (params) => {
                    const query = buildQuery(params);

                    const res = await getSubjectsAPI(query);

                    if (res?.data) {
                        setMeta(res.data.meta);

                        return {
                            data: res.data.result,
                            success: true,
                            total: res.data.meta.total,
                        };
                    }

                    message.error("Không lấy được danh sách môn học");

                    return {
                        data: [],
                        success: false,
                    };
                }}
                toolBarRender={() => [
                    <RenderHeaderTable showAdd setOpenModal={setModalOpen} />,
                ]}
            />

            <ModalSubject openModal={open} setOpenModal={setModalOpen} />
        </>
    );
};

export default SubjectList;
