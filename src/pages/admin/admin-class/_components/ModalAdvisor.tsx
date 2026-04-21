import { useEffect } from "react";
import { App, Alert, Col, Form, Row } from "antd";
import {
    ModalForm,
    ProFormDatePicker,
    ProFormSelect,
    ProFormSwitch,
} from "@ant-design/pro-components";
import dayjs, { Dayjs } from "dayjs";
import {
    createAdminClassAdvisorAPI,
    getListTeacherAPI,
    getTeacherAPI,
    getTeacherSubjectsAPI,
} from "@/services/api";

interface IModalAdvisorProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    adminClassId: number;
    departmentId?: number;
    fetchData: () => Promise<void> | void;
    hasAdvisor?: boolean;
}

interface ITeacherOption {
    label: string;
    value: number;
}

interface IAdvisorFormValues {
    teacherId: number;
    startAt?: Dayjs;
    isPrimary?: boolean;
}

const ModalAdvisor = (props: IModalAdvisorProps) => {
    const { message } = App.useApp();
    const [form] = Form.useForm<IAdvisorFormValues>();

    useEffect(() => {
        if (props.openModal) {
            form.setFieldsValue({
                teacherId: undefined,
                startAt: dayjs(),
                isPrimary: true,
            });
        } else {
            form.resetFields();
        }
    }, [props.openModal, form]);

    const fetchTeacherOptions = async (
        search: string,
    ): Promise<ITeacherOption[]> => {
        try {
            if (!props.departmentId) return [];

            const searchQuery = search?.trim() ? `&name=/${search}/i` : "";

            const query = `current=1&pageSize=100&department_id=${props.departmentId}${searchQuery}&excludeAssignedAdvisor=true`;

            const res = await getTeacherAPI(query);
            const result = res?.data?.result ?? [];

            return result.map((item: any) => ({
                label: `${item?.user.name ?? "Không có tên"}${
                    item?.msgv ? ` - ${item.msgv}` : ""
                }`,
                value: item.id,
            }));
        } catch (error) {
            return [];
        }
    };

    return (
        <ModalForm<IAdvisorFormValues>
            title="Thêm giảng viên hướng dẫn"
            open={props.openModal}
            form={form}
            modalProps={{
                destroyOnClose: true,
                onCancel: () => props.setOpenModal(false),
            }}
            submitter={{
                searchConfig: {
                    submitText: "Lưu",
                    resetText: "Đóng",
                },
                resetButtonProps: {
                    onClick: () => props.setOpenModal(false),
                },
            }}
            onFinish={async (values) => {
                try {
                    if (!props.departmentId) {
                        message.error(
                            "Không xác định được bộ môn của lớp hành chính",
                        );
                        return false;
                    }

                    const payload = {
                        adminClassId: props.adminClassId,
                        teacherId: Number(values.teacherId),
                        startAt: values.startAt
                            ? dayjs(values.startAt).toISOString()
                            : undefined,
                        isPrimary: !!values.isPrimary,
                    };

                    await createAdminClassAdvisorAPI(payload);

                    message.success("Thêm giảng viên hướng dẫn thành công");
                    props.setOpenModal(false);
                    form.resetFields();
                    await props.fetchData();
                    return true;
                } catch (error: any) {
                    message.error(
                        error?.response?.data?.message ||
                            "Không thể thêm giảng viên hướng dẫn",
                    );
                    return false;
                }
            }}
        >
            {!props.departmentId ? (
                <Alert
                    type="warning"
                    showIcon
                    message="Lớp hành chính chưa có bộ môn"
                    description="Vui lòng gán chuyên ngành/bộ môn cho lớp trước khi thêm giảng viên hướng dẫn."
                    style={{ marginBottom: 16 }}
                />
            ) : null}

            <Row gutter={16}>
                <Col span={24}>
                    <ProFormSelect
                        name="teacherId"
                        label="Giảng viên"
                        placeholder={
                            props.departmentId
                                ? "Chọn giảng viên đúng bộ môn"
                                : "Chưa xác định bộ môn"
                        }
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn giảng viên",
                            },
                        ]}
                        showSearch
                        debounceTime={300}
                        request={async ({ keyWords }) => {
                            return await fetchTeacherOptions(keyWords || "");
                        }}
                        fieldProps={{
                            filterOption: false,
                            disabled: !props.departmentId,
                        }}
                    />
                </Col>

                <Col xs={24} md={12}>
                    <ProFormDatePicker
                        name="startAt"
                        label="Ngày bắt đầu"
                        placeholder="Chọn ngày bắt đầu"
                        fieldProps={{
                            disabled: !props.departmentId,
                        }}
                    />
                </Col>

                <Col xs={24} md={12}>
                    <ProFormSwitch
                        name="isPrimary"
                        label="Giảng viên hướng dẫn chính"
                        fieldProps={{
                            disabled: !props.departmentId,
                        }}
                    />
                </Col>
            </Row>
        </ModalForm>
    );
};

export default ModalAdvisor;
