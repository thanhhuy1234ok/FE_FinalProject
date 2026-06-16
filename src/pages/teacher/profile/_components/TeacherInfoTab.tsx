import { Descriptions, Tag } from "antd";

const TeacherInfoTab = ({ teacher }: any) => {
    const user = teacher?.user;

    return (
        <Descriptions bordered column={2}>
            <Descriptions.Item label="Họ tên">
                {user?.name || teacher?.fullName || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
                {user?.email || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Số điện thoại">
                {user?.phone || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Mã giáo viên">
                {teacher?.msgv || teacher?.code || teacher?.id || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Khoa / Bộ môn">
                {teacher?.department?.name || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Chuyên môn">
                {teacher?.specialization || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
                <Tag color={teacher?.isActive === false ? "red" : "green"}>
                    {teacher?.isActive === false
                        ? "Ngưng hoạt động"
                        : "Đang hoạt động"}
                </Tag>
            </Descriptions.Item>
        </Descriptions>
    );
};

export default TeacherInfoTab;
