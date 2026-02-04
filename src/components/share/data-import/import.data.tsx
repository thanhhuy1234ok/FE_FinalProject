import { Modal, notification, Table } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useState } from "react";

import { message, Upload } from "antd";
import type { UploadProps } from "antd";
const { Dragger } = Upload;
import type { UploadRequestOption } from "rc-upload/lib/interface";

interface ExcelData {
    name: string;
    email: string;
    role: string;
    major: string;
    class: string;
    yearOfAdmission: number;
}

const ImportExcelData: React.FC<IDataImportProps> = (props) => {
    const { setOpenModalImport, openModalImport } = props;
    const [dataExcel, setDataExcel] = useState<ExcelData[]>([]);

    const dummyRequest = (options: UploadRequestOption) => {
        const { onSuccess } = options;
        if (onSuccess) {
            setTimeout(() => {
                onSuccess("ok");
            }, 1000);
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
            if (status !== "uploading") {
                console.log(info.file, info.fileList);
            }
            if (status === "done") {
                if (info.fileList && info.fileList.length > 0) {
                    const file = info.fileList[0].originFileObj as File;
                    const reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.onload = function () {
                        const data = new Uint8Array(
                            reader.result as ArrayBuffer,
                        );
                        const workbook = XLSX.read(data, { type: "array" });
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const json = XLSX.utils.sheet_to_json<ExcelData>(
                            sheet,
                            {
                                header: props.dataMapping,
                                range: 1,
                            },
                        );
                        if (json && json.length > 0) setDataExcel(json);
                    };
                }
                message.success(
                    `${info.file.name} file uploaded successfully.`,
                );
            } else if (status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e: React.DragEvent<HTMLDivElement>) {
            console.log("Dropped files", e.dataTransfer.files);
        },
    };

    const handleSubmit = async () => {
        const data = dataExcel.map((item) => ({
            ...item,
            password: "123456",
        }));

        const res = await props.apiFunction(data);
        console.log(res);
        if (res.data) {
            console.log(res.data);
            notification.success({
                //@ts-ignore
                description: `Success: ${res.data.countSuccess}, Error: ${res.data.countError}`,
                message: "Upload thành công",
            });
            setDataExcel([]);
            setOpenModalImport(false);
            props.fetchData();
        } else {
            notification.error({
                description: res.message,
                message: "Đã có lỗi xảy ra",
            });
        }
    };

    const columns = props.headers.map((header, index) => ({
        title: header,
        dataIndex: props.dataMapping[index],
    }));

    return (
        <Modal
            title="Import data user"
            width={"50vw"}
            open={openModalImport}
            onOk={handleSubmit}
            onCancel={() => {
                setOpenModalImport(false);
                setDataExcel([]);
            }}
            okText="Import data"
            okButtonProps={{
                disabled: dataExcel.length < 1,
            }}
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
                    Support for a single upload. Only accept .csv, .xls, .xlsx .
                    or &nbsp;
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
                    rowKey="email"
                    title={() => <span>Dữ liệu upload:</span>}
                    columns={columns}
                />
            </div>
        </Modal>
    );
};

export default ImportExcelData;
