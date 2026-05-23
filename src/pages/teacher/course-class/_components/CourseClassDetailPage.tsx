import {
    BookOutlined,
    CheckCircleOutlined,
    MessageOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import {
    Badge,
    Button,
    Card,
    Empty,
    Form,
    Modal,
    Space,
    Spin,
    Tabs,
    message,
} from "antd";
import type { UploadFile } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    deleteCourseDocumentAPI,
    getCourseDocumentsAPI,
    getTeacherCourseDetailAPI,
    publishGradesAPI,
    uploadCourseDocumentAPI,
    updateGradeAPI,
} from "@/services/api";

import { socket } from "@/socket/socket";
import CourseChatSection from "./ChatRoomPage";
import CourseHeader from "./CourseHeader";
import CourseInfoTab from "./CourseInfoTab";
import StudentGradeTab from "./StudentGradeTab";
import UploadDocumentModal from "./UploadDocumentModal";

const CourseClassDetailPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState<any>(null);

    const [documents, setDocuments] = useState<any[]>([]);
    const [documentLoading, setDocumentLoading] = useState(false);

    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [activeTab, setActiveTab] = useState("info");
    const [chatUnread, setChatUnread] = useState(0);

    const [gradeLoading, setGradeLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [editingGrades, setEditingGrades] = useState<Record<number, any>>({});

    const students = useMemo(() => {
        return course?.courseRegistrations || [];
    }, [course]);

    const subject = course?.teacherSubject?.subject;

    const isGradePublished = useMemo(() => {
        if (!students.length) return false;

        return students.some((item: any) => item?.grade?.isPublished);
    }, [students]);

    const fetchCourseDetail = async () => {
        if (!courseId) return;

        try {
            setLoading(true);

            const res = await getTeacherCourseDetailAPI(courseId);
            const data = res?.data?.data || res?.data?.result || res?.data;

            setCourse(data);
        } catch (error) {
            console.log("ERROR DETAIL COURSE:", error);
            message.error("Không tải được chi tiết lớp học");
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        if (!courseId) return;

        try {
            setDocumentLoading(true);

            const res = await getCourseDocumentsAPI(Number(courseId));
            const data =
                res?.data?.data || res?.data?.result || res?.data || [];

            setDocuments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("ERROR DOCUMENTS:", error);
            message.error("Không tải được tài liệu");
        } finally {
            setDocumentLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseDetail();
        fetchDocuments();
    }, [courseId]);

    useEffect(() => {
        const handleConversationUpdated = (payload: any) => {
            if (!course?.id) return;
            if (payload?.courseOfferingId !== course.id) return;

            if (activeTab !== "chat") {
                setChatUnread(payload?.unreadCount || 1);
            }
        };

        socket.on("conversation:updated", handleConversationUpdated);

        return () => {
            socket.off("conversation:updated", handleConversationUpdated);
        };
    }, [course?.id, activeTab]);

    const handleOpenUploadModal = () => {
        form.resetFields();
        setFileList([]);
        setOpenUploadModal(true);
    };

    const handleUploadDocument = async () => {
        if (!courseId) return;

        try {
            const values = await form.validateFields();
            const file = fileList?.[0]?.originFileObj;

            if (!file) {
                message.warning("Vui lòng chọn file tài liệu");
                return;
            }

            setUploading(true);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", values.title);

            await uploadCourseDocumentAPI(Number(courseId), formData);

            message.success("Upload tài liệu thành công");

            setOpenUploadModal(false);
            form.resetFields();
            setFileList([]);

            fetchDocuments();
        } catch (error) {
            console.log("UPLOAD ERROR:", error);
            message.error("Upload tài liệu thất bại");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (documentId: number) => {
        try {
            await deleteCourseDocumentAPI(documentId);

            message.success("Xóa tài liệu thành công");
            fetchDocuments();
        } catch (error) {
            console.log("DELETE DOCUMENT ERROR:", error);
            message.error("Xóa tài liệu thất bại");
        }
    };

    const handleGradeChange = (
        gradeId: number,
        field: "midtermScore" | "finalScore",
        value: number | null,
    ) => {
        setEditingGrades((prev) => ({
            ...prev,
            [gradeId]: {
                ...prev[gradeId],
                [field]: value,
            },
        }));
    };

    const handleSaveGrade = async (record: any) => {
        const grade = record?.grade;

        if (!grade?.id) {
            message.error("Sinh viên chưa có bảng điểm");
            return;
        }

        const editing = editingGrades[grade.id] || {};

        const midtermScore =
            editing.midtermScore !== undefined
                ? editing.midtermScore
                : grade.midtermScore;

        const finalScore =
            editing.finalScore !== undefined
                ? editing.finalScore
                : grade.finalScore;

        if (midtermScore === null || midtermScore === undefined) {
            message.warning("Vui lòng nhập điểm giữa kỳ");
            return;
        }

        if (finalScore === null || finalScore === undefined) {
            message.warning("Vui lòng nhập điểm cuối kỳ");
            return;
        }

        try {
            setGradeLoading(true);

            await updateGradeAPI({
                gradeId: grade.id,
                midtermScore: Number(midtermScore),
                finalScore: Number(finalScore),
            });

            message.success("Lưu điểm thành công");

            setEditingGrades((prev) => {
                const next = { ...prev };
                delete next[grade.id];
                return next;
            });

            fetchCourseDetail();
        } catch (error) {
            console.log("UPDATE GRADE ERROR:", error);
            message.error("Lưu điểm thất bại");
        } finally {
            setGradeLoading(false);
        }
    };

    const handlePublishGrades = () => {
        if (!courseId) return;

        if (!students.length) {
            message.warning("Lớp chưa có sinh viên để công bố điểm");
            return;
        }

        Modal.confirm({
            title: "Công bố điểm",
            content: `Sau khi công bố, sinh viên sẽ xem được điểm môn ${
                subject?.name || ""
            }.`,
            okText: "Công bố",
            cancelText: "Hủy",
            centered: true,
            async onOk() {
                try {
                    setPublishLoading(true);

                    await publishGradesAPI(Number(courseId));

                    message.success("Công bố điểm thành công");
                    fetchCourseDetail();
                } catch (error: any) {
                    console.log("PUBLISH GRADE ERROR:", error);
                    message.error(
                        error?.response?.data?.message ||
                            "Công bố điểm thất bại",
                    );
                } finally {
                    setPublishLoading(false);
                }
            },
        });
    };

    if (loading) {
        return (
            <div style={{ padding: 24 }}>
                <Spin spinning />
            </div>
        );
    }

    if (!course || !subject) {
        return (
            <div style={{ padding: 24 }}>
                <Card style={{ borderRadius: 20 }}>
                    <Empty description="Không tìm thấy lớp học" />
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
                <CourseHeader
                    course={course}
                    subject={subject}
                    students={students}
                    onBack={() => navigate(-1)}
                />

                <Card style={{ borderRadius: 20 }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => {
                            setActiveTab(key);

                            if (key === "chat") {
                                setChatUnread(0);
                            }
                        }}
                        size="large"
                        items={[
                            {
                                key: "info",
                                label: (
                                    <Space>
                                        <BookOutlined />
                                        Thông tin lớp & tài liệu
                                    </Space>
                                ),
                                children: (
                                    <CourseInfoTab
                                        course={course}
                                        subject={subject}
                                        documents={documents}
                                        documentLoading={documentLoading}
                                        onOpenUpload={handleOpenUploadModal}
                                        onDeleteDocument={handleDeleteDocument}
                                    />
                                ),
                            },
                            {
                                key: "students",
                                label: (
                                    <Space>
                                        <TeamOutlined />
                                        Sinh viên & điểm
                                    </Space>
                                ),
                                children: (
                                    <Space
                                        direction="vertical"
                                        size={16}
                                        style={{ width: "100%" }}
                                    >
                                        <Card
                                            style={{
                                                borderRadius: 16,
                                                background: isGradePublished
                                                    ? "#f6ffed"
                                                    : "#fffbe6",
                                                border: isGradePublished
                                                    ? "1px solid #b7eb8f"
                                                    : "1px solid #ffe58f",
                                            }}
                                            bodyStyle={{
                                                padding: 16,
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 12,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <Space
                                                direction="vertical"
                                                size={2}
                                            >
                                                <b>
                                                    {isGradePublished
                                                        ? "Điểm đã được công bố"
                                                        : "Điểm chưa được công bố"}
                                                </b>
                                                <span
                                                    style={{
                                                        color: "#666",
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    Sinh viên chỉ xem được điểm
                                                    sau khi giáo viên công bố.
                                                </span>
                                            </Space>

                                            <Button
                                                type="primary"
                                                icon={<CheckCircleOutlined />}
                                                loading={publishLoading}
                                                disabled={isGradePublished}
                                                onClick={handlePublishGrades}
                                                style={{
                                                    background: isGradePublished
                                                        ? undefined
                                                        : "#52c41a",
                                                }}
                                            >
                                                {isGradePublished
                                                    ? "Đã công bố"
                                                    : "Công bố điểm"}
                                            </Button>
                                        </Card>

                                        <StudentGradeTab
                                            students={students}
                                            editingGrades={editingGrades}
                                            gradeLoading={gradeLoading}
                                            onGradeChange={handleGradeChange}
                                            onSaveGrade={handleSaveGrade}
                                        />
                                    </Space>
                                ),
                            },
                            {
                                key: "chat",
                                label: (
                                    <Badge count={chatUnread} size="small">
                                        <Space>
                                            <MessageOutlined />
                                            Chat room
                                        </Space>
                                    </Badge>
                                ),
                                children: (
                                    <CourseChatSection
                                        courseOfferingId={course.id}
                                        isActive={activeTab === "chat"}
                                        onSeen={() => setChatUnread(0)}
                                    />
                                ),
                            },
                        ]}
                    />
                </Card>
            </Space>

            <UploadDocumentModal
                open={openUploadModal}
                loading={uploading}
                form={form}
                fileList={fileList}
                setFileList={setFileList}
                onCancel={() => {
                    setOpenUploadModal(false);
                    form.resetFields();
                    setFileList([]);
                }}
                onOk={handleUploadDocument}
            />
        </div>
    );
};

export default CourseClassDetailPage;
