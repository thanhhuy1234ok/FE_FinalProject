import { getMajorsAPI } from "@/services/api";
import DataTable from "@/components/share/data.table";
import type { ProColumns } from "@ant-design/pro-components";
import { Empty, Tag, message } from "antd";
import { useEffect, useState } from "react";

interface IProps {
    departmentId: number;
    active: boolean;
}

const MajorTab = ({ departmentId, active }: IProps) => {
    const [loading, setLoading] = useState(false);
    const [majors, setMajors] = useState<IMajor[]>([]);

    const fetchMajors = async () => {
        if (!departmentId) return;

        try {
            setLoading(true);
            const res = await getMajorsAPI(
                `current=1&pageSize=100&department_id=${departmentId}`,
            );
            setMajors(res?.data?.result ?? []);
        } catch (error) {
            console.log(error);
            message.error("Không tải được danh sách chuyên ngành!");
            setMajors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (active && majors.length === 0) {
            void fetchMajors();
        }
    }, [active]);

    const columns: ProColumns<IMajor>[] = [
        { title: "#", valueType: "indexBorder", width: 48 },
        {
            title: "Mã chuyên ngành",
            dataIndex: "code",
            width: 160,
            render: (_, record) =>
                record.code ? <Tag>{record.code}</Tag> : <Tag>N/A</Tag>,
        },
        {
            title: "Tên chuyên ngành",
            dataIndex: "name",
            ellipsis: true,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            ellipsis: true,
            render: (value) => value || "N/A",
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            width: 130,
            render: (_, record) =>
                record.isActive === false ? (
                    <Tag>Tạm ngưng</Tag>
                ) : (
                    <Tag color="green">Đang hoạt động</Tag>
                ),
        },
    ];

    return (
        <DataTable<IMajor>
            rowKey="id"
            columns={columns}
            dataSource={majors}
            loading={loading}
            search={false}
            options={false}
            pagination={{ pageSize: 10 }}
            locale={{
                emptyText: (
                    <div style={{ padding: 24, textAlign: "center" }}>
                        <Empty description="Bộ môn này chưa có chuyên ngành" />
                    </div>
                ),
            }}
        />
    );
};

export default MajorTab;
