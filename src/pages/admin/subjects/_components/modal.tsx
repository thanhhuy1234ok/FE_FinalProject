import { DebounceSelect } from "@/components/share/debouce.select";
import { Form, Input, Modal, message } from "antd";
import { useCallback, useState } from "react";
import useSubjectHook from "../_hooks/subject.hook";
import { createSubjectAPI } from "@/services/api";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable?: () => void;
}

const ModalSubject = ({ openModal, setOpenModal, reloadTable }: IProps) => {
    const [form] = Form.useForm();
    const { departmentOptions } = useSubjectHook();
    const [loading, setLoading] = useState(false);

    const fetchDepartmentOptions = useCallback(async () => {
        return departmentOptions ?? [];
    }, [departmentOptions]);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const department_id = values.deparment?.value;

            const payload = {
                ...values,
                credit: +values.credit,
                department_id,
            };

            delete payload.deparment;

            const res = await createSubjectAPI(payload);

            if (res?.data) {
                message.success("Tạo môn học thành công");

                form.resetFields();
                setOpenModal(false);
                reloadTable?.();
            } else {
                message.error(res?.message || "Tạo môn học thất bại");
            }
        } catch (error: any) {
            message.error(error?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm môn học"
            open={openModal}
            onCancel={() => setOpenModal(false)}
            onOk={() => form.submit()}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label="Tên môn học"
                    name="name"
                    rules={[{ required: true, message: "Nhập tên môn học" }]}
                >
                    <Input placeholder="VD: Lập trình Java" />
                </Form.Item>

                <Form.Item
                    label="Mã môn học"
                    name="code"
                    rules={[{ required: true, message: "Nhập mã môn học" }]}
                >
                    <Input placeholder="VD: CS101" />
                </Form.Item>

                <Form.Item
                    label="Số tín chỉ"
                    name="credit"
                    rules={[{ required: true }]}
                >
                    <Input type="number" />
                </Form.Item>

                <Form.Item label="Bộ môn" name="deparment">
                    <DebounceSelect
                        allowClear
                        showSearch
                        labelInValue
                        placeholder="Chọn bộ môn"
                        fetchOptions={fetchDepartmentOptions}
                        style={{ width: "100%" }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalSubject;
