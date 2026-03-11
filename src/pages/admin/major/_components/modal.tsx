import { Form, Input, Modal, Switch, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { createMajorAPI } from "@/services/api";
import { DebounceSelect } from "@/components/share/debouce.select";

import useMajorHook from "../_hooks/major.hook";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataUpdate?: IMajor | null;
    reloadTable?: () => void;
}

const ModalMajor = (props: IProps) => {
    const { openModal, setOpenModal, dataUpdate, reloadTable } = props;
    const { departmentOptions } = useMajorHook();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const fetchDepartmentOptions = useCallback(async () => {
        return departmentOptions ?? [];
    }, [departmentOptions]);

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                name: dataUpdate.name,
                code: dataUpdate.code,
                isActive: dataUpdate.isActive,
            });
        } else {
            form.resetFields();
        }
    }, [dataUpdate, form, openModal]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const { deparment, ...rest } = values;
            const department_id = deparment.value;
            setLoading(true);

            const payload: any = {
                ...rest,
                department_id,
            };
            console.log(payload);
            if (dataUpdate?.id) {
                // await updateMajorAPI(dataUpdate.id, values);
                message.success("Cập nhật chuyên ngành thành công");
            } else {
                await createMajorAPI(payload);
                message.success("Tạo chuyên ngành thành công");
            }

            setOpenModal(false);
            form.resetFields();
            reloadTable?.();
        } catch (error) {
            message.error("Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={dataUpdate ? "Cập nhật chuyên ngành" : "Thêm chuyên ngành"}
            open={openModal}
            onCancel={() => setOpenModal(false)}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Tên chuyên ngành"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                    <Input placeholder="Ví dụ: Software Engineering" />
                </Form.Item>

                <Form.Item label="Mã chuyên ngành" name="code">
                    <Input placeholder="Ví dụ: SE" />
                </Form.Item>

                <Form.Item label="Bộ môn" name="deparment">
                    <DebounceSelect
                        allowClear
                        showSearch
                        labelInValue // ✅ QUAN TRỌNG
                        placeholder="Chọn bộ môn"
                        fetchOptions={fetchDepartmentOptions}
                        style={{ width: "100%" }}
                    />
                </Form.Item>

                <Form.Item
                    label="Trạng thái"
                    name="isActive"
                    valuePropName="checked"
                    initialValue={true}
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

export default ModalMajor;
