import {
    Form,
    Input,
    Modal,
    Select,
    Space,
    Button,
    DatePicker,
    InputNumber,
    message,
    notification,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
    createBulkCurriculumSubjectAPI,
    createCurriculumsAPI,
    previewCurriculumsAPI,
} from "@/services/api"; // ✅ dùng cái của bạn (nhớ sửa sang POST body)

interface Props {
    open: boolean;
    onClose: () => void;
    majorOptions: IOptionSelect[];
    yearOptions: IOptionSelect[];
    defaultYearOfAdmissionId?: number | null;
    onCreated?: () => void;
}

type FormValues = {
    majorId: number;
    yearOfAdmissionId: number;
    version: string;
    code: string;
    name: string;
    effective_from: dayjs.Dayjs;
    effective_to: dayjs.Dayjs;
    total_credits_required: number;
};

const ModalCourseCTDT = ({
    open,
    onClose,
    majorOptions,
    yearOptions,
    defaultYearOfAdmissionId,
    onCreated,
}: Props) => {
    const [form] = Form.useForm<FormValues>();
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);

    useEffect(() => {
        if (!open) return;

        form.setFieldsValue({
            majorId: majorOptions?.[0]?.value,
            yearOfAdmissionId:
                defaultYearOfAdmissionId ?? yearOptions?.[0]?.value,
            version: "v1",
            effective_from: dayjs("2026-09-01"),
            effective_to: dayjs("2029-09-01"),
            total_credits_required: 120,
        } as any);
    }, [open, defaultYearOfAdmissionId, majorOptions, yearOptions, form]);

    const handlePreview = async () => {
        try {
            const v = await form.validateFields([
                "majorId",
                "yearOfAdmissionId",
            ]);
            setLoadingPreview(true);

            const res = await previewCurriculumsAPI({
                majorId: v.majorId,
                yearOfAdmissionId: v.yearOfAdmissionId,
            });

            const payload = res?.data;

            form.setFieldsValue({
                code: payload?.code,
                name: payload?.name,
            });

            message.success("Đã preview và điền sẵn code/name.");
        } catch {
            // validate fail
        } finally {
            setLoadingPreview(false);
        }
    };

    const handClose = () => {
        form.resetFields();
        onClose();
    };
    const handleCreate = async () => {
        try {
            const v = await form.validateFields();
            setLoadingCreate(true);

            const payload = {
                majorId: v.majorId,
                yearOfAdmissionId: v.yearOfAdmissionId,
                code: v.code,
                name: v.name,
                version: v.version,
                effective_from: dayjs(v.effective_from).format("YYYY-MM-DD"),
                effective_to: dayjs(v.effective_to).format("YYYY-MM-DD"),
                total_credits_required: v.total_credits_required,
            };

            const res = await createCurriculumsAPI(payload);
            message.success(res.message || "Tạo CTĐT thành công!");
            onClose();
            form.resetFields();
        } catch (error: unknown) {
            const err = error as IBackendError;

            const errMessage = err?.message;

            notification.error({
                message: "Lỗi",
                description: Array.isArray(errMessage)
                    ? errMessage[0]
                    : errMessage || "Tạo CTĐT thất bại!",
            });
        } finally {
            setLoadingCreate(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={handClose}
            title="Tạo chương trình đào tạo (CTĐT)"
            width={760}
            destroyOnClose
            okText="Tạo mới"
            cancelText="Hủy"
            confirmLoading={loadingCreate}
            onOk={handleCreate}
        >
            <Form form={form} layout="vertical">
                <Space size={12} style={{ display: "flex" }} align="start">
                    <Form.Item
                        name="majorId"
                        label="Major"
                        rules={[{ required: true, message: "Chọn major" }]}
                        style={{ flex: 1 }}
                    >
                        <Select
                            options={majorOptions}
                            placeholder="Chọn major"
                        />
                    </Form.Item>

                    <Form.Item
                        name="yearOfAdmissionId"
                        label="Khóa / Year of Admission"
                        rules={[
                            { required: true, message: "Chọn khóa tuyển sinh" },
                        ]}
                        style={{ flex: 1 }}
                    >
                        <Select
                            options={yearOptions}
                            placeholder="Chọn khóa (VD: K25)"
                            showSearch
                            optionFilterProp="label"
                            disabled
                        />
                    </Form.Item>
                </Space>

                <Space size={12} style={{ display: "flex" }} align="start">
                    <Form.Item
                        name="effective_from"
                        label="Effective from"
                        rules={[
                            { required: true, message: "Chọn effective_from" },
                        ]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item
                        name="effective_to"
                        label="Effective to"
                        rules={[
                            { required: true, message: "Chọn effective_to" },
                        ]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item
                        name="total_credits_required"
                        label="Total credits"
                        rules={[
                            { required: true, message: "Nhập tổng tín chỉ" },
                        ]}
                        style={{ width: 170 }}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Space>

                {/* ✅ code & name full width */}
                <Form.Item
                    name="code"
                    label="Code"
                    rules={[{ required: true, message: "Code là bắt buộc" }]}
                >
                    <Input placeholder="VD: CURR-CNTT-K25-v1" size="large" />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Name là bắt buộc" }]}
                >
                    <Input
                        placeholder="VD: Chương trình đào tạo CNTT K25 (v1)"
                        size="large"
                    />
                </Form.Item>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                    }}
                >
                    <Button onClick={handlePreview} loading={loadingPreview}>
                        Preview (tạo sẵn code & name)
                    </Button>
                    <Button
                        onClick={() => {
                            form.resetFields();
                            // giữ default year nếu mở từ “Thêm CTĐT cho năm X”
                            form.setFieldsValue({
                                yearOfAdmissionId:
                                    defaultYearOfAdmissionId ??
                                    yearOptions?.[0]?.value,
                            } as any);
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ModalCourseCTDT;
