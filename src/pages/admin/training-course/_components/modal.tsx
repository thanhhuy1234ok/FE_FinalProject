import { createYearOfAdmissionAPI } from "@/services/api";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { useForm } from "antd/es/form/Form";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    refreshTable: () => void;
}

interface IFormValues {
    year: number;
    expectedGraduationYear: number;
    description: string;
}

const ModalCourse = (props: IProps) => {
    const { openModal, setOpenModal, refreshTable } = props;
    const [form] = useForm<IFormValues>();

    const handleCancel = () => {
        form.resetFields();
        setOpenModal(false);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const paload = {
                year: values.year,
                expectedGraduationYear: values.expectedGraduationYear,
                description: values.description,
            };

            // TODO: call API here
            const res = await createYearOfAdmissionAPI(paload);

            if (res && res.data) {
                message.success("Tạo năm học thành công!");
                form.resetFields();
                refreshTable();
                setOpenModal(false);
            } else {
                message.error("Tạo năm học thất bại!");
            }
        } catch (error) {
            console.log("Validate failed:", error);
        }
    };

    return (
        <Modal
            title="Tạo khóa học"
            centered
            open={openModal}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="Lưu"
            cancelText="Hủy"
            width={{
                xs: "90%",
                sm: "80%",
                md: "60%",
                lg: "50%",
                xl: "40%",
                xxl: "35%",
            }}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Năm nhập học"
                    name="year"
                    rules={[{ required: true, message: "Vui lòng nhập năm!" }]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        placeholder="VD: 2025"
                    />
                </Form.Item>

                <Form.Item
                    label="Năm tốt nghiệp dự kiến"
                    name="expectedGraduationYear"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập năm tốt nghiệp!",
                        },
                    ]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        placeholder="VD: 2029"
                    />
                </Form.Item>

                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={3} placeholder="VD: Khóa 25" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalCourse;
