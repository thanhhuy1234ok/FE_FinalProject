import { DebounceSelect } from "@/components/share/debouce.select";
import { ProForm, ProFormSelect } from "@ant-design/pro-components";
import { Col } from "antd";
import type { FormInstance } from "antd/es/form";
import { useCallback, useState } from "react";
import { getSubjectsAPI } from "@/services/api";
import useUserHooks from "../_hooks/user.hook";
import useStudentFormOptions from "../_hooks/useStudentFormOptions";

const RenderByRole = () => {
    const { majorOptions, classOptions, yearOptions, departmentOptions } =
        useUserHooks();

    const form = ProForm.useFormInstance();
    const ALL_VALUE = "__all__";

    const [subjectOptions, setSubjectOptions] = useState<
        { label: string; value: string | number }[]
    >([]);
    const [selectedSubjects, setSelectedSubjects] = useState<
        { label: string; value: string | number }[]
    >([]);
    const {
        selectedYear,
        selectedMajor,
        fetchYearOptions,
        fetchMajorOptions,
        fetchClassOptions,
        handleYearChange,
        handleMajorChange,
        isMajorDisabled,
        isClassDisabled,
    } = useStudentFormOptions({
        form,
        majorOptions,
        classOptions,
        yearOptions,
    });

    const fetchDepartmentOptions = useCallback(
        async (keyword: string): Promise<IOptionSelect[]> => {
            const normalizedKeyword = keyword?.trim().toLowerCase();

            return departmentOptions.filter((item: any) => {
                if (!normalizedKeyword) return true;

                return item.label
                    ?.toString()
                    .toLowerCase()
                    .includes(normalizedKeyword);
            });
        },
        [departmentOptions],
    );

    const fetchSubjectTeacherOptions = useCallback(
        async (keyword: string): Promise<IOptionSelect[]> => {
            const department = form.getFieldValue("department");
            const departmentId = department?.value;

            if (!departmentId) return [];

            const query = `current=1&pageSize=50&name=${keyword}&department_id=${departmentId}`;
            const res = await getSubjectsAPI(query);

            return (
                res?.data?.result?.map((item: ISubject) => ({
                    label: item.name,
                    value: item.id,
                })) || []
            );
        },
        [form],
    );

    return (
        <ProForm.Item shouldUpdate noStyle>
            {(formInstance: FormInstance) => {
                const role = formInstance.getFieldValue("role");
                const roleId = role?.value;

                if (roleId === 2) {
                    return (
                        <>
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
                                        labelInValue
                                        placeholder="Chọn bộ môn"
                                        fetchOptions={fetchDepartmentOptions}
                                        style={{ width: "100%" }}
                                        onChange={() => {
                                            form.setFieldValue(
                                                "subjects",
                                                undefined,
                                            );
                                        }}
                                    />
                                </ProForm.Item>
                            </Col>

                            <Col lg={9} md={9} sm={24} xs={24}>
                                <ProForm.Item shouldUpdate noStyle>
                                    {() => {
                                        const department =
                                            form.getFieldValue("department");
                                        const departmentId = department?.value;

                                        return (
                                            <ProForm.Item
                                                name="subjects"
                                                label="Môn giảng dạy"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Vui lòng chọn môn học!",
                                                    },
                                                ]}
                                            >
                                                <DebounceSelect
                                                    mode="multiple"
                                                    allowClear
                                                    showSearch
                                                    labelInValue
                                                    placeholder={
                                                        departmentId
                                                            ? "Chọn môn giảng dạy"
                                                            : "Vui lòng chọn bộ môn trước"
                                                    }
                                                    fetchOptions={
                                                        fetchSubjectTeacherOptions
                                                    }
                                                    selectAll
                                                    style={{ width: "100%" }}
                                                    disabled={!departmentId}
                                                />
                                            </ProForm.Item>
                                        );
                                    }}
                                </ProForm.Item>
                            </Col>

                            <Col lg={9} md={9} sm={24} xs={24}>
                                <ProFormSelect
                                    label="Học vị"
                                    name="degree"
                                    placeholder="Chọn học vị"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng không bỏ trống",
                                        },
                                    ]}
                                    options={[
                                        { label: "Cử nhân", value: "Cử nhân" },
                                        { label: "Thạc sĩ", value: "Thạc sĩ" },
                                        { label: "Tiến sĩ", value: "Tiến sĩ" },
                                        { label: "Kỹ sư", value: "Kỹ sư" },
                                        {
                                            label: "Cao đẳng",
                                            value: "Cao đẳng",
                                        },
                                    ]}
                                />
                            </Col>
                        </>
                    );
                }

                if (roleId === 3) {
                    return (
                        <>
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
                                        labelInValue
                                        placeholder="Chọn năm nhập học"
                                        fetchOptions={fetchYearOptions}
                                        style={{ width: "100%" }}
                                        onChange={handleYearChange}
                                    />
                                </ProForm.Item>
                            </Col>

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
                                        labelInValue
                                        placeholder="Chọn chuyên ngành"
                                        fetchOptions={fetchMajorOptions}
                                        style={{ width: "100%" }}
                                        disabled={isMajorDisabled}
                                        onChange={handleMajorChange}
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
                                        labelInValue
                                        placeholder={
                                            selectedYear && selectedMajor
                                                ? "Chọn lớp học"
                                                : "Chọn năm nhập học và chuyên ngành trước"
                                        }
                                        fetchOptions={fetchClassOptions}
                                        style={{ width: "100%" }}
                                        disabled={isClassDisabled}
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

export default RenderByRole;
