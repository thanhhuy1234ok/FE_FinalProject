import { useEffect, useState } from "react";
import { message, Row, Col, Space } from "antd";

import { getDetailUserAPI } from "@/services/api";
import { useCurrentApp } from "@/context/use.curent";
import StudentInfoCard from "./_components/StudentInfoCard";
import OverviewTopStats from "./_components/OverviewTopStats";
import { useNavigate } from "react-router-dom";

const StudentOverviewPage = () => {
    const [loading, setLoading] = useState(false);
    const [studentInfo, setStudentInfo] = useState<IUserDetail>();
    const navigate = useNavigate();
    const { user } = useCurrentApp();

    useEffect(() => {
        const fetchStudentInfo = async () => {
            try {
                setLoading(true);
                //@ts-ignore
                const res = await getDetailUserAPI(user?.id);
                const data = res?.data ?? res;
                //@ts-ignore
                setStudentInfo(data);
            } catch (error: any) {
                message.error(
                    error?.message || "Không thể tải thông tin sinh viên",
                );
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchStudentInfo();
        }
    }, [user?.id]);

    const fakeReminder = {
        count: 1,
        title: "Thông báo mới từ hệ thống học vụ",
        description:
            "Bạn đang có một nhắc nhở mới chưa xem. Nội dung nhắc nhở và lịch thi sẽ được gắn API sau.",
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: 20,
                background: "#fff",
            }}
        >
            <div
                style={{
                    maxWidth: 1440,
                    margin: "0 auto",
                }}
            >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Row gutter={[16, 16]} align="stretch">
                        <Col xs={24} xl={15}>
                            <StudentInfoCard
                                studentInfo={studentInfo}
                                loading={loading}
                                onViewDetail={() => navigate("/profile")}
                            />
                        </Col>

                        <Col xs={24} xl={9}>
                            <OverviewTopStats
                                reminder={fakeReminder}
                                weeklyScheduleCount={10}
                                weeklyExamCount={0}
                                onViewReminder={() =>
                                    console.log("view reminder")
                                }
                                onViewSchedule={() =>
                                    console.log("view schedule")
                                }
                                onViewExam={() => console.log("view exam")}
                            />
                        </Col>
                    </Row>
                </Space>
            </div>
        </div>
    );
};

export default StudentOverviewPage;
