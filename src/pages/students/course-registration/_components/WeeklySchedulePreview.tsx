import { Card, Empty, Space, Tag, Typography } from "antd";
import type { AvailableItem } from "./tab/registation";
import type { RegisteredItem } from "./tab/registeredCourse";

const { Text } = Typography;

type Props = {
    selectedCourses: AvailableItem[];
    registeredCourses: RegisteredItem[];
};

const DAYS = [
    { key: 2, label: "Thứ 2" },
    { key: 3, label: "Thứ 3" },
    { key: 4, label: "Thứ 4" },
    { key: 5, label: "Thứ 5" },
    { key: 6, label: "Thứ 6" },
    { key: 7, label: "Thứ 7" },
    { key: 8, label: "CN" },
];

const LESSON_GROUPS = [
    {
        title: "Buổi sáng",
        lessons: [1, 2, 3, 4],
    },
    {
        title: "Buổi chiều",
        lessons: [5, 6, 7, 8],
    },
    {
        title: "Buổi tối",
        lessons: [9, 10, 11, 12],
    },
];

type CourseBlock = {
    id: string;
    dayOfWeek: number;
    lessonStart: number;
    lessonEnd: number;
    courseCode: string;
    subjectName: string;
    teacherName: string;
    roomName: string;
    source: "registered" | "selected";
};

const getCourseBlocks = (
    selectedCourses: AvailableItem[],
    registeredCourses: RegisteredItem[],
): CourseBlock[] => {
    const blocks: CourseBlock[] = [];

    registeredCourses.forEach((item) => {
        const courseOffering = item?.courseOffering;

        const subjectName =
            courseOffering?.teacherSubject?.subject?.name ?? "—";
        const courseCode = courseOffering?.code ?? "—";
        const teacherName =
            courseOffering?.teacherSubject?.teacher?.user?.name ?? "—";

        (courseOffering?.schedules ?? []).forEach((schedule: any) => {
            blocks.push({
                id: `registered-${courseOffering?.id}-${schedule?.id}`,
                dayOfWeek: schedule?.dayOfWeek ?? 0,
                lessonStart: schedule?.lessonStart ?? 0,
                lessonEnd: schedule?.lessonEnd ?? 0,
                courseCode,
                subjectName,
                teacherName,
                roomName: schedule?.room?.name ?? schedule?.room?.code ?? "—",
                source: "registered",
            });
        });
    });

    selectedCourses.forEach((course) => {
        const subjectId = course?.subject?.id;

        const existedInRegistered = registeredCourses.some(
            (item) =>
                item?.courseOffering?.teacherSubject?.subject?.id === subjectId,
        );

        if (existedInRegistered) return;

        const subjectName = course?.subject?.name ?? "—";
        const courseCode = course?.code ?? "—";
        const teacherName = course?.teacher?.user?.name ?? "—";

        (course?.schedules ?? []).forEach((schedule: any) => {
            blocks.push({
                id: `selected-${course?.id}-${schedule?.id}`,
                dayOfWeek: schedule?.dayOfWeek ?? 0,
                lessonStart: schedule?.lessonStart ?? 0,
                lessonEnd: schedule?.lessonEnd ?? 0,
                courseCode,
                subjectName,
                teacherName,
                roomName: schedule?.room?.name ?? schedule?.room?.code ?? "—",
                source: "selected",
            });
        });
    });

    return blocks;
};

const hasConflict = (block: CourseBlock, blocks: CourseBlock[]) => {
    return blocks.some((other) => {
        if (other.id === block.id) return false;
        if (other.dayOfWeek !== block.dayOfWeek) return false;

        return (
            block.lessonStart <= other.lessonEnd &&
            other.lessonStart <= block.lessonEnd
        );
    });
};

