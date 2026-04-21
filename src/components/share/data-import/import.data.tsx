import { Modal, notification, Table, message, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useState } from "react";
import type { UploadProps } from "antd";
const { Dragger } = Upload;
import type { UploadRequestOption } from "rc-upload/lib/interface";
import formatSkippedErrors from "../error.message";

const ImportExcelData = <T extends Record<string, any>>(
    props: IDataImportProps<T>,
) => {
    const { setOpenModalImport, openModalImport } = props;

    // ✅ state dùng T[]
    const [dataExcel, setDataExcel] = useState<T[]>([]);

    const dummyRequest = (options: UploadRequestOption) => {
        const { onSuccess } = options;
        if (onSuccess) {
            setTimeout(() => onSuccess("ok"), 500);
        }
    };

    const propsUpload: UploadProps = {
        name: "file",
        multiple: false,
        maxCount: 1,
        accept: ".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        customRequest: dummyRequest,
        onChange(info: any) {
            const { status } = info.file;

            if (status === "done") {
                if (info.fileList?.length > 0) {
                    const file = info.fileList[0].originFileObj as File;
                    const reader = new FileReader();
                    reader.readAsArrayBuffer(file);

                    reader.onload = function () {
                        const data = new Uint8Array(
                            reader.result as ArrayBuffer,
                        );
                        const workbook = XLSX.read(data, { type: "array" });
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];

                        // XLSX header cần string[] -> cast từ (keyof T)[]
                        const json = XLSX.utils.sheet_to_json<any>(sheet, {
                            header: props.dataMapping as string[],
                            range: 1, // bỏ header row
                            defval: null, // tránh undefined
                        }) as T[];

                        if (json?.length) setDataExcel(json);
                    };
                }

                message.success(
                    `${info.file.name} file uploaded successfully.`,
                );
            } else if (status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log("Dropped files", e.dataTransfer.files);
        },
    };

    const handleSubmit = async () => {
        try {
            const payload = props.transformData
                ? props.transformData(dataExcel)
                : dataExcel;

            const res = await props.apiFunction(payload);

            const result = res?.data?.data || {};
            const success = result.countSuccess ?? 0;
            const error = result.countError ?? 0;
            const skipped = result.skipped ?? result.errors ?? [];

            if (success > 0) {
                notification.success({
                    message: "Upload thành công",
                    description: `Thành công: ${success}${error > 0 ? `, Lỗi: ${error}` : ""}`,
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
                message: "Đã có lỗi xảy ra",
                description: res?.data?.message ?? "Unknown error",
            });
        } catch (error: any) {
            const errMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Submit failed";

            notification.error({
                message: "Đã có lỗi xảy ra",
                description: Array.isArray(errMessage)
                    ? errMessage.join("\n")
                    : errMessage,
            });

            setDataExcel([]);
            setOpenModalImport(false);
            props.fetchData();
        }
    };

    // ✅ columns theo dataMapping
    const columns = props.headers.map((header, index) => ({
        title: header,
        dataIndex: props.dataMapping[index] as string,
    }));

    const rowKey =
        props.rowKey ??
        ((record: T) =>
            String(
                (record as any).id ?? (record as any).email ?? Math.random(),
            ));

    return (
        <Modal
            title={props.uploadTitle ?? "Import data"}
            width={"50vw"}
            open={openModalImport}
            onOk={handleSubmit}
            onCancel={() => {
                setOpenModalImport(false);
                setDataExcel([]);
            }}
            okText="Import data"
            okButtonProps={{ disabled: dataExcel.length < 1 }}
            maskClosable={false}
        >
            <Dragger {...propsUpload} showUploadList={dataExcel.length > 0}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                    Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                    Support for a single upload. Only accept .csv, .xls, .xlsx
                    or{" "}
                    <a
                        onClick={(e) => e.stopPropagation()}
                        href={props.templateFileUrl}
                        download
                    >
                        Download Sample File
                    </a>
                </p>
            </Dragger>

            <div style={{ paddingTop: 20 }}>
                <Table
                    dataSource={dataExcel}
                    rowKey={rowKey as any}
                    title={() => <span>Dữ liệu upload:</span>}
                    columns={columns as any}
                />
            </div>
        </Modal>
    );
};

export default ImportExcelData;
