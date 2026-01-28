import { ProFormText, ProForm } from "@ant-design/pro-components";
import { Col } from "antd";
import type { FormInstance } from "antd/es/form";

export const renderByRole = () => {
    return (
        <ProForm.Item shouldUpdate noStyle>
            {(formInstance: FormInstance) => {
                const role = formInstance.getFieldValue("role");
                const roleId = role?.value;

                // 👉 TEACHER
                if (roleId === 2) {
                    return (
                        <>
                            <Col lg={9} md={9} sm={24} xs={24}>
                                <ProFormText
                                    label="Chuyên ngành"
                                    name="specialization"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng không bỏ trống",
                                        },
                                    ]}
                                    placeholder="Nhập chuyên ngành"
                                />
                            </Col>

                            <Col lg={9} md={9} sm={24} xs={24}>
                                <ProFormText
                                    label="Trình độ học vấn"
                                    name="degree"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng không bỏ trống",
                                        },
                                    ]}
                                    placeholder="Nhập trình độ học vấn"
                                />
                            </Col>
                        </>
                    );
                }

                // 👉 STUDENT
                if (roleId === 3) {
                    return (
                        <>
                            <Col lg={9} md={9} sm={24} xs={24}>
                                <ProFormText
                                    label="Chuyên ngành"
                                    name="major"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng không bỏ trống",
                                        },
                                    ]}
                                    placeholder="Nhập chuyên ngành"
                                />
                            </Col>
                        </>
                    );
                }

                return null;
            }}
        </ProForm.Item>
    );
};
