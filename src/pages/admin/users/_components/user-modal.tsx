import { ModalForm, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row } from "antd";
import "@/styles/model.scss"
interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    refreshTable: () => void;
    setDataUpdate: (v: IUserTable | null) => void;
    dataUpdate: IUserTable | null;
}

const UserModal = (props: IProps) => {
    const { dataUpdate, openModal, refreshTable, setDataUpdate, setOpenModal } = props
    const [form] = Form.useForm();
    const handleReset = () => {
        form.resetFields();
        setDataUpdate(null);
        setOpenModal(false);
    }
    return (
        <>
            <ModalForm
                open={openModal}
                modalProps={{
                    className: "user-modal",
                    wrapClassName: "user-modal-wrap",
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    // width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataUpdate?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
                }}

                preserve={false}
                form={form}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Tên User"
                            name="name"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                            ]}
                            placeholder="Nhập name"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText.Password
                            disabled={dataUpdate?.id ? true : false}
                            label="Password"
                            name="password"
                            rules={[{ required: dataUpdate?.id ? false : true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập password"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                                { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                            ]}
                            placeholder="Nhập email"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            name="gender"
                            label="Giới Tính"
                            valueEnum={{
                                MALE: 'Nam',
                                FEMALE: 'Nữ',
                                OTHER: 'Khác',
                            }}
                            placeholder="Please select a gender"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                        />
                    </Col>
                    {/* <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
                            name="role"
                            label="Vai trò"
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}

                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={roles}
                                value={roles}
                                placeholder="Chọn công vai trò"
                                fetchOptions={fetchRoleList}
                                onChange={(newValue: any) => {
                                    console.log(newValue)
                                    if (newValue?.length === 0 || newValue?.length === 1) {
                                        setRoles(newValue as IOptionSelect[]);
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
                            name="major"
                            label="Chuyên ngành"
                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={major}
                                value={major}
                                placeholder="Chọn chuyên ngành"
                                fetchOptions={fetchMajorList}
                                onChange={(newValue: any) => {
                                    if (newValue?.length === 0 || newValue?.length === 1) {
                                        setMajor(newValue as IOptionSelect[]);
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>

                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
                            name="classes"
                            label="Lớp học"
                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={classes}
                                value={classes}
                                placeholder="Chọn lớp học"
                                fetchOptions={fetchClassesList}
                                onChange={(newValue: any) => {
                                    if (newValue?.length === 0 || newValue?.length === 1) {
                                        setClasses(newValue as IOptionSelect[]);
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>

                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
                            name="yearOfAdmission"
                            label="Năm nhập học"
                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={cohort}
                                value={cohort}
                                placeholder="Chọn năm nhập học"
                                fetchOptions={fetchCohortList}
                                onChange={(newValue: any) => {
                                    if (newValue?.length === 0 || newValue?.length === 1) {
                                        setCohort(newValue as IOptionSelect[]);
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>

                    </Col> */}
                </Row>
            </ModalForm>
        </>
    )
}

export default UserModal