import { DebounceSelect } from "@/components/share/debouce.select";
import {
    checkRoomAvailableAPI,
    createCourseOfferingAPI,
    createScheduleAPI,
    getRoomsAPI,
} from "@/services/api";
import {
    ModalForm,
    ProForm,
    ProFormDependency,
    ProFormDigit,
    ProFormSelect,
} from "@ant-design/pro-components";
import {
    Alert,
    Col,
    DatePicker,
    Form,
    List,
    Row,
    Tag,
    Typography,
    message,
    notification,
    theme,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import useCourseOfferingHook from "../_hooks/hookcourse";
import { LESSON_TIME_MAP } from "@/types/constans";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable: () => void;
}

interface IOptionSelect {
    label: string;
    value: string | number;
}

const MAX_DAYS = 3;

const dayOfWeekOptions = [
    { shortLabel: "T2", fullLabel: "Thứ hai", value: 2 },
    { shortLabel: "T3", fullLabel: "Thứ ba", value: 3 },
    { shortLabel: "T4", fullLabel: "Thứ tư", value: 4 },
    { shortLabel: "T5", fullLabel: "Thứ năm", value: 5 },
    { shortLabel: "T6", fullLabel: "Thứ sáu", value: 6 },
    { shortLabel: "T7", fullLabel: "Thứ bảy", value: 7 },
    { shortLabel: "CN", fullLabel: "Chủ nhật", value: 8 },
];

const dayLabelMap: Record<number, string> = {
    2: "Thứ hai",
    3: "Thứ ba",
    4: "Thứ tư",
    5: "Thứ năm",
    6: "Thứ sáu",
    7: "Thứ bảy",
    8: "Chủ nhật",
};

