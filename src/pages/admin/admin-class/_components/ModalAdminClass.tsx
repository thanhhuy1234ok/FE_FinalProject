import { useEffect, useRef, useState } from "react";
import { App, Button, Col, Form, Row } from "antd";
import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormSwitch,
    ProFormText,
} from "@ant-design/pro-components";
import { ReloadOutlined } from "@ant-design/icons";
import { DebounceSelect } from "@/components/share/debouce.select";
import {
    createAdminClassAPI,
    getMajorsAPI,
    getYearsAPI,
    previewAdminClassAPI,
} from "@/services/api";

interface IOption {
    label: string;
    value: number;
    key?: number;
}

interface IAdminClass {
    id: number;
    code: string;
    name: string;
    capacity?: number;
    isActive?: boolean;
    major_id?: number;
    yearOfAdmissionId?: number;
    major?: {
        id: number;
        name: string;
        code?: string;
    };
    yearOfAdmission?: {
        id: number;
        year?: number | string;
        name?: string;
    };
}

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    fetchData: () => void;
    dataInit?: IAdminClass | null;
    setDataInit?: (v: IAdminClass | null) => void;
}

const ModalAdminClass = (props: IProps) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [previewLoading, setPreviewLoading] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);
    const [highlightFields, setHighlightFields] = useState(false);

    const codeInputRef = useRef<any>(null);
    const isEditMode = !!props.dataInit?.id;

    useEffect(() => {
        if (!props.openModal) return;

        if (props.dataInit) {
            form.setFieldsValue({
                code: props.dataInit.code,
                name: props.dataInit.name,
                capacity: props.dataInit.capacity,
                isActive: props.dataInit.isActive ?? true,
                major: props.dataInit.major
                    ? {
                          label: `${props.dataInit.major.name}${
                              props.dataInit.major.code
                                  ? ` (${props.dataInit.major.code})`
                                  : ""
                          }`,
                          value: props.dataInit.major.id,
                          key: props.dataInit.major.id,
                      }
                    : undefined,
                yearOfAdmission: props.dataInit.yearOfAdmission
                    ? {
                          label:
                              props.dataInit.yearOfAdmission.year ??
                              props.dataInit.yearOfAdmission.name ??
                              "",
                          value: props.dataInit.yearOfAdmission.id,
                          key: props.dataInit.yearOfAdmission.id,
                      }
                    : undefined,
            });

            setIsGenerated(true);
            setHighlightFields(false);
        } else {
            form.resetFields();
            form.setFieldsValue({
                isActive: true,
                capacity: 45,
            });

            setIsGenerated(false);
            setHighlightFields(false);
        }
    }, [props.openModal, props.dataInit, form]);

    const fetchMajorOptions = async (search?: string): Promise<IOption[]> => {
        const query = search?.trim()
            ? `current=1&pageSize=100&name=/${search}/i`
            : `current=1&pageSize=100`;

        const res = await getMajorsAPI(query);
        const data = res?.data?.result ?? [];

        return data.map((item: any) => ({
            label: `${item.name}${item.code ? ` (${item.code})` : ""}`,
            value: item.id,
            key: item.id,
        }));
    };

    const fetchYearOptions = async (search?: string): Promise<IOption[]> => {
        const query = search?.trim()
            ? `current=1&pageSize=100&year=/${search}/i`
            : `current=1&pageSize=100`;

        const res = await getYearsAPI(query);
        const data = res?.data?.result ?? [];

        return data.map((item: any) => ({
            label: String(item.year ?? item.name ?? ""),
            value: item.id,
            key: item.id,
        }));
    };

    const resetGeneratedState = () => {
        if (isEditMode) return;

        setIsGenerated(false);
        setHighlightFields(false);
        form.setFieldsValue({
            code: undefined,
            name: undefined,
        });
    };

    const handleGenerateCodeName = async () => {
        const major = form.getFieldValue("major");
        const yearOfAdmission = form.getFieldValue("yearOfAdmission");

        const majorId = major?.value;
        const yearId = yearOfAdmission?.value;

        if (!majorId || !yearId) {
            message.warning("Vui lòng chọn chuyên ngành và năm nhập học");
            return;
        }

        try {
            setPreviewLoading(true);

            const res = await previewAdminClassAPI(
                Number(majorId),
                Number(yearId),
            );

            const previewData =
                res?.data?.data ?? res?.data?.result ?? res?.data ?? {};

            form.setFieldsValue({
                code: previewData.code ?? "",
                name: previewData.name ?? previewData.suggestedName ?? "",
            });

            setIsGenerated(true);
            setHighlightFields(true);

            setTimeout(() => {
                codeInputRef.current?.focus?.();
            }, 100);

            setTimeout(() => {
                setHighlightFields(false);
            }, 1800);

            message.success("Đã tạo mã lớp và tên lớp");
        } catch (error: any) {
            setIsGenerated(false);
            message.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Không thể tạo mã lớp và tên lớp",
            );
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (!isEditMode && !isGenerated) {
                message.warning("Vui lòng tạo mã lớp và tên lớp trước khi lưu");
                return false;
            }

            const payload = {
                code: values.code,
                name: values.name,
                major_id: values.major?.value,
                yearOfAdmissionId: values.yearOfAdmission?.value,
                capacity:
                    values.capacity !== undefined && values.capacity !== null
                        ? Number(values.capacity)
                        : null,
                isActive: values.isActive ?? true,
            };

            let res;
            if (props.dataInit?.id) {
                // res = await updateAdminClassAPI(props.dataInit.id, payload);
            } else {
                res = await createAdminClassAPI(payload);
            }

            if (
                res?.statusCode === 200 ||
                res?.statusCode === 201 ||
                res?.data
            ) {
                message.success(
                    props.dataInit
                        ? "Cập nhật lớp hành chính thành công"
                        : "Tạo lớp hành chính thành công",
                );

                props.setOpenModal(false);
                props.setDataInit?.(null);
                form.resetFields();
                setIsGenerated(false);
                setHighlightFields(false);
                props.fetchData();
                return true;
            }

            message.error("Có lỗi xảy ra");
            return false;
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Có lỗi xảy ra",
            );
            return false;
        }
    };

    return (
        <ModalForm
            title={
                props.dataInit
                    ? "Cập nhật lớp hành chính"
                    : "Tạo lớp hành chính"
            }
            open={props.openModal}
            form={form}
            onFinish={handleSubmit}
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                onCancel: () => {
                    props.setOpenModal(false);
                    props.setDataInit?.(null);
                    form.resetFields();
                    setIsGenerated(false);
                    setHighlightFields(false);
                },
            }}
            submitter={{
                searchConfig: {
                    resetText: "Hủy",
                    submitText: props.dataInit ? "Cập nhật" : "Tạo mới",
                },
                submitButtonProps: {
                    disabled: !isEditMode && !isGenerated,
                },
                render: (_, doms) => {
                    return [
                        !isEditMode && (
                            <Button
                                key="generate"
                                icon={<ReloadOutlined />}
                                loading={previewLoading}
                                onClick={handleGenerateCodeName}
                            >
                                Tạo mã lớp & tên lớp
                            </Button>
                        ),
                        ...doms,
                    ];
                },
            }}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <ProForm.Item
                        name="major"
                        label="Chuyên ngành"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn chuyên ngành!",
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
                            onChange={() => {
                                resetGeneratedState();
                            }}
                        />
                    </ProForm.Item>
                </Col>

                <Col span={12}>
                    <ProForm.Item
                        name="yearOfAdmission"
                        label="Năm nhập học"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn năm nhập học!",
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
                            onChange={() => {
                                resetGeneratedState();
                            }}
                        />
                    </ProForm.Item>
                </Col>

                <Col span={12}>
                    <ProFormText
                        name="code"
                        label="Mã lớp"
                        placeholder="Bấm nút để tạo mã lớp"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập mã lớp",
                            },
                        ]}
                        fieldProps={{
                            ref: codeInputRef,
                            className: highlightFields
                                ? "generated-highlight"
                                : "",
                        }}
                        extra={
                            !isEditMode && !isGenerated
                                ? "Hãy chọn chuyên ngành, năm nhập học rồi bấm nút tạo"
                                : undefined
                        }
                    />
                </Col>

                <Col span={12}>
                    <ProFormText
                        name="name"
                        label="Tên lớp"
                        placeholder="Bấm nút để tạo tên lớp"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên lớp",
                            },
                        ]}
                        fieldProps={{
                            className: highlightFields
                                ? "generated-highlight"
                                : "",
                        }}
                    />
                </Col>

                <Col span={12}>
                    <ProFormDigit
                        name="capacity"
                        label="Sĩ số"
                        placeholder="Nhập sĩ số"
                        min={1}
                        fieldProps={{
                            precision: 0,
                        }}
                    />
                </Col>

                <Col span={12}>
                    <ProFormSwitch
                        name="isActive"
                        label="Trạng thái"
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Tạm khóa"
                    />
                </Col>
            </Row>

            <style>
                {`
                    .generated-highlight {
                        animation: generatedPulse 1.2s ease-in-out 1;
                    }

                    @keyframes generatedPulse {
                        0% {
                            background-color: #fffbe6;
                            box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.25);
                        }
                        100% {
                            background-color: transparent;
                            box-shadow: none;
                        }
                    }
                `}
            </style>
        </ModalForm>
    );
};

export default ModalAdminClass;