const WeeklySchedulePreview = ({
    selectedCourses,
    registeredCourses,
}: Props) => {
    const blocks = getCourseBlocks(selectedCourses, registeredCourses);

    return (
        <Card
            title="Thời khóa biểu dự kiến"
            size="small"
            extra={
                <Space wrap>
                    <Tag color="blue">Đã đăng ký</Tag>
                    <Tag color="green">Đang chọn</Tag>
                    <Tag color="red">Trùng lịch</Tag>
                </Space>
            }
        >
            {!blocks.length ? (
                <Empty description="Chưa có môn nào trong thời khóa biểu" />
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            minWidth: 1100,
                            borderCollapse: "separate",
                            borderSpacing: 0,
                            border: "1px solid #f0f0f0",
                            borderRadius: 12,
                            overflow: "hidden",
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 3,
                                        background: "#fafafa",
                                        borderRight: "1px solid #f0f0f0",
                                        borderBottom: "1px solid #f0f0f0",
                                        padding: 12,
                                        minWidth: 100,
                                        textAlign: "center",
                                    }}
                                >
                                    Buổi / Tiết
                                </th>

                                {DAYS.map((day) => (
                                    <th
                                        key={day.key}
                                        style={{
                                            background: "#fafafa",
                                            borderBottom: "1px solid #f0f0f0",
                                            borderRight: "1px solid #f0f0f0",
                                            padding: 12,
                                            minWidth: 150,
                                            textAlign: "center",
                                        }}
                                    >
                                        {day.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {LESSON_GROUPS.map((group) => (
                                <>
                                    <tr key={`${group.title}-header`}>
                                        <td
                                            colSpan={DAYS.length + 1}
                                            style={{
                                                background: "#f5f5f5",
                                                borderBottom:
                                                    "1px solid #f0f0f0",
                                                padding: "10px 12px",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {group.title}
                                        </td>
                                    </tr>

                                    {group.lessons.map((lesson) => (
                                        <tr key={`${group.title}-${lesson}`}>
                                            <td
                                                style={{
                                                    position: "sticky",
                                                    left: 0,
                                                    zIndex: 2,
                                                    background: "#fcfcfc",
                                                    borderRight:
                                                        "1px solid #f0f0f0",
                                                    borderBottom:
                                                        "1px solid #f0f0f0",
                                                    padding: 10,
                                                    textAlign: "center",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Tiết {lesson}
                                            </td>

                                            {DAYS.map((day) => {
                                                const matchedBlocks =
                                                    blocks.filter(
                                                        (block) =>
                                                            block.dayOfWeek ===
                                                                day.key &&
                                                            lesson ===
                                                                block.lessonStart,
                                                    );

                                                return (
                                                    <td
                                                        key={`${day.key}-${lesson}`}
                                                        style={{
                                                            borderRight:
                                                                "1px solid #f0f0f0",
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                            padding: 8,
                                                            verticalAlign:
                                                                "top",
                                                            height: 86,
                                                            background: "#fff",
                                                        }}
                                                    >
                                                        <Space
                                                            direction="vertical"
                                                            size={8}
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            {matchedBlocks.map(
                                                                (block) => {
                                                                    const conflict =
                                                                        hasConflict(
                                                                            block,
                                                                            blocks,
                                                                        );

                                                                    const borderColor =
                                                                        conflict
                                                                            ? "#ff4d4f"
                                                                            : block.source ===
                                                                                "registered"
                                                                              ? "#91caff"
                                                                              : "#b7eb8f";

                                                                    const background =
                                                                        conflict
                                                                            ? "#fff1f0"
                                                                            : block.source ===
                                                                                "registered"
                                                                              ? "#e6f4ff"
                                                                              : "#f6ffed";

                                                                    const tagColor =
                                                                        conflict
                                                                            ? "red"
                                                                            : block.source ===
                                                                                "registered"
                                                                              ? "blue"
                                                                              : "green";

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                block.id
                                                                            }
                                                                            style={{
                                                                                border: `1px solid ${borderColor}`,
                                                                                background,
                                                                                borderRadius: 10,
                                                                                padding: 10,
                                                                                boxShadow:
                                                                                    "0 2px 8px rgba(0,0,0,0.04)",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    fontWeight: 700,
                                                                                    marginBottom: 6,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    block.subjectName
                                                                                }
                                                                            </div>

                                                                            <Space
                                                                                wrap
                                                                                size={
                                                                                    4
                                                                                }
                                                                                style={{
                                                                                    marginBottom: 6,
                                                                                }}
                                                                            >
                                                                                <Tag
                                                                                    color={
                                                                                        tagColor
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        block.courseCode
                                                                                    }
                                                                                </Tag>

                                                                                <Tag
                                                                                    color={
                                                                                        tagColor
                                                                                    }
                                                                                >
                                                                                    {conflict
                                                                                        ? "Trùng lịch"
                                                                                        : block.source ===
                                                                                            "registered"
                                                                                          ? "Đã đăng ký"
                                                                                          : "Đang chọn"}
                                                                                </Tag>
                                                                            </Space>

                                                                            <Text
                                                                                style={{
                                                                                    display:
                                                                                        "block",
                                                                                    fontSize: 13,
                                                                                }}
                                                                            >
                                                                                Tiết{" "}
                                                                                {
                                                                                    block.lessonStart
                                                                                }{" "}
                                                                                -{" "}
                                                                                {
                                                                                    block.lessonEnd
                                                                                }
                                                                            </Text>

                                                                            <Text
                                                                                style={{
                                                                                    display:
                                                                                        "block",
                                                                                    fontSize: 13,
                                                                                }}
                                                                            >
                                                                                GV:{" "}
                                                                                {
                                                                                    block.teacherName
                                                                                }
                                                                            </Text>

                                                                            <Text
                                                                                style={{
                                                                                    display:
                                                                                        "block",
                                                                                    fontSize: 13,
                                                                                }}
                                                                            >
                                                                                Phòng:{" "}
                                                                                {
                                                                                    block.roomName
                                                                                }
                                                                            </Text>
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                        </Space>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default WeeklySchedulePreview;
