import { UploadOutlined } from "@ant-design/icons";
import { Form, Input, Modal, Upload } from "antd";
import type { FormInstance, UploadFile, UploadProps } from "antd";

interface IProps {
    open: boolean;
    loading: boolean;
    form: FormInstance;
    fileList: UploadFile[];
    setFileList: (v: UploadFile[]) => void;
    onCancel: () => void;
    onOk: () => void;
}

const UploadDocumentModal = ({
    open,
    loading,
    form,
    fileList,
    setFileList,
    onCancel,
    onOk,
}: IProps) => {
    const uploadProps: UploadProps = {
        beforeUpload: () => false,
        maxCount: 1,
        fileList,
        onChange: ({ fileList }) => setFileList(fileList),
        accept: ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png",
    };

    return (
        <Modal
            title="Upload tài liệu lớp học"
            open={open}
            onCancel={onCancel}
            onOk={onOk}
            okText="Upload"
            cancelText="Hủy"
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Tiêu đề tài liệu"
                    name="title"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập tiêu đề tài liệu",
                        },
                    ]}
                >
                    <Input placeholder="VD: Slide bài 1 - Tổng quan môn học" />
                </Form.Item>

                <Form.Item label="File tài liệu" required>
                    <Upload.Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">
                            Bấm hoặc kéo thả file vào đây
                        </p>
                        <p className="ant-upload-hint">
                            Hỗ trợ PDF, DOC, DOCX, PPT, PPTX, JPG, PNG
                        </p>
                    </Upload.Dragger>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UploadDocumentModal;
