import { notification } from "antd";

const formatSkippedErrors = (skipped: any[], max = 5) => {
    if (!skipped?.length) return "Không có lỗi";

    const lines = skipped
        .slice(0, max)
        .map((item, index) => `${index + 1}. ${item.reason}`);

    if (skipped.length > max) {
        lines.push(`... và ${skipped.length - max} lỗi khác`);
    }

    return lines.join("\n");
};

export default formatSkippedErrors;
