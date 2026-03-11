import { DebounceSelect } from "@/components/share/debouce.select";
import { ProFormText, ProForm } from "@ant-design/pro-components";
import { Col } from "antd";
import type { FormInstance } from "antd/es/form";
import useUserHooks from "../_hooks/user.hook";
import { useCallback } from "react";

export const renderByRole = () => {
    const { majorOptions, classOptions, yearOptions, departmentOptions } =
        useUserHooks();
    const fetchMajorOptions = useCallback(async () => {
        return majorOptions ?? [];
    }, [majorOptions]);

    const fetchClassOptions = useCallback(async () => {
        return classOptions ?? [];
    }, [classOptions]);

    const fetchYearOptions = useCallback(async () => {
        return yearOptions ?? [];
    }, [yearOptions]);
    const fetchDepartmentOptions = useCallback(async () => {
        return departmentOptions ?? [];
    }, [departmentOptions]);
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
                            <Col lg={9} md={9} sm={24} xs={24}>
                                <ProForm.Item
                                    name="department"
                                    label="Bộ môn"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn bộ môn!",
                                        },
                                    ]}
                                >
                                    <DebounceSelect
                                        allowClear
                                        showSearch
                                        labelInValue // ✅ QUAN TRỌNG
                                        placeholder="Chọn bộ môn"
                                        fetchOptions={fetchDepartmentOptions}
                                        style={{ width: "100%" }}
                                    />
                                </ProForm.Item>
                            </Col>
                        </>
                    );
                }

                // 👉 STUDENT
                if (roleId === 3) {
                    return (
                        <>
                            <Col lg={9} md={9} sm={24} xs={24}>
                                <ProForm.Item
                                    name="major"
                                    label="Chuyên ngành"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng chọn chuyên ngành!",
                                        },
                                    ]}
                                >
                                    <DebounceSelect
                                        allowClear
                                        showSearch
                                        labelInValue // ✅ QUAN TRỌNG
                                        placeholder="Chọn chuyên ngành"
                                        fetchOptions={fetchMajorOptions}
                                        style={{ width: "100%" }}
                                    />
                                </ProForm.Item>
                            </Col>
                            <Col lg={9} md={9} sm={24} xs={24}>
                                <ProForm.Item
                                    name="AdminClass"
                                    label="Lớp học"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn lớp học!",
                                        },
                                    ]}
                                >
                                    <DebounceSelect
                                        allowClear
                                        showSearch
                                        labelInValue // ✅ QUAN TRỌNG
                                        placeholder="Chọn lớp học"
                                        fetchOptions={fetchClassOptions}
                                        style={{ width: "100%" }}
                                    />
                                </ProForm.Item>
                            </Col>
                            <Col lg={9} md={9} sm={24} xs={24}>
                                <ProForm.Item
                                    name="YearOfStudy"
                                    label="Năm nhập học"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng chọn năm nhập học!",
                                        },
                                    ]}
                                >
                                    <DebounceSelect
                                        allowClear
                                        showSearch
                                        labelInValue // ✅ QUAN TRỌNG
                                        placeholder="Chọn năm nhập học"
                                        fetchOptions={fetchYearOptions}
                                        style={{ width: "100%" }}
                                    />
                                </ProForm.Item>
                            </Col>
                        </>
                    );
                }

                return null;
            }}
        </ProForm.Item>
    );
};
