import { Card, Tag, Typography } from "antd";
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

const LESSONS = Array.from({ length: 12 }, (_, i) => i + 1);

const getCourseBlocks = (
    selectedCourses: AvailableItem[],
    registeredCourses: RegisteredItem[],
) => {
    const blocks: Array<{
        dayOfWeek: number;
        lessonStart: number;
        lessonEnd: number;
        courseCode: string;
        subjectName: string;
        teacherName: string;
        roomName: string;
        source: "registered" | "selected";
    }> = [];

    registeredCourses.forEach((item) => {
        const courseOffering = item?.courseOffering;
        const subjectName =
            courseOffering?.teacherSubject?.subject?.name ?? "—";
        const courseCode = courseOffering?.code ?? "—";
        const teacherName =
            courseOffering?.teacherSubject?.teacher?.user?.name ?? "—";

        (courseOffering?.schedules ?? []).forEach((schedule: any) => {
            blocks.push({
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
        const subjectId = course?.teacherSubject?.subject?.id;

        // nếu môn này đã đăng ký rồi thì không add lần 2
        const existedInRegistered = registeredCourses.some(
            (item) =>
                item?.courseOffering?.teacherSubject?.subject?.id === subjectId,
        );

        if (existedInRegistered) return;

        const subjectName = course?.teacherSubject?.subject?.name ?? "—";
        const courseCode = course?.code ?? "—";
        const teacherName = course?.teacherSubject?.teacher?.user?.name ?? "—";

        (course?.schedules ?? []).forEach((schedule: any) => {
            blocks.push({
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

const WeeklySchedulePreview = ({
    selectedCourses,
    registeredCourses,
}: Props) => {
    const blocks = getCourseBlocks(selectedCourses, registeredCourses);

    return (
        <Card
            title={`Lịch học theo tuần (${registeredCourses.length} môn đã đăng ký, ${selectedCourses.length} môn đang chọn)`}
            size="small"
        >
            <div style={{ overflowX: "auto" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 1100,
                    }}
                >
                    <thead>
                        <tr>
                            <th
                                style={{
                                    border: "1px solid #f0f0f0",
                                    padding: 12,
                                    background: "#fafafa",
                                    minWidth: 100,
                                    textAlign: "center",
                                }}
                            >
                                Tiết
                            </th>
                            {DAYS.map((day) => (
                                <th
                                    key={day.key}
                                    style={{
                                        border: "1px solid #f0f0f0",
                                        padding: 12,
                                        background: "#fafafa",
                                        minWidth: 140,
                                        textAlign: "center",
                                    }}
                                >
                                    {day.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {LESSONS.map((lesson) => (
                            <tr key={lesson}>
                                <td
                                    style={{
                                        border: "1px solid #f0f0f0",
                                        padding: 10,
                                        textAlign: "center",
                                        fontWeight: 600,
                                        background: "#fcfcfc",
                                    }}
                                >
                                    Tiết {lesson}
                                </td>

                                {DAYS.map((day) => {
                                    const matchedBlocks = blocks.filter(
                                        (block) =>
                                            block.dayOfWeek === day.key &&
                                            lesson >= block.lessonStart &&
                                            lesson <= block.lessonEnd,
                                    );

                                    return (
                                        <td
                                            key={`${day.key}-${lesson}`}
                                            style={{
                                                border: "1px solid #f0f0f0",
                                                padding: 8,
                                                verticalAlign: "top",
                                                height: 90,
                                                background:
                                                    matchedBlocks.length > 0
                                                        ? "#f8fafc"
                                                        : "#fff",
                                            }}
                                        >
                                            {matchedBlocks.length ? (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 6,
                                                    }}
                                                >
                                                    {matchedBlocks.map(
                                                        (block, index) => {
                                                            const isStartLesson =
                                                                lesson ===
                                                                block.lessonStart;

                                                            if (!isStartLesson)
                                                                return null;

                                                            return (
                                                                <div
                                                                    key={`${block.courseCode}-${index}`}
                                                                    style={{
                                                                        border:
                                                                            block.source ===
                                                                            "registered"
                                                                                ? "1px solid #91caff"
                                                                                : "1px solid #b7eb8f",
                                                                        background:
                                                                            block.source ===
                                                                            "registered"
                                                                                ? "#e6f4ff"
                                                                                : "#f6ffed",
                                                                        borderRadius: 8,
                                                                        padding: 8,
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            fontWeight: 700,
                                                                            marginBottom: 4,
                                                                        }}
                                                                    >
                                                                        {
                                                                            block.subjectName
                                                                        }
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            marginBottom: 4,
                                                                        }}
                                                                    >
                                                                        <Tag
                                                                            color={
                                                                                block.source ===
                                                                                "registered"
                                                                                    ? "blue"
                                                                                    : "green"
                                                                            }
                                                                        >
                                                                            {
                                                                                block.courseCode
                                                                            }
                                                                        </Tag>

                                                                        <Tag
                                                                            color={
                                                                                block.source ===
                                                                                "registered"
                                                                                    ? "processing"
                                                                                    : "success"
                                                                            }
                                                                        >
                                                                            {block.source ===
                                                                            "registered"
                                                                                ? "Đã đăng ký"
                                                                                : "Đang chọn"}
                                                                        </Tag>
                                                                    </div>

                                                                    <Text
                                                                        style={{
                                                                            display:
                                                                                "block",
                                                                        }}
                                                                    >
                                                                        {`Tiết ${block.lessonStart} - ${block.lessonEnd}`}
                                                                    </Text>

                                                                    <Text
                                                                        style={{
                                                                            display:
                                                                                "block",
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
                                                </div>
                                            ) : null}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default WeeklySchedulePreview;
