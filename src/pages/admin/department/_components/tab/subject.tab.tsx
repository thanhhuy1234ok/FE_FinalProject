import { getSubjectsAPI } from "@/services/api";
import DataTable from "@/components/share/data.table";
import type { ProColumns } from "@ant-design/pro-components";
import { Empty, Tag, message } from "antd";
import { useEffect, useState } from "react";

interface IProps {
    departmentId: number;
    active: boolean;
}

const SubjectTab = ({ departmentId, active }: IProps) => {
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<ISubject[]>([]);

    const fetchSubjects = async () => {
        if (!departmentId) return;

        try {
            setLoading(true);
            const res = await getSubjectsAPI(
                `current=1&pageSize=100&department_id=${departmentId}`,
            );
            setSubjects(res?.data?.result ?? []);
        } catch (error) {
            console.log(error);
            message.error("Không tải được danh sách môn học!");
            setSubjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (active && subjects.length === 0) {
            void fetchSubjects();
        }
    }, [active]);

    const columns: ProColumns<ISubject>[] = [
        { title: "#", valueType: "indexBorder", width: 48 },
        {
            title: "Mã môn",
            dataIndex: "code",
            width: 130,
            render: (_, record) => <Tag>{record.code}</Tag>,
        },
        {
            title: "Tên môn học",
            dataIndex: "name",
            ellipsis: true,
        },
        {
            title: "Tín chỉ",
            dataIndex: "credit",
            width: 100,
            render: (value) => value ?? "N/A",
        },
        {
            title: "Bộ môn",
            dataIndex: ["department", "name"],
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            width: 130,
            render: (_, record) =>
                record.isActive === false ? (
                    <Tag>Tạm ngưng</Tag>
                ) : (
                    <Tag color="green">Đang mở</Tag>
                ),
        },
    ];

    return (
        <DataTable<ISubject>
            rowKey="id"
            columns={columns}
            dataSource={subjects}
            loading={loading}
            search={false}
            options={false}
            pagination={{ pageSize: 10 }}
            locale={{
                emptyText: (
                    <div style={{ padding: 24, textAlign: "center" }}>
                        <Empty description="Bộ môn này chưa có môn học" />
                    </div>
                ),
            }}
        />
    );
};

export default SubjectTab;
