import { Link } from "react-router-dom";
import { AppstoreOutlined, ExceptionOutlined } from "@ant-design/icons";
import type { MenuItem } from "@/helper/menu";

export const adminMenuItems: MenuItem[] = [
    {
        label: <Link to="/">Dashboard</Link>,
        key: "/",
        icon: <AppstoreOutlined />,
    },
    {
        label: "Quản lý người dùng",
        key: "/manage-user",
        icon: <ExceptionOutlined />,
        children: [
            {
                label: <Link to="/manage-user/users">Người dùng</Link>,
                key: "/manage-user/users",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-user/roles">Phân quyền</Link>,
                key: "/manage-user/roles",
                icon: <ExceptionOutlined />,
            },
        ],
    },
    {
        label: "Quản lý Chương trình Đào tạo",
        key: "/manage-curriculum",
        icon: <ExceptionOutlined />,
        children: [
            {
                label: <Link to="/manage-curriculum/course">Khóa học</Link>,
                key: "/manage-curriculum/course",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-curriculum/major">Chuyên ngành</Link>,
                key: "/manage-curriculum/major",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-curriculum/semester">Kỳ học</Link>,
                key: "/manage-curriculum/semester",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-curriculum/curriculum">Lộ trình học chuyên nghành</Link>,
                key: "/manage-curriculum/curriculum",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-curriculum/subject">Môn học</Link>,
                key: "/manage-curriculum/subject",
                icon: <ExceptionOutlined />,
            },
        ],
    },
    {
        label: "Quản lý Môn học và lớp học",
        key: "/manage-subject",
        icon: <ExceptionOutlined />,
        children: [
            {
                label: <Link to="/manage-subject/class">Lớp học</Link>,
                // NOTE: bạn đang để key là "/manage-curriculum/class" (có vẻ sai)
                key: "/manage-curriculum/class",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-subject/users">Lịch học</Link>,
                key: "/manage-subject/users",
                icon: <ExceptionOutlined />,
            },
        ],
    },
    {
        label: "Quản lý Cơ sở & Phòng học",
        key: "/manage-campus-room",
        icon: <ExceptionOutlined />,
        children: [
            {
                label: <Link to="/manage-campus-room/buildings">Cơ sở và Tòa nhà</Link>,
                key: "/manage-campus-room/buildings",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-campus-room/classrooms">Phòng học</Link>,
                key: "/manage-campus-room/classrooms",
                icon: <ExceptionOutlined />,
            },
        ],
    },
    {
        label: "Quản lý Cơ sở vật chất",
        key: "/manage-facility",
        icon: <ExceptionOutlined />,
        children: [
            {
                label: <Link to="/manage-facility/facility">Quản lý Thiết bị theo số lượng</Link>,
                key: "/manage-facility/facility",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-facility/facility-items">Quản lý từng thiết bị cụ thể</Link>,
                key: "/manage-facility/facility-items",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-facility/device_loans">Quản lý mượn/trả thiết bị</Link>,
                key: "/manage-facility/device_loans",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-facility/supplier">Nhà cung cấp</Link>,
                key: "/manage-facility/supplier",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-facility/facility-history">Lịch sử bố trí thiết bị</Link>,
                key: "/manage-facility/facility-history",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-facility/maintenance-history">Lịch sử bảo trì</Link>,
                key: "/manage-facility/maintenance-history",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-facility/facility-status-logs">Lịch sử thay đổi trạng thái</Link>,
                key: "/manage-facility/facility-status-logs",
                icon: <ExceptionOutlined />,
            },
        ],
    },
    {
        label: "Quản lý người cán bộ giảng viên",
        key: "/manage-teacher",
        icon: <ExceptionOutlined />,
        children: [
            {
                label: <Link to="/manage-teacher/roles">Lịch sử chấm công</Link>,
                key: "/manage-teacher/roles",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/manage-teacher/salary">Tính lương giảng viên</Link>,
                key: "/manage-teacher/salary",
                icon: <ExceptionOutlined />,
            },
        ],
    },
];
