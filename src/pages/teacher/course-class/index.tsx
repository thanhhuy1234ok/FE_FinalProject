import {
    Avatar,
    Button,
    Card,
    Col,
    Empty,
    Input,
    Row,
    Space,
    Spin,
    Tag,
    Typography,
    message,
} from "antd";
import {
    BookOutlined,
    CalendarOutlined,
    SearchOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getMyTeachingCoursesAPI, getTermsAPI } from "@/services/api";
import { DebounceSelect } from "@/components/share/debouce.select";
import { socket } from "@/socket/socket";

const { Title, Text } = Typography;

type TCourseClass = {
    id: number;
    status: string;
    unreadCount?: number;
    term: {
        id: number;
        year: number;
        semester: string;
        isActive: boolean;
    };
    adminClass?: {
        id: number;
        name: string;
        code?: string;
    };
    teacherSubject: {
        id: number;
        subject: {
            id: number;
            code: string;
            name: string;
            credit: number;
        };
        teacher: {
            id: number;
            user?: {
                name?: string;
                avatar?: string;
            };
        };
    };
    schedules?: {
        id: number;
        dayOfWeek: number;
        lessonStart: number;
        lessonEnd: number;
        room?: {
            name: string;
        };
    }[];
};

const dayMap: Record<number, string> = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
    8: "CN",
};

const statusColorMap: Record<string, string> = {
    OPEN: "green",
    CLOSED: "red",
    DRAFT: "gold",
};

