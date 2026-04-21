import { useEffect, useState } from "react";
import { App, Col, Form, Row } from "antd";
import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormSwitch,
    ProFormText,
} from "@ant-design/pro-components";
import { createRoomAPI, getBuildingAPI } from "@/services/api";
import { DebounceSelect } from "@/components/share/debouce.select";

interface IBuildingOption {
    label: string;
    value: number;
    has_floors?: boolean;
    total_floors?: number | null;
}

interface IRoom {
    id?: number;
    name: string;
    code: string;
    capacity?: number;
    floor?: number | null;
    is_active?: boolean;
    building?: {
        id: number;
        name: string;
        has_floors?: boolean;
        total_floors?: number | null;
    };
}

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataUpdate?: IRoom | null;
    reloadTable: () => void;
}

const ModalRoom = (props: IProps) => {
    const { openModal, setOpenModal, dataUpdate, reloadTable } = props;
    const [form] = Form.useForm();
    const { message, notification } = App.useApp();

    const isEdit = !!dataUpdate?.id;
    const [selectedBuildingMeta, setSelectedBuildingMeta] =
        useState<IBuildingOption | null>(null);

    const fetchBuildingOptions = async (search: string) => {
        const query = search?.trim()
            ? `current=1&pageSize=100&name=/${search}/i`
            : `current=1&pageSize=100`;

        const res = await getBuildingAPI(query);
        const data = res?.data?.result ?? [];

        return data.map((item: any) => ({
            label: item.name,
            value: item.id,
            has_floors: item.has_floors,
            total_floors: item.total_floors,
        }));
    };

    useEffect(() => {
        if (!openModal) return;

        if (dataUpdate) {
            const buildingOption: IBuildingOption | null = dataUpdate.building
                ? {
                      label: dataUpdate.building.name,
                      value: dataUpdate.building.id,
                      has_floors: dataUpdate.building.has_floors,
                      total_floors: dataUpdate.building.total_floors,
                  }
                : null;

            form.setFieldsValue({
                name: dataUpdate.name,
                code: dataUpdate.code,
                capacity: dataUpdate.capacity,
                floor: dataUpdate.floor ?? null,
                is_active: dataUpdate.is_active ?? true,
                building: buildingOption
                    ? {
                          label: buildingOption.label,
                          value: buildingOption.value,
                      }
                    : undefined,
            });

            setSelectedBuildingMeta(buildingOption);
        } else {
            form.resetFields();
            form.setFieldsValue({
                is_active: true,
                floor: null,
            });
            setSelectedBuildingMeta(null);
        }
    }, [openModal, dataUpdate, form]);

    const handleClose = () => {
        form.resetFields();
        setSelectedBuildingMeta(null);
        setOpenModal(false);
    };

    const handleSubmit = async (values: any) => {
        const payload = {
            name: values.name?.trim(),
            code: values.code?.trim(),
            capacity: values.capacity,
            floor: selectedBuildingMeta?.has_floors ? values.floor : null,
            is_active: values.is_active ?? true,
            building_id: values.building?.value,
        };

        try {
            let res;

            if (isEdit && dataUpdate?.id) {
                // res = await updateRoomAPI(dataUpdate.id, payload);
            } else {
                res = await createRoomAPI(payload);
            }

            if (res?.data) {
                message.success(
                    isEdit
                        ? "Cập nhật phòng thành công"
                        : "Tạo phòng thành công",
                );
                handleClose();
                reloadTable();
                return true;
            }

            notification.error({
                message: isEdit
                    ? "Cập nhật phòng thất bại"
                    : "Tạo phòng thất bại",
                description:
                    res?.message ||
                    res?.message ||
                    "Có lỗi xảy ra, vui lòng thử lại.",
            });
            return false;
        } catch (error: any) {
            notification.error({
                message: isEdit
                    ? "Cập nhật phòng thất bại"
                    : "Tạo phòng thất bại",
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Có lỗi xảy ra, vui lòng thử lại.",
            });
            return false;
        }
    };

    const showFloorField = !!selectedBuildingMeta?.has_floors;
    const maxFloor = selectedBuildingMeta?.total_floors ?? undefined;

    return (
        <ModalForm
            title={isEdit ? "Cập nhật phòng học" : "Tạo mới phòng học"}
            open={openModal}
            form={form}
            modalProps={{
                onCancel: handleClose,
                destroyOnClose: true,
                maskClosable: false,
                centered: true,
            }}
            submitter={{
                searchConfig: {
                    resetText: "Hủy",
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
                    <ProFormText
                        name="name"
                        label="Tên phòng"
                        placeholder="Nhập tên phòng"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên phòng",
                            },
                            {
                                max: 100,
                                message: "Tên phòng tối đa 100 ký tự",
                            },
                        ]}
                    />
                </Col>

                <Col xs={24} md={12}>
                    <ProFormText
                        name="code"
                        label="Mã phòng"
                        placeholder="Nhập mã phòng"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập mã phòng",
                            },
                            {
                                max: 50,
                                message: "Mã phòng tối đa 50 ký tự",
                            },
                        ]}
                    />
                </Col>

                <Col xs={24} md={12}>
                    <ProForm.Item
                        name="building"
                        label="Tòa nhà"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn tòa nhà!",
                            },
                        ]}
                    >
                        <DebounceSelect
                            allowClear
                            showSearch
                            labelInValue
                            placeholder="Chọn tòa nhà"
                            fetchOptions={fetchBuildingOptions}
                            style={{ width: "100%" }}
                            onChange={(_: any, option: any) => {
                                if (!option) {
                                    setSelectedBuildingMeta(null);
                                    form.setFieldValue("floor", null);
                                    return;
                                }

                                const picked = Array.isArray(option)
                                    ? option[0]
                                    : option;

                                const meta: IBuildingOption = {
                                    label: picked?.label,
                                    value: picked?.value,
                                    has_floors: picked?.has_floors,
                                    total_floors: picked?.total_floors,
                                };

                                setSelectedBuildingMeta(meta);

                                if (!meta?.has_floors) {
                                    form.setFieldValue("floor", null);
                                }
                            }}
                        />
                    </ProForm.Item>
                </Col>

                <Col xs={24} md={12}>
                    <ProFormDigit
                        name="capacity"
                        label="Sức chứa"
                        placeholder="Nhập sức chứa"
                        min={1}
                        fieldProps={{
                            precision: 0,
                        }}
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập sức chứa",
                            },
                        ]}
                    />
                </Col>

                {showFloorField && (
                    <Col xs={24} md={12}>
                        <ProFormDigit
                            name="floor"
                            label="Tầng"
                            placeholder="Nhập tầng"
                            min={1}
                            max={maxFloor}
                            fieldProps={{
                                precision: 0,
                            }}
                            extra={
                                maxFloor
                                    ? `Tòa nhà này có tối đa ${maxFloor} tầng`
                                    : undefined
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tầng",
                                },
                                {
                                    validator: async (_: any, value: any) => {
                                        if (
                                            value === undefined ||
                                            value === null ||
                                            value === ""
                                        ) {
                                            return Promise.resolve();
                                        }

                                        if (value < 1) {
                                            return Promise.reject(
                                                new Error(
                                                    "Tầng phải lớn hơn hoặc bằng 1",
                                                ),
                                            );
                                        }

                                        if (
                                            maxFloor !== undefined &&
                                            maxFloor !== null &&
                                            value > maxFloor
                                        ) {
                                            return Promise.reject(
                                                new Error(
                                                    `Tầng không được lớn hơn ${maxFloor}`,
                                                ),
                                            );
                                        }

                                        return Promise.resolve();
                                    },
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

export default ModalRoom;
