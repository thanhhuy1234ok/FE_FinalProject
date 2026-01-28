import {
    ModalForm,
    ProForm,
    ProFormSelect,
    ProFormText,
} from "@ant-design/pro-components";
import { Col, Form, message, notification, Row } from "antd";
import "@/styles/model.scss";
import { DebounceSelect } from "@/components/share/debouce.select";
import userHooks from "../_hooks/user.hook";
import { useCallback } from "react";
import { createUserAPI } from "@/services/api";
import { renderByRole } from "./renderByRole ";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    refreshTable: () => void;
    setDataUpdate: (v: IUserTable | null) => void;
    dataUpdate: IUserTable | null;
}

const UserModal = (props: IProps) => {
    const { dataUpdate, openModal, refreshTable, setDataUpdate, setOpenModal } =
        props;
    const { roleOptions } = userHooks();

    const fetchRolesOptions = useCallback(async () => {
        return roleOptions ?? [];
    }, [roleOptions]);

    const [form] = Form.useForm();
    const handleReset = () => {
        form.resetFields();
        setDataUpdate(null);
        setOpenModal(false);
    };

    const submitFrom = async (valuesForm: any) => {
        // valuesForm.role là object labelInValue
        const roleId = valuesForm?.role?.value;
        const majorId = valuesForm?.major?.value;

        const basePayload = {
            name: valuesForm.name,
            email: valuesForm.email,
            password: valuesForm.password,
            gender: valuesForm.gender,
            role: roleId,
        };

        // ✅ payload theo role
        let payload: any = basePayload;

        if (roleId === 2) {
            payload = {
                ...basePayload,
                specialization: valuesForm.specialization,
                degree: valuesForm.degree,
            };
        }

        if (roleId === 3) {
            payload = {
                ...basePayload,
                major_id: majorId,
                class_id: valuesForm.class_id,
                yearOfAdmissionId: valuesForm.yearOfAdmissionId,
            };
        }
        console.log("pa;oad", payload);
        return true;
        const res = await createUserAPI(payload);
        if (res && res.data) {
            message.success("update user thành công");
            form.resetFields();
            setOpenModal(false);
            refreshTable();
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message,
            });
        }
        // ✅ ModalForm yêu cầu return true để đóng modal
    };

    return (
        <>
            <ModalForm
                open={openModal}
                onFinish={submitFrom}
                modalProps={{
                    className: "user-modal",
                    wrapClassName: "user-modal-wrap",
                    onCancel: () => {
                        handleReset();
                    },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    // width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataUpdate?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy",
                    afterOpenChange: (opened) => {
                        if (!opened) return;

                        requestAnimationFrame(() => {
                            form.setFieldsValue({
                                ...dataUpdate,
                                role: {
                                    value: dataUpdate?.role_id,
                                    label: dataUpdate?.role?.name,
                                },
                            });

                            requestAnimationFrame(() => {
                                form.setFieldsValue({
                                    msgv: dataUpdate?.teacher?.msgv,
                                    specialization:
                                        dataUpdate?.teacher?.specialization,
                                    degree: dataUpdate?.teacher?.degree,
                                });
                            });
                        });
                    },
                }}
                title={<>{dataUpdate?.id ? "Cập nhật User" : "Tạo mới User"}</>}
                initialValues={dataUpdate?.id ? dataUpdate : {}}
                preserve={false}
                form={form}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Tên User"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng không bỏ trống",
                                },
                            ]}
                            placeholder="Nhập name"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText.Password
                            disabled={dataUpdate?.id ? true : false}
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: dataUpdate?.id ? false : true,
                                    message: "Vui lòng không bỏ trống",
                                },
                            ]}
                            placeholder="Nhập password"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng không bỏ trống",
                                },
                                {
                                    type: "email",
                                    message: "Vui lòng nhập email hợp lệ",
                                },
                            ]}
                            placeholder="Nhập email"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            name="gender"
                            label="Giới Tính"
                            valueEnum={{
                                male: "Nam",
                                female: "Nữ",
                                other: "Khác",
                            }}
                            placeholder="Please select a gender"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn giới tính!",
                                },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
                            name="role"
                            label="Vai trò"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn vai trò!",
                                },
                            ]}
                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                labelInValue // ✅ QUAN TRỌNG
                                placeholder="Chọn vai trò"
                                fetchOptions={fetchRolesOptions}
                                // onChange={(newValue: any) => {
                                //     // nếu chỉ cho chọn 1:
                                //     form.setFieldValue(
                                //         "role",
                                //         newValue ?? undefined,
                                //     );
                                // }}
                                style={{ width: "100%" }}
                            />
                        </ProForm.Item>
                    </Col>
                    {renderByRole()}
                </Row>
            </ModalForm>
        </>
    );
};

export default UserModal;
