import { useRef, useState, useMemo } from "react";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import DataTable from "@/components/share/data.table";
import RenderHeaderTable from "@/components/share/header.table";
import { buildQuery } from "@/helper/buildQuery";
import { getSchedulesAPI } from "@/services/api";
import { Card, Space, Tag, Typography } from "antd";
import ModalSchedule from "./modal";

const { Text } = Typography;

interface ISchedule {
    id: number;
    dayOfWeek: number;
    lessonStart: number;
    lessonEnd: number;
    startDate?: string;
    endDate?: string;
    room?: {
        id: number;
        name: string;
        code?: string;
    } | null;
    courseOffering?: {
        id: number;
        code: string;
        teacherSubject?: {
            subject?: {
                id: number;
                name?: string;
                code?: string;
            };
            teacher?: {
                id: number;
                user?: {
                    name?: string;
                };
            };
        };
    };
}

interface IGroupedSchedule {
    id: string;
    courseOfferingCode: string;
    subjectName: string;
    subjectCode: string;
    teacherName: string;
    startDate: string;
    endDate: string;
    schedules: ISchedule[];
}

const DAY_OF_WEEK_MAP: Record<number, string> = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
    8: "Chủ nhật",
};

const sortSchedules = (schedules: ISchedule[]) => {
    return [...schedules].sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        if (a.lessonStart !== b.lessonStart)
            return a.lessonStart - b.lessonStart;
        return a.lessonEnd - b.lessonEnd;
    });
};

const ListSchedule = ({ onReload }: { onReload?: () => void }) => {
    const actionRef = useRef<ActionType>();
    const [openModal, setOpenModal] = useState(false);

    const columns: ProColumns<IGroupedSchedule>[] = useMemo(
        () => [
            {
                title: "Mã lớp học phần",
                dataIndex: "courseOfferingCode",
                hideInSearch: true,
                render: (_, record) => (
                    <Tag
                        color="blue"
                        style={{ fontSize: 14, padding: "4px 10px" }}
                    >
                        {record.courseOfferingCode || "—"}
                    </Tag>
                ),
            },
            {
                title: "Môn học",
                dataIndex: "subjectName",
                render: (_, record) => (
                    <Text strong>{record.subjectName || "—"}</Text>
                ),
            },
            {
                title: "Mã môn",
                dataIndex: "subjectCode",
                hideInSearch: true,
                render: (_, record) => (
                    <Tag color="cyan">{record.subjectCode || "—"}</Tag>
                ),
            },
            {
                title: "Giảng viên",
                dataIndex: "teacherName",
                hideInSearch: true,
                render: (_, record) => record.teacherName || "—",
            },
            {
                title: "Thời gian áp dụng",
                hideInSearch: true,
                render: (_, record) => (
                    <Text>
                        {record.startDate || "—"} - {record.endDate || "—"}
                    </Text>
                ),
            },
            {
                title: "Lịch học",
                hideInSearch: true,
                render: (_, record) => {
                    const schedules = sortSchedules(record.schedules);

                    return (
                        <Space
                            direction="vertical"
                            size={12}
                            style={{ width: "100%" }}
                        >
                            {schedules.map((item) => (
                                <Card
                                    key={item.id}
                                    size="small"
                                    bodyStyle={{
                                        padding: "10px 14px",
                                    }}
                                    style={{
                                        borderRadius: 12,
                                        background: "#fafafa",
                                    }}
                                >
                                    <Space wrap size={[8, 8]}>
                                        <Tag color="geekblue">
                                            {DAY_OF_WEEK_MAP[item.dayOfWeek] ||
                                                `Thứ ${item.dayOfWeek}`}
                                        </Tag>

                                        <Tag color="purple">
                                            Tiết {item.lessonStart} -{" "}
                                            {item.lessonEnd}
                                        </Tag>

                                        <Tag color="gold">
                                            Phòng: {item.room?.name || "—"}
                                        </Tag>
                                    </Space>
                                </Card>
                            ))}
                        </Space>
                    );
                },
            },
        ],
        [],
    );

    return (
        <>
            <DataTable<IGroupedSchedule>
                actionRef={actionRef}
                rowKey="id"
                columns={columns}
                headerTitle="Danh sách lịch dạy"
                request={async (params, sort, filter) => {
                    const query = buildQuery(params, sort, filter);
                    const res = await getSchedulesAPI(query);

                    const rawData: ISchedule[] = res?.data?.result || [];

                    const groupedMap = new Map<string, IGroupedSchedule>();

                    rawData.forEach((item) => {
                        const courseOfferingCode =
                            item.courseOffering?.code || `unknown-${item.id}`;

                        if (!groupedMap.has(courseOfferingCode)) {
                            groupedMap.set(courseOfferingCode, {
                                id: courseOfferingCode,
                                courseOfferingCode,
                                subjectName:
                                    item.courseOffering?.teacherSubject?.subject
                                        ?.name || "—",
                                subjectCode:
                                    item.courseOffering?.teacherSubject?.subject
                                        ?.code || "—",
                                teacherName:
                                    item.courseOffering?.teacherSubject?.teacher
                                        ?.user?.name || "—",
                                startDate: item.startDate || "—",
                                endDate: item.endDate || "—",
                                schedules: [],
                            });
                        }

                        groupedMap
                            .get(courseOfferingCode)
                            ?.schedules.push(item);
                    });

                    const groupedData = Array.from(groupedMap.values()).sort(
                        (a, b) =>
                            a.courseOfferingCode.localeCompare(
                                b.courseOfferingCode,
                            ),
                    );

                    return {
                        data: groupedData,
                        success: true,
                        total: groupedData.length,
                    };
                }}
                toolBarRender={() => [
                    <RenderHeaderTable
                        key="toolbar"
                        showAdd
                        setOpenModal={setOpenModal}
                    />,
                ]}
            />

            <ModalSchedule
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchData={() => {
                    actionRef.current?.reload(); // reload table
                    onReload?.(); // reload calendar 🔥
                }}
            />
        </>
    );
};

export default ListSchedule;