const CourseClassPage = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<TCourseClass[]>([]);
    const [search, setSearch] = useState("");
    const [termSelected, setTermSelected] = useState<IOptionSelect>();

    const fetchCourses = async (termId?: number) => {
        try {
            setLoading(true);
            const res = await getMyTeachingCoursesAPI(termId);
            const data =
                res?.data?.result || res?.data?.data || res?.data || [];
            setCourses(data);
        } catch (error) {
            console.log(error);
            message.error("Không tải được danh sách lớp học");
        } finally {
            setLoading(false);
        }
    };

    const fetchTerms = async () => {
        try {
            const res = await getTermsAPI("current=1&pageSize=100");
            const data = res?.data?.result || [];
            const activeTerm = data.find((item: ITerm) => item.isActive);

            if (activeTerm) {
                setTermSelected({
                    label: `${activeTerm.semester} - ${activeTerm.year} (Đang hoạt động)`,
                    value: activeTerm.id,
                });
            }
        } catch (error) {
            console.log(error);
            message.error("Không tải được danh sách học kỳ");
        }
    };

    const fetchTermOptions = async () => {
        const res = await getTermsAPI("current=1&pageSize=100");
        const data = res?.data?.result || [];

        return data.map((item: ITerm) => ({
            label: `${item.semester} - ${item.year}${
                item.isActive ? " (Đang hoạt động)" : ""
            }`,
            value: item.id,
        }));
    };

    useEffect(() => {
        fetchTerms();
    }, []);

    useEffect(() => {
        fetchCourses(Number(termSelected?.value));
    }, [termSelected]);

    useEffect(() => {
        const handleConversationUpdated = (payload: any) => {
            if (!payload?.courseOfferingId) return;

            setCourses((prev) =>
                prev.map((course) =>
                    course.id === payload.courseOfferingId
                        ? {
                              ...course,
                              unreadCount: payload.unreadCount || 0,
                          }
                        : course,
                ),
            );
        };

        socket.on("conversation:updated", handleConversationUpdated);

        return () => {
            socket.off("conversation:updated", handleConversationUpdated);
        };
    }, []);

    const filteredCourses = useMemo(() => {
        return courses.filter((item) => {
            const keyword = search.trim().toLowerCase();
            if (!keyword) return true;

            const subjectName =
                item.teacherSubject?.subject?.name?.toLowerCase() || "";
            const subjectCode =
                item.teacherSubject?.subject?.code?.toLowerCase() || "";
            const adminClassName = item.adminClass?.name?.toLowerCase() || "";
            const adminClassCode = item.adminClass?.code?.toLowerCase() || "";

            return (
                subjectName.includes(keyword) ||
                subjectCode.includes(keyword) ||
                adminClassName.includes(keyword) ||
                adminClassCode.includes(keyword)
            );
        });
    }, [courses, search]);

    return (
        <div style={{ padding: 20 }}>
            <Card
                style={{
                    borderRadius: 24,
                    marginBottom: 24,
                    border: "none",
                }}
            >
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Space direction="vertical" size={2}>
                            <Title level={2} style={{ margin: 0 }}>
                                Lớp học giảng dạy
                            </Title>

                            <Text type="secondary">
                                Mặc định hiển thị lớp thuộc học kỳ đang hoạt
                                động. Có thể chọn học kỳ để xem lớp tương ứng.
                            </Text>
                        </Space>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Row gutter={[12, 12]}>
                            <Col xs={24} md={14}>
                                <Input
                                    allowClear
                                    size="large"
                                    placeholder="Tìm môn học, mã môn, lớp..."
                                    prefix={<SearchOutlined />}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </Col>

                            <Col xs={24} md={10}>
                                <DebounceSelect
                                    allowClear
                                    size="large"
                                    style={{ width: "100%" }}
                                    placeholder="Chọn học kỳ"
                                    onChange={(value) =>
                                        setTermSelected(
                                            value as IOptionSelect | undefined,
                                        )
                                    }
                                    showSearch
                                    labelInValue
                                    fetchOptions={fetchTermOptions}
                                    labelRender={(props) => {
                                        const label = String(props.label || "");
                                        const isActive =
                                            label.includes("Đang hoạt động");

                                        return (
                                            <Space size={6}>
                                                <span>
                                                    {label.replace(
                                                        " (Đang hoạt động)",
                                                        "",
                                                    )}
                                                </span>

                                                {isActive && (
                                                    <Tag
                                                        color="success"
                                                        style={{
                                                            marginInlineEnd: 0,
                                                            borderRadius: 999,
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        Đang hoạt động
                                                    </Tag>
                                                )}
                                            </Space>
                                        );
                                    }}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            <Spin spinning={loading}>
                {filteredCourses.length === 0 ? (
                    <Card style={{ borderRadius: 24 }}>
                        <Empty description="Không có lớp học nào" />
                    </Card>
                ) : (
                    <Row gutter={[24, 24]} align="stretch">
                        {filteredCourses.map((course) => {
                            const subject = course.teacherSubject.subject;
                            const unreadCount = course.unreadCount || 0;
                            const hasUnread = unreadCount > 0;

                            return (
                                <Col
                                    xs={24}
                                    sm={24}
                                    md={12}
                                    lg={8}
                                    xl={8}
                                    xxl={8}
                                    key={course.id}
                                    style={{ display: "flex" }}
                                >
                                    <Card
                                        hoverable
                                        style={{
                                            width: "100%",
                                            height: 460,
                                            borderRadius: 24,
                                            overflow: "visible",
                                            position: "relative",
                                            border: hasUnread
                                                ? "1px solid #ff7875"
                                                : "1px solid #f0f0f0",
                                            boxShadow: hasUnread
                                                ? "0 8px 24px rgba(255,77,79,0.12)"
                                                : undefined,
                                        }}
                                        bodyStyle={{
                                            height: "100%",
                                            padding: 20,
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        {hasUnread && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: -8,
                                                    right: -8,

                                                    minWidth: 28,
                                                    height: 28,
                                                    padding: "0 8px",

                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",

                                                    borderRadius: "50px",

                                                    background: "#ff4d4f",
                                                    color: "#fff",

                                                    fontSize: 12,
                                                    fontWeight: 700,

                                                    border: "2px solid rgba(255,255,255,0.5)",

                                                    boxShadow:
                                                        "0 6px 18px rgba(255,77,79,0.45)",
                                                }}
                                            >
                                                {unreadCount > 99
                                                    ? "99+"
                                                    : unreadCount}
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                minHeight: 82,
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                gap: 12,
                                                marginBottom: 18,
                                                paddingRight: hasUnread
                                                    ? 26
                                                    : 0,
                                            }}
                                        >
                                            <Space
                                                align="start"
                                                style={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                }}
                                            >
                                                <Avatar
                                                    size={56}
                                                    style={{
                                                        background: "#1677ff",
                                                        fontSize: 22,
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {subject.code?.slice(
                                                        0,
                                                        2,
                                                    ) || "MH"}
                                                </Avatar>

                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <Title
                                                        level={5}
                                                        ellipsis={{ rows: 2 }}
                                                        style={{
                                                            margin: 0,
                                                            minHeight: 25,
                                                            lineHeight: "22px",
                                                        }}
                                                    >
                                                        {subject.name}
                                                    </Title>

                                                    <Text type="secondary">
                                                        {subject.code}
                                                    </Text>
                                                </div>
                                            </Space>

                                            <div
                                                style={{
                                                    width: 92,
                                                    flexShrink: 0,
                                                    display: "flex",
                                                    flexDirection: hasUnread
                                                        ? "row"
                                                        : "row-reverse",
                                                    alignItems: "flex-end",
                                                    gap: 6,
                                                }}
                                            >
                                                {hasUnread && (
                                                    <Tag
                                                        color="red"
                                                        style={{
                                                            marginInlineEnd: 0,
                                                        }}
                                                    >
                                                        Tin mới
                                                    </Tag>
                                                )}

                                                <Tag
                                                    color={
                                                        statusColorMap[
                                                            course.status
                                                        ] || "default"
                                                    }
                                                    style={{
                                                        marginInlineEnd: 0,
                                                    }}
                                                >
                                                    {course.status}
                                                </Tag>
                                            </div>
                                        </div>

                                        <Space
                                            direction="vertical"
                                            size={14}
                                            style={{ width: "100%" }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    minHeight: 24,
                                                }}
                                            >
                                                <BookOutlined />
                                                <Text>
                                                    {subject.credit} tín chỉ
                                                </Text>
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    minHeight: 32,
                                                }}
                                            >
                                                <CalendarOutlined />
                                                <Space size={6} wrap>
                                                    <Text>
                                                        {course.term.semester} -{" "}
                                                        {course.term.year}
                                                    </Text>

                                                    {course.term.isActive && (
                                                        <Tag
                                                            color="success"
                                                            style={{
                                                                borderRadius: 999,
                                                                fontWeight: 600,
                                                                paddingInline: 10,
                                                                marginInlineEnd: 0,
                                                            }}
                                                        >
                                                            Đang hoạt động
                                                        </Tag>
                                                    )}
                                                </Space>
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    minHeight: 28,
                                                }}
                                            >
                                                <TeamOutlined />
                                                <Text
                                                    ellipsis
                                                    style={{
                                                        maxWidth: 320,
                                                    }}
                                                >
                                                    Lớp:{" "}
                                                    {course.adminClass?.name ||
                                                        course.adminClass
                                                            ?.code ||
                                                        "Chưa có"}
                                                </Text>
                                            </div>

                                            <div>
                                                <Text strong>Lịch học:</Text>

                                                <div
                                                    style={{
                                                        marginTop: 10,
                                                        height: 90,
                                                        overflow: "hidden",
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        alignContent:
                                                            "flex-start",
                                                        gap: 8,
                                                    }}
                                                >
                                                    {course.schedules
                                                        ?.length ? (
                                                        course.schedules.map(
                                                            (schedule) => (
                                                                <Tag
                                                                    key={
                                                                        schedule.id
                                                                    }
                                                                    color="blue"
                                                                    style={{
                                                                        padding:
                                                                            "6px 10px",
                                                                        borderRadius: 999,
                                                                        marginInlineEnd: 0,
                                                                        maxWidth:
                                                                            "100%",
                                                                    }}
                                                                >
                                                                    {
                                                                        dayMap[
                                                                            schedule
                                                                                .dayOfWeek
                                                                        ]
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        schedule.lessonStart
                                                                    }
                                                                    -
                                                                    {
                                                                        schedule.lessonEnd
                                                                    }
                                                                    )
                                                                    {schedule
                                                                        .room
                                                                        ?.name
                                                                        ? ` • ${schedule.room.name}`
                                                                        : ""}
                                                                </Tag>
                                                            ),
                                                        )
                                                    ) : (
                                                        <Text type="secondary">
                                                            Chưa có lịch học
                                                        </Text>
                                                    )}
                                                </div>
                                            </div>
                                        </Space>

                                        <div
                                            style={{
                                                marginTop: "auto",
                                                paddingTop: 20,
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 12,
                                            }}
                                        >
                                            <Text type="secondary">
                                                Cập nhật{" "}
                                                {dayjs().format("DD/MM/YYYY")}
                                            </Text>

                                            <Button
                                                type="primary"
                                                size="middle"
                                                onClick={() => {
                                                    setCourses((prev) =>
                                                        prev.map((item) =>
                                                            item.id ===
                                                            course.id
                                                                ? {
                                                                      ...item,
                                                                      unreadCount: 0,
                                                                  }
                                                                : item,
                                                        ),
                                                    );

                                                    navigate(`${course.id}`);
                                                }}
                                            >
                                                Vào lớp
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Spin>
        </div>
    );
};

export default CourseClassPage;
