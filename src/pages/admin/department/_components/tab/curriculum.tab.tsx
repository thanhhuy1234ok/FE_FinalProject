import { getCurriculumsAPI } from "@/services/api";
import DataTable from "@/components/share/data.table";
import type { ProColumns } from "@ant-design/pro-components";
import { Empty, Select, Tag, message } from "antd";
import { useEffect, useMemo, useState } from "react";

interface IProps {
    departmentId: number;
    active: boolean;
}

const CurriculumTab = ({ departmentId, active }: IProps) => {
    const currentYear = new Date().getFullYear();

    const [loading, setLoading] = useState(false);
    const [allCurriculums, setAllCurriculums] = useState<ICurriculum[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | undefined>();

    const getCurriculumYear = (item: ICurriculum): number | undefined => {
        if (typeof item.yearOfAdmission === "number")
            return item.yearOfAdmission;

        if (
            item.yearOfAdmission &&
            typeof item.yearOfAdmission === "object" &&
            "year" in item.yearOfAdmission
        ) {
            const year = Number((item.yearOfAdmission as any).year);
            return Number.isNaN(year) ? undefined : year;
        }

        if (
            item.yearOfAdmission &&
            typeof item.yearOfAdmission === "object" &&
            "name" in item.yearOfAdmission
        ) {
            const year = Number((item.yearOfAdmission as any).name);
            return Number.isNaN(year) ? undefined : year;
        }

        if ((item as any).yearOfAdmissionId) {
            const year = Number((item as any).yearOfAdmissionId);
            return Number.isNaN(year) ? undefined : year;
        }

        return undefined;
    };

    const fetchCurriculums = async () => {
        if (!departmentId) return;

        try {
            setLoading(true);
            const res = await getCurriculumsAPI(
                `current=1&pageSize=100&department_id=${departmentId}`,
            );
            setAllCurriculums(res?.data?.result ?? []);
        } catch (error) {
            console.log(error);
            message.error("Không tải được chương trình đào tạo!");
            setAllCurriculums([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (active && allCurriculums.length === 0) {
            void fetchCurriculums();
        }
    }, [active]);

    const yearOptions = useMemo(() => {
        const years = Array.from(
            new Set(
                allCurriculums
                    .map((item) => getCurriculumYear(item))
                    .filter((y): y is number => y !== undefined),
            ),
        ).sort((a, b) => b - a);

        return years.map((year) => ({
            label: `Khoá ${year}`,
            value: year,
        }));
    }, [allCurriculums]);

    useEffect(() => {
        if (!yearOptions.length) {
            setSelectedYear(undefined);
            return;
        }

        const values = yearOptions.map((item) => item.value);

        if (values.includes(currentYear)) {
            setSelectedYear(currentYear);
        } else {
            setSelectedYear(values[0]);
        }
    }, [yearOptions, currentYear]);

    const filteredCurriculums = useMemo(() => {
        if (!selectedYear) return allCurriculums;

        return allCurriculums.filter(
            (item) => getCurriculumYear(item) === selectedYear,
        );
    }, [allCurriculums, selectedYear]);

    const columns: ProColumns<ICurriculum>[] = [
        { title: "#", valueType: "indexBorder", width: 48 },
        {
            title: "Tên CTĐT",
            dataIndex: "name",
            ellipsis: true,
        },
        {
            title: "Mã",
            dataIndex: "code",
            width: 130,
            render: (_, record) =>
                record.code ? <Tag>{record.code}</Tag> : <Tag>N/A</Tag>,
        },
        {
            title: "Chuyên ngành",
            dataIndex: "majorName",
            ellipsis: true,
            render: (_, record) => record.major?.name ?? record.name ?? "N/A",
        },
        {
            title: "Khoá",
            dataIndex: "yearOfAdmission",
            width: 120,
            render: (_, record) => getCurriculumYear(record) ?? "N/A",
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            width: 130,
            render: (_, record) =>
                record.isActive === false ? (
                    <Tag>Tạm ngưng</Tag>
                ) : (
                    <Tag color="green">Đang áp dụng</Tag>
                ),
        },
    ];

    return (
        <DataTable<ICurriculum>
            rowKey="id"
            columns={columns}
            dataSource={filteredCurriculums}
            loading={loading}
            search={false}
            options={false}
            toolBarRender={() => [
                <Select
                    key="year-select"
                    allowClear
                    placeholder="Chọn năm"
                    style={{ width: 180 }}
                    value={selectedYear}
                    onChange={(value) => setSelectedYear(value)}
                    options={yearOptions}
                />,
            ]}
            pagination={{ pageSize: 10 }}
            locale={{
                emptyText: (
                    <div style={{ padding: 24, textAlign: "center" }}>
                        <Empty description="Không có CTĐT cho năm đã chọn" />
                    </div>
                ),
            }}
        />
    );
};

export default CurriculumTab;
