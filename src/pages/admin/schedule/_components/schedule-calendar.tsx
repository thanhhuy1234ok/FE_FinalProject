import { useEffect, useMemo, useState } from "react";
import { App, Card, Empty, Segmented, Select, Tooltip } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import classNames from "classnames";
import { getSchedulesAPI } from "@/services/api";
import { buildQuery } from "@/helper/buildQuery";
import "./schedule-calendar.scss";

interface IUser {
    id: string;
    name: string;
    email?: string;
}

interface ITeacher {
    id: number | string;
    user?: IUser;
}

interface ISubject {
    id: number;
    name: string;
    code: string;
}

interface ITeacherSubject {
    id: number;
    teacher?: ITeacher;
    subject?: ISubject;
}

interface IAdminClass {
    id: number;
    name: string;
    code?: string;
}

interface IRoom {
    id: number;
    name: string;
    code?: string;
}

interface ICourseOffering {
    id: number;
    teacherSubject?: ITeacherSubject;
    adminClass?: IAdminClass | null;
}

export interface ISchedule {
    id: number;
    dayOfWeek: number;
    lessonStart: number;
    lessonEnd: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    room?: IRoom | null;
    courseOffering?: ICourseOffering;
}

interface ScheduleCalendarProps {
    reloadKey?: number;
}

interface CalendarCell {
    date: Dayjs;
    inCurrentMonth: boolean;
}

type ViewMode = "month" | "day";

const weekDayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const monthOptions = [
    { label: "Tháng 1", value: 0 },
    { label: "Tháng 2", value: 1 },
    { label: "Tháng 3", value: 2 },
    { label: "Tháng 4", value: 3 },
    { label: "Tháng 5", value: 4 },
    { label: "Tháng 6", value: 5 },
    { label: "Tháng 7", value: 6 },
    { label: "Tháng 8", value: 7 },
    { label: "Tháng 9", value: 8 },
    { label: "Tháng 10", value: 9 },
    { label: "Tháng 11", value: 10 },
    { label: "Tháng 12", value: 11 },
];

const dayOfWeekMap: Record<number, number> = {
    8: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
};

const dayLabelMap: Record<number, string> = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
    8: "Chủ nhật",
};

const colorClasses = [
    "event-color-1",
    "event-color-2",
    "event-color-3",
    "event-color-4",
    "event-color-5",
    "event-color-6",
];

const getColorClass = (value?: string) => {
    if (!value) return colorClasses[0];

    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colorClasses[Math.abs(hash) % colorClasses.length];
};

const buildCalendarRows = (value: Dayjs): CalendarCell[][] => {
    const startOfMonth = value.startOf("month");
    const endOfMonth = value.endOf("month");

    const startOffset = startOfMonth.day();
    const totalDays = endOfMonth.date();

    const totalCells = startOffset + totalDays;
    const rowCount = Math.ceil(totalCells / 7);

    const gridStart = startOfMonth.subtract(startOffset, "day");
    const rows: CalendarCell[][] = [];

    for (let row = 0; row < rowCount; row += 1) {
        const cells: CalendarCell[] = [];

        for (let col = 0; col < 7; col += 1) {
            const date = gridStart.add(row * 7 + col, "day");
            cells.push({
                date,
                inCurrentMonth: date.month() === value.month(),
            });
        }

        rows.push(cells);
    }

    return rows;
};

