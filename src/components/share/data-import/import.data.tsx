import { InboxOutlined } from "@ant-design/icons";
import { Button, Modal, notification, Table, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import * as XLSX from "xlsx";
import { useState } from "react";
import formatSkippedErrors from "../error.message";

const { Dragger } = Upload;

const ImportExcelData = <T extends Record<string, any>>(
    props: IDataImportProps<T>,
) => {
    const { setOpenModalImport, openModalImport } = props;

    const [dataExcel, setDataExcel] = useState<T[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);

    const parseExcelFile = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const buffer = e.target?.result;

                const workbook = XLSX.read(buffer, {
                    type: "array",
                });

                const sheetName = workbook.SheetNames[0];

                if (!sheetName) {
                    notification.error({
                        message: "File không hợp lệ",
                        description: "Không tìm thấy sheet trong file Excel",
                    });
                    return;
                }

                const sheet = workbook.Sheets[sheetName];

                const rows = XLSX.utils.sheet_to_json<T>(sheet, {
                    header: props.dataMapping as string[],
                    range: 1,
                    defval: null,
                    blankrows: false,
                });

                const cleanRows = rows.filter((row) =>
                    Object.values(row).some(
                        (value) =>
                            value !== null &&
                            value !== undefined &&
                            String(value).trim() !== "",
                    ),
                );

                setDataExcel(cleanRows);

                if (!cleanRows.length) {
                    notification.warning({
                        message: "File không có dữ liệu",
                        description: "Vui lòng kiểm tra lại file Excel",
                    });
                    return;
                }

                notification.success({
                    message: "Đọc file thành công",
                    description: `Đã đọc ${cleanRows.length} dòng dữ liệu`,
                });
            } catch (error) {
                notification.error({
                    message: "Lỗi đọc file",
                    description: "File không đúng định dạng hoặc bị lỗi",
                });
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const propsUpload: UploadProps = {
        name: "file",
        multiple: false,
        maxCount: 1,
        fileList,
        accept: ".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        beforeUpload(file) {
            setFileList([file]);
            parseExcelFile(file as File);

            return false;
        },

        onRemove() {
            setFileList([]);
            setDataExcel([]);
        },
    };

    const handleSubmit = async () => {
        if (!dataExcel.length) {
            notification.warning({
                message: "Chưa có dữ liệu",
                description: "Vui lòng chọn file Excel trước khi import",
            });
            return;
        }

        try {
            setLoading(true);

            const payload = props.transformData
                ? props.transformData(dataExcel)
                : dataExcel;

            const res = await props.apiFunction(payload);

            const result = res?.data?.data || res?.data || {};
            const success = result.countSuccess ?? 0;
            const error = result.countError ?? 0;
            const skipped = result.skipped ?? result.errors ?? [];

            if (success > 0) {
                notification.success({
                    message: "Import thành công",
                    description: `Thành công: ${success}${
                        error > 0 ? `, Lỗi: ${error}` : ""
                    }`,
                });

                if (error > 0 && skipped.length > 0) {
                    notification.warning({
                        message: "Một số dòng bị lỗi",
                        description: (
                            <div style={{ whiteSpace: "pre-line" }}>
                                {formatSkippedErrors(skipped, 5)}
                            </div>
                        ),
                    });
                }

                setDataExcel([]);
                setFileList([]);
                setOpenModalImport(false);
                props.fetchData();
                return;
            }

            if (error > 0 && skipped.length > 0) {
                notification.error({
                    message: "Import thất bại",
                    description: (
                        <div style={{ whiteSpace: "pre-line" }}>
                            {formatSkippedErrors(skipped, 5)}
                        </div>
                    ),
                });
                return;
            }

            notification.error({
                message: "Import thất bại",
                description: res?.data?.message ?? "Không có dữ liệu được thêm",
            });
        } catch (error: any) {
            const errMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Import failed";

            notification.error({
                message: "Đã có lỗi xảy ra",
                description: Array.isArray(errMessage)
                    ? errMessage.join("\n")
                    : errMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;

        setOpenModalImport(false);
        setDataExcel([]);
        setFileList([]);
    };

    const columns = props.headers.map((header, index) => ({
        title: header,
        dataIndex: props.dataMapping[index] as string,
        key: props.dataMapping[index] as string,
        ellipsis: true,
    }));

    return (
        <Modal
            title={props.uploadTitle ?? "Import data"}
            width="70vw"
            open={openModalImport}
            onOk={handleSubmit}
            onCancel={handleClose}
            okText="Import data"
            confirmLoading={loading}
            okButtonProps={{
                disabled: dataExcel.length < 1,
            }}
            maskClosable={false}
            destroyOnClose
        >
            <Dragger {...propsUpload}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>

                <p className="ant-upload-text">
                    Click hoặc kéo file Excel vào đây để upload
                </p>

                <p className="ant-upload-hint">
                    Chỉ hỗ trợ 1 file .csv, .xls, .xlsx
                </p>

                {props.templateFileUrl && (
                    <Button
                        type="link"
                        onClick={(e) => e.stopPropagation()}
                        href={props.templateFileUrl}
                        download
                    >
                        Download Sample File
                    </Button>
                )}
            </Dragger>

            <div style={{ paddingTop: 20 }}>
                <Table
                    bordered
                    size="small"
                    dataSource={dataExcel}
                    columns={columns as any}
                    rowKey={(_, index) => String(index)}
                    title={() => (
                        <span>
                            Dữ liệu upload: <b>{dataExcel.length}</b> dòng
                        </span>
                    )}
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                    }}
                    scroll={{
                        x: "max-content",
                    }}
                />
            </div>
        </Modal>
    );
};

export default ImportExcelData;
