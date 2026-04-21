import { useEffect } from "react";
import { App, Col, Form, Row } from "antd";
import {
    ModalForm,
    ProFormDigit,
    ProFormItem,
    ProFormSwitch,
    ProFormText,
} from "@ant-design/pro-components";

import { createBuildingAPI, getCampusAPI } from "@/services/api";
import { DebounceSelect } from "@/components/share/debouce.select";

interface IBuilding {
    id?: number;
    code: string;
    name: string;
    has_floors?: boolean;
    total_floors?: number | null;
    is_active?: boolean;
    campus?: {
        id: number;
        name: string;
    };
    campus_id?: number;
}

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataUpdate?: IBuilding | null;
    reloadTable: () => void;
    campusId?: number;
}

const ModalBuilding = (props: IProps) => {
    const { openModal, setOpenModal, dataUpdate, reloadTable, campusId } =
        props;
    const [form] = Form.useForm();
    const { message, notification } = App.useApp();

    const isEdit = !!dataUpdate?.id;

    const hasFloors = Form.useWatch("has_floors", form);

    useEffect(() => {
        if (!openModal) return;

        if (dataUpdate) {
            form.setFieldsValue({
                code: dataUpdate.code,
                name: dataUpdate.name,
                has_floors: dataUpdate.has_floors ?? true,
                total_floors: dataUpdate.total_floors,
                is_active: dataUpdate.is_active ?? true,
                campus: dataUpdate.campus
                    ? {
                          label: dataUpdate.campus.name,
                          value: dataUpdate.campus.id,
                      }
                    : dataUpdate.campus_id
                      ? {
                            label: `Campus #${dataUpdate.campus_id}`,
                            value: dataUpdate.campus_id,
                        }
                      : undefined,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                has_floors: true,
                is_active: true,
                total_floors: 1,
                campus: campusId
                    ? {
                          label: `Campus #${campusId}`,
                          value: campusId,
                      }
                    : undefined,
            });
        }
    }, [openModal, dataUpdate, form, campusId]);

    useEffect(() => {
        if (hasFloors === false) {
            form.setFieldValue("total_floors", null);
        } else if (hasFloors === true) {
            const current = form.getFieldValue("total_floors");
            if (current === null || current === undefined) {
                form.setFieldValue("total_floors", 1);
            }
        }
    }, [hasFloors, form]);

    const handleClose = () => {
        form.resetFields();
        setOpenModal(false);
    };

    const fetchCampusOptions = async (search: string) => {
        const query = search?.trim()
            ? `current=1&pageSize=20&name=/${search}/i`
            : "current=1&pageSize=20";

        const res = await getCampusAPI(query);
        const data: ICampus[] = res?.data?.result ?? [];

        return data.map((item) => ({
            label: `${item.name}${item.code ? ` (${item.code})` : ""}`,
            value: item.id,
        }));
    };

    const handleSubmit = async (values: any) => {
        try {
            const payload = {
                code: values.code?.trim(),
                name: values.name?.trim(),
                has_floors: values.has_floors ?? true,
                total_floors:
                    values.has_floors === false
                        ? null
                        : (values.total_floors ?? null),
                is_active: values.is_active ?? true,
            };

            const selectedCampusId = values?.campus?.value ?? campusId;

            if (!selectedCampusId) {
                notification.error({
                    message: "Thiếu campus",
                    description: "Vui lòng chọn campus cho tòa nhà.",
                });
                return false;
            }

            if (isEdit && dataUpdate?.id) {
                // await updateBuildingAPI(dataUpdate.id, payload);
                message.success("Cập nhật tòa nhà thành công");
            } else {
                await createBuildingAPI(selectedCampusId, payload);
                message.success("Tạo mới tòa nhà thành công");
            }

            handleClose();
            reloadTable();
            return true;
        } catch (error: any) {
            notification.error({
                message: isEdit
                    ? "Cập nhật tòa nhà thất bại"
                    : "Tạo mới tòa nhà thất bại",
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Có lỗi xảy ra, vui lòng thử lại.",
            });
            return false;
        }
    };

    return (
        <ModalForm
            title={isEdit ? "Cập nhật tòa nhà" : "Tạo mới tòa nhà"}
            open={openModal}
            form={form}
            width={720}
            modalProps={{
                destroyOnClose: true,
                onCancel: handleClose,
                centered: true,
                maskClosable: false,
            }}
            submitter={{
                searchConfig: {
                    resetText: "Đóng",
                    submitText: isEdit ? "Cập nhật" : "Tạo mới",
                },
                resetButtonProps: {
                    onClick: handleClose,
                },
            }}
            onFinish={handleSubmit}
        >
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <ProFormItem
                        name="campus"
                        label="Campus"
                        rules={[
                            {
                                required: !campusId,
                                message: "Vui lòng chọn campus",
                            },
                        ]}
                    >
                        <DebounceSelect
                            allowClear={!campusId}
                            showSearch
                            labelInValue
                            placeholder="Chọn campus"
                            fetchOptions={fetchCampusOptions}
                            style={{ width: "100%" }}
                            disabled={!!campusId || isEdit}
                        />
                    </ProFormItem>
                </Col>

                <Col xs={24} md={12}>
                    <ProFormText
                        name="code"
                        label="Mã tòa nhà"
                        placeholder="Ví dụ: A, B1, LIB"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập mã tòa nhà",
                            },
                            {
                                max: 50,
                                message: "Mã tòa nhà tối đa 50 ký tự",
                            },
                        ]}
                    />
                </Col>

                <Col xs={24} md={12}>
                    <ProFormText
                        name="name"
                        label="Tên tòa nhà"
                        placeholder="Ví dụ: Tòa A, Thư viện"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên tòa nhà",
                            },
                            {
                                max: 100,
                                message: "Tên tòa nhà tối đa 100 ký tự",
                            },
                        ]}
                    />
                </Col>

                <Col xs={24} md={12}>
                    <ProFormSwitch
                        name="has_floors"
                        label="Có phân tầng"
                        checkedChildren="Có"
                        unCheckedChildren="Không"
                    />
                </Col>

                {hasFloors && (
                    <Col xs={24} md={12}>
                        <ProFormDigit
                            name="total_floors"
                            label="Tổng số tầng"
                            placeholder="Nhập tổng số tầng"
                            min={1}
                            fieldProps={{
                                precision: 0,
                            }}
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tổng số tầng",
                                },
                            ]}
                        />
                    </Col>
                )}

                <Col xs={24} md={12}>
                    <ProFormSwitch
                        name="is_active"
                        label="Trạng thái hoạt động"
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Ngừng"
                    />
                </Col>
            </Row>
        </ModalForm>
    );
};

export default ModalBuilding;
