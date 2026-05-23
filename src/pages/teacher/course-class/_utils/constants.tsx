import {
    FilePdfOutlined,
    FileUnknownOutlined,
    FileWordOutlined,
} from "@ant-design/icons";

export const dayMap: Record<number, string> = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
    8: "Chủ nhật",
};

export const statusTextMap: Record<string, string> = {
    OPEN: "Đang mở",
    CLOSED: "Đã đóng",
    REGISTERED: "Đang học",
    CANCELLED: "Đã hủy",
};

export const getFileIcon = (fileType?: string) => {
    if (fileType?.includes("pdf")) {
        return <FilePdfOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />;
    }

    if (fileType?.includes("word") || fileType?.includes("document")) {
        return <FileWordOutlined style={{ fontSize: 24, color: "#1677ff" }} />;
    }

    return <FileUnknownOutlined style={{ fontSize: 24, color: "#8c8c8c" }} />;
};
