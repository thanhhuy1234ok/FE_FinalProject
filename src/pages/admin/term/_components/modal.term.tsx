import { createTermAPI } from "@/services/api";
import {
    ProForm,
    ProFormDatePicker,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
} from "@ant-design/pro-components";
import { Col, Form, Modal, Row, notification } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    fetchData: () => void;
}

const semesterOptions = [
    { label: "HK1", value: "HK1" },
    { label: "HK2", value: "HK2" },
    { label: "Học kỳ hè", value: "SUMMER" },
];

const ModalTerm = ({ openModal, setOpenModal, fetchData }: IProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        form.resetFields();
        setOpenModal(false);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                year: Number(values.year),
                semester: values.semester,
                startDate: values.startDate
                    ? dayjs(values.startDate).format("YYYY-MM-DD")
                    : undefined,
                endDate: values.endDate
                    ? dayjs(values.endDate).format("YYYY-MM-DD")
                    : undefined,
                isActive: values.isActive ?? true,
            };

            await createTermAPI(payload);

            notification.success({
                message: "Tạo kỳ học thành công",
            });

            handleClose();
            fetchData();
        } catch (error: any) {
            const errMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Tạo kỳ học thất bại";

            notification.error({
                message: "Tạo kỳ học thất bại",
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
            title="Tạo kỳ học"
            open={openModal}
            onCancel={handleClose}
            onOk={handleSubmit}
            okText="Tạo mới"
            cancelText="Hủy"
            confirmLoading={loading}
            width={600}
            destroyOnClose
        >
            <ProForm
                form={form}
                submitter={false}
                layout="vertical"
                initialValues={{
                    isActive: true,
                    year: dayjs().year(),
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormText
                            name="year"
                            label="Năm học"
                            placeholder="Nhập năm học"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập năm học",
                                },
                                {
                                    pattern: /^(19|20)\d{2}$/,
                                    message: "Năm học không hợp lệ",
                                },
                            ]}
                            fieldProps={{
                                maxLength: 4,
                            }}
                        />
                    </Col>

                    <Col span={12}>
                        <ProFormSelect
                            name="semester"
                            label="Học kỳ"
                            placeholder="Chọn học kỳ"
                            options={semesterOptions}
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn học kỳ",
                                },
                            ]}
                        />
                    </Col>

                    <Col span={12}>
                        <ProFormDatePicker
                            name="startDate"
                            label="Ngày bắt đầu"
                            placeholder="Chọn ngày bắt đầu"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn ngày bắt đầu",
                                },
                            ]}
                            fieldProps={{
                                format: "DD/MM/YYYY",
                                style: { width: "100%" },
                            }}
                        />
                    </Col>

                    <Col span={12}>
                        <ProFormDatePicker
                            name="endDate"
                            label="Ngày kết thúc"
                            placeholder="Chọn ngày kết thúc"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn ngày kết thúc",
                                },
                                {
                                    validator: async (_: any, value: any) => {
                                        const startDate =
                                            form.getFieldValue("startDate");

                                        if (!startDate || !value) return;

                                        if (
                                            dayjs(value).isBefore(
                                                dayjs(startDate),
                                                "day",
                                            )
                                        ) {
                                            throw new Error(
                                                "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
                                            );
                                        }
                                    },
                                },
                            ]}
                            fieldProps={{
                                format: "DD/MM/YYYY",
                                style: { width: "100%" },
                            }}
                        />
                    </Col>

                    <Col span={24}>
                        <ProFormSwitch name="isActive" label="Đang hoạt động" />
                    </Col>
                </Row>
            </ProForm>
        </Modal>
    );
};

export default ModalTerm;