const ModalCourseOfferingSchedule = ({
    openModal,
    setOpenModal,
    reloadTable,
}: IProps) => {
    const [form] = Form.useForm();
    const { token } = theme.useToken();

    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [roomStatus, setRoomStatus] = useState<any[]>([]);

    const {
        fetchTeacherSubjectOptions,
        fetchTermOptions,
        fetchAdminClassOptions,
    } = useCourseOfferingHook();

    const selectedDays: number[] = Form.useWatch("daysOfWeek", form) || [];
    const roomId = Form.useWatch("roomId", form);
    const lessonStart = Form.useWatch("lessonStart", form);
    const lessonEnd = Form.useWatch("lessonEnd", form);
    const dateRange = Form.useWatch("dateRange", form);

    const selectedDayText = useMemo(() => {
        if (!selectedDays.length) return "";

        return selectedDays
            .slice()
            .sort((a, b) => a - b)
            .map((day) => dayLabelMap[day])
            .join(", ");
    }, [selectedDays]);
    const lessonRangeText = useMemo(() => {
        if (!lessonStart || !lessonEnd) return "";

        const start = LESSON_TIME_MAP[Number(lessonStart)];
        const end = LESSON_TIME_MAP[Number(lessonEnd)];

        if (!start || !end) return "";

        return `${start.start} - ${end.end}`;
    }, [lessonStart, lessonEnd]);
    const selectedLessonRange = useMemo(() => {
        if (!lessonStart || !lessonEnd) return [];

        const start = Number(lessonStart);
        const end = Number(lessonEnd);

        if (end < start) return [];

        return Array.from({ length: end - start + 1 }, (_, index) => {
            const lesson = start + index;

            return {
                lesson,
                startTime: LESSON_TIME_MAP[lesson]?.start,
                endTime: LESSON_TIME_MAP[lesson]?.end,
            };
        });
    }, [lessonStart, lessonEnd]);

    const handleClose = () => {
        setOpenModal(false);
        setRoomStatus([]);
        form.resetFields();
    };

    const fetchRoomOptions = useCallback(
        async (keyword: string): Promise<IOptionSelect[]> => {
            const query = `current=1&pageSize=20${
                keyword ? `&search=${encodeURIComponent(keyword)}` : ""
            }`;

            const res = await getRoomsAPI(query);

            return (
                res?.data?.result?.map((item: any) => ({
                    label: [item?.code, item?.name].filter(Boolean).join(" • "),
                    value: item?.id,
                })) || []
            );
        },
        [],
    );

    const handleToggleDay = (dayValue: number) => {
        const currentDays: number[] = form.getFieldValue("daysOfWeek") || [];
        const existed = currentDays.includes(dayValue);

        if (existed) {
            form.setFieldValue(
                "daysOfWeek",
                currentDays.filter((item) => item !== dayValue),
            );
            return;
        }

        if (currentDays.length >= MAX_DAYS) {
            notification.warning({
                message: "Chỉ được chọn tối đa 3 thứ trong tuần",
            });
            return;
        }

        form.setFieldValue("daysOfWeek", [...currentDays, dayValue].sort());
    };

    const checkRoomStatus = useCallback(async () => {
        if (
            !roomId ||
            !lessonStart ||
            !lessonEnd ||
            !selectedDays.length ||
            !dateRange?.[0] ||
            !dateRange?.[1]
        ) {
            setRoomStatus([]);
            return;
        }

        if (Number(lessonEnd) < Number(lessonStart)) {
            setRoomStatus([]);
            return;
        }

        try {
            setChecking(true);

            const query = new URLSearchParams({
                roomId: String(roomId),
                lessonStart: String(lessonStart),
                lessonEnd: String(lessonEnd),
                startDate: dayjs(dateRange[0]).format("YYYY-MM-DD"),
                endDate: dayjs(dateRange[1]).format("YYYY-MM-DD"),
                daysOfWeek: selectedDays.join(","),
            }).toString();

            const res = await checkRoomAvailableAPI(query);

            setRoomStatus(res?.data || []);
        } catch {
            setRoomStatus([]);
        } finally {
            setChecking(false);
        }
    }, [roomId, lessonStart, lessonEnd, selectedDays, dateRange]);

    useEffect(() => {
        const timer = setTimeout(() => {
            checkRoomStatus();
        }, 400);

        return () => clearTimeout(timer);
    }, [checkRoomStatus]);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            if (roomStatus.some((item) => !item.available)) {
                message.error("Phòng đã bị trùng lịch, vui lòng chọn lại");
                return false;
            }

            const coursePayload = {
                teacherSubjectId: values?.teacherSubject?.value,
                termId: values?.term?.value,
                adminClassId: values?.adminClass?.value ?? null,
                maxStudents: values?.maxStudents,
            };

            const courseRes = await createCourseOfferingAPI(coursePayload);

            const courseOfferingId =
                courseRes?.data?.id ||
                courseRes?.data?.data?.id ||
                courseRes?.data?.result?.id;

            if (!courseOfferingId) {
                throw new Error("Không lấy được ID lớp học phần vừa tạo");
            }

            const slots = values.daysOfWeek.map((day: number) => ({
                dayOfWeek: Number(day),
                roomId: Number(values.roomId),
                lessonStart: Number(values.lessonStart),
                lessonEnd: Number(values.lessonEnd),
            }));

            const schedulePayload = {
                courseOfferingId: Number(courseOfferingId),
                startDate: dayjs(values.dateRange[0]).format("YYYY-MM-DD"),
                endDate: dayjs(values.dateRange[1]).format("YYYY-MM-DD"),
                slots,
            };

            await createScheduleAPI(schedulePayload);

            message.success("Tạo lớp học phần và lịch học thành công");
            handleClose();
            reloadTable();

            return true;
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Tạo lớp học phần thất bại",
            );

            return false;
        } finally {
            setLoading(false);
        }
    };

    const hasBusyRoom = roomStatus.some((item) => !item.available);

    return (
        <ModalForm
            form={form}
            title="Thêm lớp học phần và lịch học"
            open={openModal}
            width={1050}
            onFinish={handleSubmit}
            layout="vertical"
            submitter={{
                searchConfig: {
                    submitText: "Tạo mới",
                    resetText: "Hủy",
                },
                submitButtonProps: {
                    loading,
                    disabled: hasBusyRoom,
                },
                resetButtonProps: {
                    onClick: handleClose,
                },
            }}
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                onCancel: handleClose,
            }}
            initialValues={{
                daysOfWeek: [2],
                lessonStart: 1,
                lessonEnd: 3,
                maxStudents: 60,
            }}
        >
            <Row gutter={[20, 16]}>
                <Col xs={24} md={14}>
                    <Row gutter={[16, 8]}>
                        <Col span={24}>
                            <ProForm.Item
                                name="teacherSubject"
                                label="Giảng viên - Môn học"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Vui lòng chọn giảng viên và môn học",
                                    },
                                ]}
                            >
                                <DebounceSelect
                                    allowClear
                                    showSearch
                                    labelInValue
                                    placeholder="Chọn giảng viên - môn học"
                                    fetchOptions={fetchTeacherSubjectOptions}
                                    style={{ width: "100%" }}
                                    onChange={() => {
                                        form.setFieldValue(
                                            "adminClass",
                                            undefined,
                                        );
                                    }}
                                />
                            </ProForm.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <ProForm.Item
                                name="term"
                                label="Học kỳ"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn học kỳ",
                                    },
                                ]}
                            >
                                <DebounceSelect
                                    allowClear
                                    showSearch
                                    labelInValue
                                    placeholder="Chọn học kỳ"
                                    fetchOptions={fetchTermOptions}
                                    style={{ width: "100%" }}
                                    onChange={() => {
                                        form.setFieldValue(
                                            "adminClass",
                                            undefined,
                                        );
                                    }}
                                />
                            </ProForm.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <ProFormDigit
                                name="maxStudents"
                                label="Sĩ số tối đa"
                                min={1}
                                fieldProps={{
                                    precision: 0,
                                    style: { width: "100%" },
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập sĩ số tối đa",
                                    },
                                ]}
                            />
                        </Col>

                        <Col span={24}>
                            <ProFormDependency
                                name={["term", "teacherSubject"]}
                            >
                                {({ term, teacherSubject }) => {
                                    const termId = term?.value;
                                    const teacherSubjectId =
                                        teacherSubject?.value;
                                    const disabled =
                                        !termId || !teacherSubjectId;

                                    return (
                                        <ProForm.Item
                                            name="adminClass"
                                            label="Lớp hành chính"
                                            extra={
                                                disabled
                                                    ? "Vui lòng chọn học kỳ và giảng viên - môn học trước"
                                                    : undefined
                                            }
                                        >
                                            <DebounceSelect
                                                allowClear
                                                showSearch
                                                labelInValue
                                                placeholder="Chọn lớp hành chính"
                                                fetchOptions={(search) =>
                                                    fetchAdminClassOptions(
                                                        search,
                                                        termId,
                                                        teacherSubjectId,
                                                    )
                                                }
                                                style={{ width: "100%" }}
                                                disabled={disabled}
                                            />
                                        </ProForm.Item>
                                    );
                                }}
                            </ProFormDependency>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="dateRange"
                                label="Khoảng thời gian học"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Vui lòng chọn khoảng thời gian học",
                                    },
                                ]}
                            >
                                <RangePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="daysOfWeek"
                                label="Chọn thứ học trong tuần"
                                rules={[
                                    {
                                        validator: async (_, value) => {
                                            if (!value || value.length === 0) {
                                                throw new Error(
                                                    "Vui lòng chọn ít nhất 1 thứ",
                                                );
                                            }

                                            if (value.length > MAX_DAYS) {
                                                throw new Error(
                                                    "Chỉ được chọn tối đa 3 thứ",
                                                );
                                            }
                                        },
                                    },
                                ]}
                            >
                                <div
                                    style={{
                                        padding: 16,
                                        borderRadius: 16,
                                        border: `1px solid ${token.colorBorderSecondary}`,
                                        background: "#f8fafc",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 12,
                                        }}
                                    >
                                        {dayOfWeekOptions.map((day) => {
                                            const active =
                                                selectedDays.includes(
                                                    day.value,
                                                );

                                            return (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggleDay(
                                                            day.value,
                                                        )
                                                    }
                                                    style={{
                                                        width: 52,
                                                        height: 52,
                                                        borderRadius: "50%",
                                                        border: active
                                                            ? `1px solid ${token.colorPrimary}`
                                                            : `1px solid ${token.colorBorder}`,
                                                        background: active
                                                            ? token.colorPrimary
                                                            : "#eef2f6",
                                                        color: active
                                                            ? "#fff"
                                                            : token.colorText,
                                                        fontWeight: 700,
                                                        fontSize: 15,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {day.shortLabel}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {selectedDays.length > 0 && (
                                        <div style={{ marginTop: 12 }}>
                                            <Text>
                                                Đã chọn:{" "}
                                                <strong>
                                                    {selectedDayText}
                                                </strong>
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <ProFormSelect
                                name="roomId"
                                label="Phòng học"
                                placeholder="Chọn phòng học"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn phòng học",
                                    },
                                ]}
                                request={async ({ keyWords }) =>
                                    await fetchRoomOptions(keyWords || "")
                                }
                                fieldProps={{
                                    showSearch: true,
                                    filterOption: false,
                                    allowClear: true,
                                }}
                            />
                        </Col>

                        <Col xs={24} md={12}>
                            <ProFormDigit
                                name="lessonStart"
                                label="Tiết bắt đầu"
                                min={1}
                                max={11}
                                fieldProps={{
                                    precision: 0,
                                    style: { width: "100%" },
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tiết bắt đầu",
                                    },
                                ]}
                            />
                        </Col>

                        <Col xs={24} md={12}>
                            <ProFormDigit
                                name="lessonEnd"
                                label="Tiết kết thúc"
                                min={1}
                                max={11}
                                fieldProps={{
                                    precision: 0,
                                    style: { width: "100%" },
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tiết kết thúc",
                                    },
                                    ({ getFieldValue }: any) => ({
                                        validator(_: any, value: any) {
                                            const start =
                                                getFieldValue("lessonStart");

                                            if (!value || !start) {
                                                return Promise.resolve();
                                            }

                                            if (Number(value) < Number(start)) {
                                                return Promise.reject(
                                                    new Error(
                                                        "Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu",
                                                    ),
                                                );
                                            }

                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            />
                        </Col>
                    </Row>
                </Col>

                <Col xs={24} md={10}>
                    <div
                        style={{
                            position: "sticky",
                            top: 0,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            borderRadius: 18,
                            padding: 16,
                            background: "#fff",
                            minHeight: 520,
                        }}
                    >
                        <div style={{ marginBottom: 12 }}>
                            <Text strong style={{ fontSize: 16 }}>
                                Phòng và khung giờ
                            </Text>
                            <div>
                                <Text type="secondary">
                                    Kiểm tra phòng theo thứ, tiết và thời gian.
                                </Text>
                            </div>
                        </div>

                        <div
                            style={{
                                padding: 12,
                                borderRadius: 14,
                                background: "#f8fafc",
                                marginBottom: 14,
                            }}
                        >
                            <Text strong>Tiết dạy đã chọn</Text>

                            {selectedLessonRange.length === 0 ? (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">
                                        Chưa chọn tiết học hợp lệ.
                                    </Text>
                                </div>
                            ) : (
                                <>
                                    <Alert
                                        type="info"
                                        showIcon
                                        message={`Khung giờ học: ${lessonRangeText}`}
                                    />
                                    <List
                                        size="small"
                                        style={{ marginTop: 8 }}
                                        dataSource={selectedLessonRange}
                                        renderItem={(item) => (
                                            <List.Item
                                                style={{
                                                    padding: "8px 0",
                                                    borderBlockEnd:
                                                        "1px dashed #e5e7eb",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Text strong>
                                                        Tiết {item.lesson}
                                                    </Text>

                                                    <Tag color="blue">
                                                        {item.startTime} -{" "}
                                                        {item.endTime}
                                                    </Tag>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </>
                            )}
                        </div>

                        <Text strong>Trạng thái phòng</Text>

                        {!roomId ? (
                            <div style={{ marginTop: 10 }}>
                                <Alert
                                    type="warning"
                                    showIcon
                                    message="Chưa chọn phòng"
                                    description="Chọn phòng, thứ học, khoảng thời gian và tiết học để kiểm tra."
                                />
                            </div>
                        ) : (
                            <List
                                style={{ marginTop: 10 }}
                                loading={checking}
                                dataSource={roomStatus}
                                locale={{
                                    emptyText:
                                        "Chưa đủ dữ liệu hoặc chưa có kết quả kiểm tra",
                                }}
                                renderItem={(item: any) => (
                                    <List.Item
                                        style={{
                                            padding: "12px 0",
                                        }}
                                    >
                                        <div style={{ width: "100%" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                    gap: 10,
                                                }}
                                            >
                                                <Text strong>
                                                    {
                                                        dayLabelMap[
                                                            item.dayOfWeek
                                                        ]
                                                    }
                                                </Text>

                                                <Tag
                                                    color={
                                                        item.available
                                                            ? "success"
                                                            : "error"
                                                    }
                                                >
                                                    {item.available
                                                        ? "Còn phòng"
                                                        : "Đã có lịch"}
                                                </Tag>
                                            </div>

                                            <div style={{ marginTop: 6 }}>
                                                <Text type="secondary">
                                                    Tiết {item.lessonStart} -{" "}
                                                    {item.lessonEnd}
                                                </Text>
                                            </div>

                                            {!item.available &&
                                                item.conflict && (
                                                    <Alert
                                                        style={{
                                                            marginTop: 10,
                                                        }}
                                                        type="error"
                                                        showIcon
                                                        message="Trùng lịch"
                                                        description={`${
                                                            item.conflict
                                                                .courseCode ||
                                                            ""
                                                        } - ${
                                                            item.conflict
                                                                .subjectName ||
                                                            ""
                                                        }`}
                                                    />
                                                )}
                                        </div>
                                    </List.Item>
                                )}
                            />
                        )}

                        {hasBusyRoom && (
                            <Alert
                                style={{ marginTop: 12 }}
                                type="error"
                                showIcon
                                message="Có lịch bị trùng phòng"
                                description="Vui lòng đổi phòng, đổi thứ học hoặc đổi tiết học trước khi tạo."
                            />
                        )}
                    </div>
                </Col>
            </Row>
        </ModalForm>
    );
};

export default ModalCourseOfferingSchedule;
