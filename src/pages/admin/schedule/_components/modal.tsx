import {
    createScheduleAPI,
    getCourseOfferingAPI,
    getRoomsAPI,
} from "@/services/api";
import {
    ProForm,
    ProFormDigit,
    ProFormSelect,
} from "@ant-design/pro-components";
import {
    Col,
    DatePicker,
    Form,
    Modal,
    Row,
    Typography,
    notification,
    theme,
} from "antd";
import ColumnGroup from "antd/es/table/ColumnGroup";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    fetchData: () => void;
}

interface IOptionSelect {
    label: string;
    value: string | number;
    code?: string;
    subjectName?: string;
    teacherName?: string;
    adminClassName?: string;
    semesterLabel?: string;
    year?: string | number;
    hasSchedule?: boolean;
}

const MAX_DAYS = 3;

const dayOfWeekOptions = [
    { shortLabel: "T2", fullLabel: "Thứ hai", value: 2 },
    { shortLabel: "T3", fullLabel: "Thứ ba", value: 3 },
    { shortLabel: "T4", fullLabel: "Thứ tư", value: 4 },
    { shortLabel: "T5", fullLabel: "Thứ năm", value: 5 },
    { shortLabel: "T6", fullLabel: "Thứ sáu", value: 6 },
    { shortLabel: "T7", fullLabel: "Thứ bảy", value: 7 },
    { shortLabel: "Cn", fullLabel: "Chủ nhật", value: 8 },
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

const semesterMap: Record<string, string> = {
    HK1: "Học kỳ 1",
    HK2: "Học kỳ 2",
    SUMMER: "Học kỳ hè",
};

const ModalSchedule = ({ openModal, setOpenModal, fetchData }: IProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();

    const selectedDays: number[] = Form.useWatch("daysOfWeek", form) || [];

    const selectedDayText = useMemo(() => {
        if (!selectedDays.length) return "";
        return selectedDays
            .slice()
            .sort((a, b) => a - b)
            .map((day) => dayLabelMap[day])
            .join(", ");
    }, [selectedDays]);

    const handleClose = () => {
        form.resetFields();
        setOpenModal(false);
    };

    const fetchCourseOfferingOptions = useCallback(
        async (keyword: string): Promise<IOptionSelect[]> => {
            const query = `current=1&pageSize=20${keyword ? `&search=${encodeURIComponent(keyword)}` : ""}`;
            const res = await getCourseOfferingAPI(query);

            return (
                res?.data?.result?.map((item: any) => {
                    const code = item?.code || "—";
                    const subjectName =
                        item?.teacherSubject?.subject?.name ||
                        "Chưa có môn học";
                    const teacherName =
                        item?.teacherSubject?.teacher?.user?.name ||
                        "Chưa có giảng viên";
                    const adminClassName =
                        item?.adminClass?.name || "Không có lớp hành chính";
                    const semesterLabel = item?.term?.semester
                        ? semesterMap[item.term.semester] || item.term.semester
                        : "Chưa có học kỳ";
                    const year = item?.term?.year || "";
                    const hasSchedule =
                        item?.hasSchedule ?? (item?.schedules?.length ?? 0) > 0;

                    return {
                        value: item.id,
                        label: `${code} • ${subjectName}`,
                        code,
                        subjectName,
                        teacherName,
                        adminClassName,
                        semesterLabel,
                        year,
                        hasSchedule,
                    };
                }) || []
            );
        },
        [],
    );

    const fetchRoomOptions = useCallback(
        async (keyword: string): Promise<IOptionSelect[]> => {
            const query = `current=1&pageSize=20${keyword ? `&search=${encodeURIComponent(keyword)}` : ""}`;
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

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const selectedDaysValue: number[] = values.daysOfWeek || [];

            const slots = selectedDaysValue.map((day: number) => ({
                dayOfWeek: Number(day),
                roomId: values.roomId ? Number(values.roomId) : undefined,
                lessonStart: Number(values.lessonStart),
                lessonEnd: Number(values.lessonEnd),
            }));

            const payload = {
                courseOfferingId: Number(values.courseOfferingId),
                startDate: values.dateRange?.[0]
                    ? dayjs(values.dateRange[0]).format("YYYY-MM-DD")
                    : undefined,
                endDate: values.dateRange?.[1]
                    ? dayjs(values.dateRange[1]).format("YYYY-MM-DD")
                    : undefined,
                slots,
            };

            const res = await createScheduleAPI(payload);

            notification.success({
                message: "Tạo lịch học thành công",
                description:
                    res?.data?.totalSessions != null
                        ? `Đã tạo ${res?.data?.totalSchedules ?? slots.length} lịch, tổng ${res?.data?.totalSessions} buổi trong kỳ`
                        : `Đã tạo lịch cho ${selectedDaysValue.length} thứ trong tuần`,
            });

            handleClose();
            fetchData();
            return res;
        } catch (error: any) {
            const errMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Tạo lịch học thất bại";

            notification.error({
                message: "Tạo lịch học thất bại",
                description: Array.isArray(errMessage)
                    ? errMessage[0]
                    : errMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo lịch học"
            open={openModal}
            onCancel={handleClose}
            onOk={handleSubmit}
            okText="Tạo mới"
            cancelText="Hủy"
            confirmLoading={loading}
            width={760}
            destroyOnClose
            maskClosable={false}
        >
            <ProForm
                form={form}
                submitter={false}
                layout="vertical"
                initialValues={{
                    daysOfWeek: [2],
                    lessonStart: 1,
                    lessonEnd: 3,
                }}
            >
                <Row gutter={[16, 4]}>
                    <Col span={24}>
                        <ProFormSelect
                            name="courseOfferingId"
                            label="Lớp học phần"
                            placeholder="Chọn lớp học phần"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn lớp học phần",
                                },
                            ]}
                            request={async ({ keyWords }) =>
                                await fetchCourseOfferingOptions(keyWords || "")
                            }
                            fieldProps={{
                                showSearch: true,
                                filterOption: false,
                                optionFilterProp: "label",
                                styles: {
                                    popup: {
                                        root: {
                                            maxHeight: 360,
                                        },
                                    },
                                },
                                optionRender: (option: any) => {
                                    const data = option?.data || {};

                                    return (
                                        <div
                                            style={{
                                                lineHeight: 1.45,
                                                padding: "4px 0",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    flexWrap: "wrap",
                                                    marginBottom: 2,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        color: token.colorPrimary,
                                                    }}
                                                >
                                                    {data?.code || "—"}
                                                </div>

                                                {data?.hasSchedule && (
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            color: "#389e0d",
                                                            background:
                                                                "#f6ffed",
                                                            border: "1px solid #b7eb8f",
                                                            borderRadius: 999,
                                                            padding: "2px 8px",
                                                        }}
                                                    >
                                                        Đã tạo lịch
                                                    </span>
                                                )}
                                            </div>

                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    color: token.colorText,
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {data?.subjectName}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: token.colorTextSecondary,
                                                    marginBottom: 2,
                                                }}
                                            >
                                                GV: {data?.teacherName}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: token.colorTextTertiary,
                                                }}
                                            >
                                                {data?.adminClassName} •{" "}
                                                {data?.semesterLabel}
                                                {data?.year
                                                    ? ` ${data.year}`
                                                    : ""}
                                            </div>
                                        </div>
                                    );
                                },
                            }}
                        />
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            name="dateRange"
                            label="Khoảng thời gian học"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn khoảng thời gian",
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
                                                "Chỉ được chọn tối đa 3 thứ trong tuần",
                                            );
                                        }
                                    },
                                },
                            ]}
                        >
                            <div
                                style={{
                                    padding: 18,
                                    borderRadius: 18,
                                    border: `1px solid ${token.colorBorderSecondary}`,
                                    background: "#f8fafc",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 14,
                                    }}
                                >
                                    {dayOfWeekOptions.map((day) => {
                                        const active = selectedDays.includes(
                                            day.value,
                                        );

                                        return (
                                            <button
                                                key={day.value}
                                                type="button"
                                                onClick={() =>
                                                    handleToggleDay(day.value)
                                                }
                                                style={{
                                                    width: 54,
                                                    height: 54,
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
                                                    fontSize: 16,
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease",
                                                    boxShadow: active
                                                        ? "0 8px 18px rgba(22,119,255,0.22)"
                                                        : "none",
                                                }}
                                            >
                                                {day.shortLabel}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div style={{ marginTop: 14 }}>
                                    <Text type="secondary">
                                        Chọn tối đa {MAX_DAYS} thứ trong tuần
                                    </Text>

                                    {selectedDays.length > 0 && (
                                        <div style={{ marginTop: 6 }}>
                                            <Text>
                                                Đã chọn:{" "}
                                                <strong>
                                                    {selectedDayText}
                                                </strong>
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={24}>
                        <ProFormSelect
                            name="roomId"
                            label="Phòng học"
                            placeholder="Chọn phòng học"
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
                            placeholder="Nhập tiết bắt đầu"
                            min={1}
                            max={15}
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
                            placeholder="Nhập tiết kết thúc"
                            min={1}
                            max={15}
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

                                        if (
                                            value == null ||
                                            value === "" ||
                                            start == null ||
                                            start === ""
                                        ) {
                                            return Promise.resolve();
                                        }

                                        if (Number(value) <= Number(start)) {
                                            return Promise.reject(
                                                new Error(
                                                    "Tiết kết thúc phải lớn hơn tiết bắt đầu",
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
            </ProForm>
        </Modal>
    );
};

export default ModalSchedule;
