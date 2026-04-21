import { Form, message } from "antd";
import { DebounceSelect } from "@/components/share/debouce.select";
import {
    ModalForm,
    ProForm,
    ProFormDependency,
    ProFormDigit,
} from "@ant-design/pro-components";
import { createCourseOfferingAPI } from "@/services/api";
import useCourseOfferingHook from "../_hooks/hookcourse";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable: () => void;
    dataUpdate?: any;
}

const ModalCourseOffering = ({
    openModal,
    setOpenModal,
    reloadTable,
    dataUpdate,
}: IProps) => {
    const [form] = Form.useForm();

    const {
        fetchTeacherSubjectOptions,
        fetchTermOptions,
        fetchAdminClassOptions,
    } = useCourseOfferingHook();

    const handleClose = () => {
        setOpenModal(false);
        form.resetFields();
    };

    const handleSubmit = async (valuesForm: any) => {
        const payload = {
            teacherSubjectId: valuesForm?.teacherSubject?.value,
            termId: valuesForm?.term?.value,
            adminClassId: valuesForm?.adminClass?.value ?? null,
            maxStudents: valuesForm?.maxStudents,
        };

        try {
            await createCourseOfferingAPI(payload);
            message.success("Tạo lớp học phần thành công");
            handleClose();
            reloadTable();
            return true;
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Lưu thất bại",
            );
            return false;
        }
    };

    return (
        <ModalForm
            form={form}
            title={dataUpdate ? "Cập nhật lớp học phần" : "Thêm lớp học phần"}
            open={openModal}
            width={600}
            onFinish={handleSubmit}
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                onCancel: handleClose,
            }}
        >
            <ProForm.Item
                name="teacherSubject"
                label="Giảng viên - Môn học"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng chọn giảng viên và môn học",
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
                        form.setFieldValue("adminClass", undefined);
                    }}
                />
            </ProForm.Item>

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
                        form.setFieldValue("adminClass", undefined);
                    }}
                />
            </ProForm.Item>

            <ProFormDependency name={["term", "teacherSubject"]}>
                {({ term, teacherSubject }) => {
                    const termId = term?.value;
                    const teacherSubjectId = teacherSubject?.value;
                    const disabled = !termId || !teacherSubjectId;

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

            <ProFormDigit
                name="maxStudents"
                label="Sĩ số tối đa"
                min={1}
                initialValue={60}
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
        </ModalForm>
    );
};

export default ModalCourseOffering;
