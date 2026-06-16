import { Link } from "react-router-dom";
import {
    DashboardOutlined,
    TeamOutlined,
    BookOutlined,
    ReadOutlined,
    BankOutlined,
    DollarOutlined,
    UserOutlined,
    ApartmentOutlined,
    ProfileOutlined,
    CalendarOutlined,
    ScheduleOutlined,
    HomeOutlined,
    BuildOutlined,
    AuditOutlined,
    WalletOutlined,
} from "@ant-design/icons";
import type { MenuItem } from "@/helper/menu";

export const adminMenuItems: MenuItem[] = [
    {
        label: <Link to="/">Dashboard</Link>,
        key: "/",
        icon: <DashboardOutlined />,
    },

    {
        label: "Quản lý người dùng",
        key: "/manage-user",
        icon: <TeamOutlined />,
        children: [
            {
                label: <Link to="/manage-user/users">Người dùng</Link>,
                key: "/manage-user/users",
                icon: <UserOutlined />,
            },
        ],
    },

    {
        label: "Quản lý Chương trình Đào tạo",
        key: "/manage-curriculum",
        icon: <BookOutlined />,
        children: [
            {
                label: <Link to="/manage-curriculum/faculty">Khoa</Link>,
                key: "/manage-curriculum/faculty",
                icon: <BankOutlined />,
            },
            {
                label: <Link to="/manage-curriculum/department">Bộ môn</Link>,
                key: "/manage-curriculum/department",
                icon: <ApartmentOutlined />,
            },
            {
                label: <Link to="/manage-curriculum/major">Chuyên ngành</Link>,
                key: "/manage-curriculum/major",
                icon: <ProfileOutlined />,
            },
            {
                label: (
                    <Link to="/manage-curriculum/course">
                        Chương trình đào tạo
                    </Link>
                ),
                key: "/manage-curriculum/course",
                icon: <ReadOutlined />,
            },
            {
                label: <Link to="/manage-curriculum/subject">Môn học</Link>,
                key: "/manage-curriculum/subject",
                icon: <BookOutlined />,
            },
        ],
    },

    {
        label: "Quản lý Môn học và lớp học",
        key: "/manage-subject",
        icon: <ReadOutlined />,
        children: [
            {
                label: <Link to="/manage-subject/term">Học kỳ</Link>,
                key: "/manage-subject/term",
                icon: <CalendarOutlined />,
            },
            {
                label: (
                    <Link to="/manage-subject/course-offering">
                        Lớp học phần
                    </Link>
                ),
                key: "/manage-subject/course-offering",
                icon: <ReadOutlined />,
            },
            {
                label: <Link to="/manage-subject/class">Lớp học</Link>,
                key: "/manage-subject/class",
                icon: <HomeOutlined />,
            },
            {
                label: <Link to="/manage-subject/schedule">Lịch học</Link>,
                key: "/manage-subject/schedule",
                icon: <ScheduleOutlined />,
            },
        ],
    },

    {
        label: "Quản lý Cơ sở & Phòng học",
        key: "/manage-campus-room",
        icon: <BankOutlined />,
        children: [
            {
                label: (
                    <Link to="/manage-campus-room/campus">
                        Cơ sở và Tòa nhà
                    </Link>
                ),
                key: "/manage-campus-room/campus",
                icon: <BuildOutlined />,
            },
            {
                label: (
                    <Link to="/manage-campus-room/classrooms">Phòng học</Link>
                ),
                key: "/manage-campus-room/classrooms",
                icon: <HomeOutlined />,
            },
        ],
    },

    {
        label: "Tài chính",
        key: "/manage-finance",
        icon: <DollarOutlined />,
        children: [
            {
                label: <Link to="/manage-finance">Quản lý thanh toán</Link>,
                key: "/manage-finance/payments",
                icon: <WalletOutlined />,
            },
            // {
            //     label: (
            //         <Link to="/manage-finance/salary">
            //             Tính lương giảng viên
            //         </Link>
            //     ),
            //     key: "/manage-finance/salary",
            //     icon: <AuditOutlined />,
            // },
        ],
    },
];
