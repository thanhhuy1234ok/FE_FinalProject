import { Form, Input, Modal, Switch, message } from "antd";
import { useEffect, useState } from "react";
import { createFacultyAPI } from "@/services/api"; // đổi path theo bạn

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataUpdate?: any | null; // nếu có => edit
    reloadTable?: () => void; // callback để reload list
}

const ModalFaculty = (props: IProps) => {
    const { openModal, setOpenModal, dataUpdate, reloadTable } = props;

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!openModal) return;

        if (dataUpdate) {
            form.setFieldsValue({
                name: dataUpdate.name,
                code: dataUpdate.code,
                description: dataUpdate.description,
                isActive: dataUpdate.isActive ?? true,
            });
        } else {
            // create mode
            form.resetFields();
            form.setFieldsValue({ isActive: true });
        }
    }, [openModal, dataUpdate, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (dataUpdate) {
                // await updateFacultyAPI(dataUpdate.id, values);
                message.success("Cập nhật khoa thành công!");
            } else {
                await createFacultyAPI(values);
                message.success("Tạo khoa thành công!");
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
            title={dataUpdate ? "Cập nhật khoa" : "Tạo khoa"}
            open={openModal}
            onCancel={() => setOpenModal(false)}
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
                initialValues={{ isActive: true }} // ✅ default true
            >
                <Form.Item
                    name="name"
                    label="Tên khoa"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập tên khoa!",
                        },
                    ]}
                >
                    <Input placeholder="VD: Khoa Công nghệ thông tin" />
                </Form.Item>

                <Form.Item name="code" label="Mã (tuỳ chọn)">
                    <Input placeholder="VD: IT" />
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

export default ModalFaculty;
