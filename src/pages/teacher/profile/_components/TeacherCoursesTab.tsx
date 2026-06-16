import { Table } from "antd";

const TeacherCoursesTab = ({ courses = [] }: any) => {
    const columns = [
        {
            title: "Mã lớp học phần",
            dataIndex: "code",
        },
        {
            title: "Môn học",
            render: (_: any, record: any) =>
                record.teacherSubject?.subject?.name || "-",
        },
        {
            title: "Lớp",
            render: (_: any, record: any) =>
                record.adminClass?.name || "Lớp chung",
        },
        {
            title: "Học kỳ",
            render: (_: any, record: any) =>
                record.term
                    ? `HK${record.term.semester} - ${record.term.year}`
                    : "-",
        },
        {
            title: "Sinh viên",
            render: (_: any, record: any) =>
                record.courseRegistrations?.length || 0,
        },
        {
            title: "Số buổi",
            render: (_: any, record: any) => record.lessons?.length || 0,
        },
    ];

    return (
        <Table
            rowKey="id"
            columns={columns}
            dataSource={courses}
            pagination={{ pageSize: 5 }}
        />
    );
};

export default TeacherCoursesTab;
