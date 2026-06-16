import { Card, Empty, Spin, Tabs } from "antd";
import { useEffect, useState } from "react";
import { getTeacherProfileAPI } from "@/services/api";
import TeacherProfileHeader from "./_components/TeacherProfileHeader";
import TeacherInfoTab from "./_components/TeacherInfoTab";
import TeacherSubjectsTab from "./_components/TeacherSubjectsTab";
import TeacherCoursesTab from "./_components/TeacherCoursesTab";
import TeacherStatsCards from "./_components/TeacherStatsTab";

const TeacherProfilePage = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await getTeacherProfileAPI();
            console.log(res.data);
            if (res.data) setData(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!data) return <Empty description="Không có dữ liệu giáo viên" />;

    return (
        <div style={{ padding: 24 }}>
            <TeacherProfileHeader teacher={data.teacher} />

            <TeacherStatsCards stats={data.stats} />

            <Card style={{ marginTop: 16 }}>
                <Tabs
                    items={[
                        {
                            key: "info",
                            label: "Thông tin cá nhân",
                            children: <TeacherInfoTab teacher={data.teacher} />,
                        },
                        {
                            key: "subjects",
                            label: "Môn giảng dạy",
                            children: (
                                <TeacherSubjectsTab subjects={data.subjects} />
                            ),
                        },
                        {
                            key: "courses",
                            label: "Lớp học phần",
                            children: (
                                <TeacherCoursesTab courses={data.courses} />
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default TeacherProfilePage;