const ScheduleCalendar = ({ reloadKey }: ScheduleCalendarProps) => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState<ISchedule[]>([]);
    const [value, setValue] = useState(dayjs());
    const [viewMode, setViewMode] = useState<ViewMode>("month");

    const fetchSchedules = async () => {
        try {
            setLoading(true);

            const query = buildQuery({
                current: 1,
                pageSize: 1000,
            });

            const res = await getSchedulesAPI(query);
            setSchedules(res?.data?.result ?? []);
        } catch {
            message.error("Không thể tải lịch học");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [reloadKey]);

    const schedulesByDate = useMemo(() => {
        const map = new Map<string, ISchedule[]>();

        schedules.forEach((schedule) => {
            if (!schedule.startDate || !schedule.endDate) return;

            let cursor = dayjs(schedule.startDate);
            const end = dayjs(schedule.endDate);

            if (!cursor.isValid() || !end.isValid() || cursor.isAfter(end)) {
                return;
            }

            while (cursor.isBefore(end, "day") || cursor.isSame(end, "day")) {
                const jsDay = cursor.day();
                const targetDay = dayOfWeekMap[schedule.dayOfWeek];

                if (jsDay === targetDay) {
                    const key = cursor.format("YYYY-MM-DD");
                    const current = map.get(key) ?? [];
                    current.push(schedule);
                    map.set(key, current);
                }

                cursor = cursor.add(1, "day");
            }
        });

        map.forEach((items, key) => {
            map.set(
                key,
                items.sort((a, b) => a.lessonStart - b.lessonStart),
            );
        });

        return map;
    }, [schedules]);

    const rows = useMemo(() => buildCalendarRows(value), [value]);

    const getListData = (date: Dayjs) => {
        return schedulesByDate.get(date.format("YYYY-MM-DD")) ?? [];
    };

    const daySchedules = useMemo(
        () => getListData(value),
        [schedulesByDate, value],
    );

    const renderTooltipContent = (item: ISchedule) => {
        const subject =
            item.courseOffering?.teacherSubject?.subject?.name || "—";
        const subjectCode =
            item.courseOffering?.teacherSubject?.subject?.code || "—";
        const teacher =
            item.courseOffering?.teacherSubject?.teacher?.user?.name || "—";
        const adminClass = item.courseOffering?.adminClass?.name || "—";
        const room = item.room?.name || "—";

        return (
            <div className="schedule-tooltip">
                <div className="schedule-tooltip__title">{subject}</div>

                <div className="schedule-tooltip__row">
                    <span>Mã môn:</span>
                    <strong>{subjectCode}</strong>
                </div>

                <div className="schedule-tooltip__row">
                    <span>Giảng viên:</span>
                    <strong>{teacher}</strong>
                </div>

                <div className="schedule-tooltip__row">
                    <span>Lớp:</span>
                    <strong>{adminClass}</strong>
                </div>

                <div className="schedule-tooltip__row">
                    <span>Phòng:</span>
                    <strong>{room}</strong>
                </div>

                <div className="schedule-tooltip__row">
                    <span>Thời gian:</span>
                    <strong>
                        {dayLabelMap[item.dayOfWeek]} • Tiết {item.lessonStart}-
                        {item.lessonEnd}
                    </strong>
                </div>

                <div className="schedule-tooltip__row">
                    <span>Áp dụng:</span>
                    <strong>
                        {dayjs(item.startDate).format("DD/MM/YYYY")} -{" "}
                        {dayjs(item.endDate).format("DD/MM/YYYY")}
                    </strong>
                </div>
            </div>
        );
    };

    const renderMoreTooltipContent = (list: ISchedule[]) => {
        const hiddenList = list.slice(2);

        return (
            <div className="schedule-tooltip schedule-tooltip--list">
                <div className="schedule-tooltip__title">
                    Các lịch học còn lại
                </div>

                <div className="schedule-tooltip__list">
                    {hiddenList.map((item) => {
                        const subject =
                            item.courseOffering?.teacherSubject?.subject
                                ?.name || "—";
                        const teacher =
                            item.courseOffering?.teacherSubject?.teacher?.user
                                ?.name || "—";

                        return (
                            <div
                                key={item.id}
                                className="schedule-tooltip__item"
                            >
                                <div className="schedule-tooltip__item-title">
                                    {subject}
                                </div>
                                <div className="schedule-tooltip__item-sub">
                                    {teacher} • Tiết {item.lessonStart}-
                                    {item.lessonEnd}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        return (
            <div className="schedule-day-view">
                <div className="schedule-day-view__header">
                    <div>
                        <div className="schedule-day-view__title">
                            {value.format("DD/MM/YYYY")}
                        </div>
                        <div className="schedule-day-view__subtitle">
                            {value.format("dddd")}
                        </div>
                    </div>

                    <div className="schedule-day-view__actions">
                        <button
                            type="button"
                            className="schedule-calendar__nav-btn"
                            onClick={() =>
                                setValue((prev) => prev.subtract(1, "day"))
                            }
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            className="schedule-calendar__nav-btn"
                            onClick={() => setValue(dayjs())}
                        >
                            Hôm nay
                        </button>
                        <button
                            type="button"
                            className="schedule-calendar__nav-btn"
                            onClick={() =>
                                setValue((prev) => prev.add(1, "day"))
                            }
                        >
                            ›
                        </button>
                    </div>
                </div>

                {daySchedules.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Ngày này chưa có lịch học"
                    />
                ) : (
                    <div className="schedule-day-view__list">
                        {daySchedules.map((item) => {
                            const subject =
                                item.courseOffering?.teacherSubject?.subject
                                    ?.name || "—";
                            const subjectCode =
                                item.courseOffering?.teacherSubject?.subject
                                    ?.code || "—";
                            const teacher =
                                item.courseOffering?.teacherSubject?.teacher
                                    ?.user?.name || "—";
                            const adminClass =
                                item.courseOffering?.adminClass?.name || "—";
                            const room = item.room?.name || "—";
                            const colorClass = getColorClass(
                                `${subjectCode}-${subject}`,
                            );

                            return (
                                <Tooltip
                                    key={item.id}
                                    title={renderTooltipContent(item)}
                                    placement="topLeft"
                                    overlayClassName="schedule-tooltip-overlay"
                                >
                                    <div
                                        className={classNames(
                                            "schedule-day-view__item",
                                            colorClass,
                                        )}
                                    >
                                        <div className="schedule-day-view__bar" />

                                        <div className="schedule-day-view__content">
                                            <div className="schedule-day-view__top">
                                                <div className="schedule-day-view__subject">
                                                    {subject}
                                                </div>
                                                <div className="schedule-day-view__time">
                                                    Tiết {item.lessonStart}-
                                                    {item.lessonEnd}
                                                </div>
                                            </div>

                                            <div className="schedule-day-view__meta">
                                                <span>
                                                    Mã môn: {subjectCode}
                                                </span>
                                                <span>
                                                    Giảng viên: {teacher}
                                                </span>
                                            </div>

                                            <div className="schedule-day-view__meta">
                                                <span>Lớp: {adminClass}</span>
                                                <span>Phòng: {room}</span>
                                            </div>

                                            <div className="schedule-day-view__range">
                                                Áp dụng:{" "}
                                                {dayjs(item.startDate).format(
                                                    "DD/MM/YYYY",
                                                )}{" "}
                                                -{" "}
                                                {dayjs(item.endDate).format(
                                                    "DD/MM/YYYY",
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Tooltip>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card
            className="schedule-calendar-card"
            loading={loading}
            style={{ marginBottom: 16 }}
            title="Lịch học"
        >
            <div className="schedule-calendar">
                <div className="schedule-calendar__topbar">
                    <div className="schedule-calendar__header">
                        <div className="schedule-calendar__header-title">
                            {viewMode === "month"
                                ? `Tháng ${value.format("MM/YYYY")}`
                                : `Ngày ${value.format("DD/MM/YYYY")}`}
                        </div>

                        <div className="schedule-calendar__header-actions">
                            <Segmented<ViewMode>
                                value={viewMode}
                                options={[
                                    { label: "Tháng", value: "month" },
                                    { label: "Ngày", value: "day" },
                                ]}
                                onChange={(val) => setViewMode(val)}
                            />

                            {viewMode === "month" && (
                                <>
                                    <button
                                        type="button"
                                        className="schedule-calendar__nav-btn"
                                        onClick={() =>
                                            setValue((prev) =>
                                                prev.subtract(1, "month"),
                                            )
                                        }
                                    >
                                        ‹
                                    </button>

                                    <Select
                                        value={value.month()}
                                        options={monthOptions}
                                        className="schedule-calendar__month-select"
                                        popupMatchSelectWidth={false}
                                        onChange={(month) =>
                                            setValue((prev) =>
                                                prev.month(month),
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="schedule-calendar__nav-btn"
                                        onClick={() =>
                                            setValue((prev) =>
                                                prev.add(1, "month"),
                                            )
                                        }
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {viewMode === "month" ? (
                    <>
                        <div className="schedule-calendar__weekdays">
                            {weekDayLabels.map((label) => (
                                <div
                                    key={label}
                                    className="schedule-calendar__weekday"
                                >
                                    {label}
                                </div>
                            ))}
                        </div>

                        <div className="schedule-calendar__grid">
                            {rows.map((week, weekIndex) => (
                                <div
                                    key={`week-${weekIndex}`}
                                    className="schedule-calendar__week-row"
                                >
                                    {week.map(({ date, inCurrentMonth }) => {
                                        const list = getListData(date);
                                        const isToday = dayjs().isSame(
                                            date,
                                            "date",
                                        );
                                        const isSelected = value.isSame(
                                            date,
                                            "date",
                                        );

                                        return (
                                            <div
                                                key={date.format("YYYY-MM-DD")}
                                                className={classNames(
                                                    "schedule-calendar__cell",
                                                    {
                                                        "is-today": isToday,
                                                        "is-selected":
                                                            isSelected,
                                                        "is-outside":
                                                            !inCurrentMonth,
                                                    },
                                                )}
                                                onClick={() => {
                                                    setValue(date);
                                                    setViewMode("day");
                                                }}
                                            >
                                                <div className="schedule-calendar__day">
                                                    {date.date()}
                                                </div>

                                                <div className="schedule-calendar__events">
                                                    {list
                                                        .slice(0, 2)
                                                        .map((item) => {
                                                            const subject =
                                                                item
                                                                    .courseOffering
                                                                    ?.teacherSubject
                                                                    ?.subject
                                                                    ?.name ||
                                                                "—";
                                                            const subjectCode =
                                                                item
                                                                    .courseOffering
                                                                    ?.teacherSubject
                                                                    ?.subject
                                                                    ?.code ||
                                                                "";
                                                            const teacher =
                                                                item
                                                                    .courseOffering
                                                                    ?.teacherSubject
                                                                    ?.teacher
                                                                    ?.user
                                                                    ?.name ||
                                                                "—";

                                                            const colorClass =
                                                                getColorClass(
                                                                    `${subjectCode}-${subject}`,
                                                                );

                                                            return (
                                                                <Tooltip
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    title={renderTooltipContent(
                                                                        item,
                                                                    )}
                                                                    placement="topLeft"
                                                                    overlayClassName="schedule-tooltip-overlay"
                                                                >
                                                                    <div
                                                                        className={classNames(
                                                                            "schedule-calendar__event",
                                                                            colorClass,
                                                                        )}
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                        }}
                                                                    >
                                                                        <div className="schedule-calendar__event-bar" />
                                                                        <div className="schedule-calendar__event-content">
                                                                            <div className="schedule-calendar__subject">
                                                                                {
                                                                                    subject
                                                                                }
                                                                            </div>
                                                                            <div className="schedule-calendar__teacher">
                                                                                {
                                                                                    teacher
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Tooltip>
                                                            );
                                                        })}

                                                    {list.length > 2 && (
                                                        <div className="schedule-calendar__more-wrap">
                                                            <Tooltip
                                                                title={renderMoreTooltipContent(
                                                                    list,
                                                                )}
                                                                placement="topRight"
                                                                overlayClassName="schedule-tooltip-overlay"
                                                            >
                                                                <span
                                                                    className="schedule-calendar__more-badge"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                >
                                                                    +
                                                                    {list.length -
                                                                        2}
                                                                </span>
                                                            </Tooltip>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    renderDayView()
                )}
            </div>

            {!loading && schedules.length === 0 && (
                <div style={{ marginTop: 12 }}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có lịch học"
                    />
                </div>
            )}
        </Card>
    );
};

export default ScheduleCalendar;
