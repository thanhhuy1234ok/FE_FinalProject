import { Form, Input, Modal, Switch, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { createDepartmentAPI } from "@/services/api";
import { DebounceSelect } from "@/components/share/debouce.select";
import facultyHook from "@/pages/admin/faculty/_hooks/hook";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataUpdate?: any | null;
    reloadTable?: () => void;
}

const ModalDepartment = (props: IProps) => {
    const { openModal, setOpenModal, dataUpdate, reloadTable } = props;
    const { facultyOptions } = facultyHook();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!openModal) return;

        if (dataUpdate) {
            form.setFieldsValue({
                name: dataUpdate.name ?? "",
                code: dataUpdate.code ?? "",
                description: dataUpdate.description ?? "",
                isActive: dataUpdate.isActive ?? true,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                name: "",
                code: "",
                description: "",
                isActive: true,
            });
        }
    }, [openModal, dataUpdate, form]);

    const fetchFacultysOptions = useCallback(async () => {
        return facultyOptions ?? [];
    }, [facultyOptions]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const facultyId = values.faculty.value;
            const payload: any = {
                name: values.name,
                code: values.code || undefined,
                description: values.description || undefined,
                isActive: values.isActive ?? true,
                facultyId,
            };

            if (dataUpdate) {
                // await updateDepartmentAPI(dataUpdate.id, payload);
                message.success("Cập nhật bộ môn thành công!");
            } else {
                await createDepartmentAPI(payload);
                message.success("Tạo bộ môn thành công!");
            }

            setOpenModal(false);
            form.resetFields();
            reloadTable?.();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={dataUpdate ? "Cập nhật bộ môn" : "Tạo bộ môn"}
            open={openModal}
            onCancel={() => {
                setOpenModal(false);
                form.resetFields();
            }}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={dataUpdate ? "Cập nhật" : "Tạo mới"}
            cancelText="Huỷ"
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                preserve={false}
                initialValues={{ isActive: true }}
            >
                <Form.Item
                    name="name"
                    label="Tên bộ môn"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập tên bộ môn!",
                        },
                    ]}
                >
                    <Input placeholder="VD: Bộ môn Công nghệ thông tin" />
                </Form.Item>

                <Form.Item name="code" label="Mã (tuỳ chọn)">
                    <Input placeholder="VD: IT" />
                </Form.Item>

                <Form.Item label="Khoa" name="faculty">
                    <DebounceSelect
                        allowClear
                        showSearch
                        labelInValue // ✅ QUAN TRỌNG
                        placeholder="Chọn Khoa"
                        fetchOptions={fetchFacultysOptions}
                        style={{ width: "100%" }}
                    />
                </Form.Item>

                <Form.Item name="description" label="Mô tả (tuỳ chọn)">
                    <Input.TextArea rows={3} placeholder="Mô tả ngắn..." />
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Trạng thái"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Tạm ngưng"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalDepartment;
