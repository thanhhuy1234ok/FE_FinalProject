import { Card, Space, Spin, Tabs, Typography } from "antd";
import { useStudentCourseRegistration } from "../_hooks/useStudentCourseRegistration";
import RegistrationTab from "./tab/registation";
import RegisteredCoursesTab from "./tab/registeredCourse";

const { Title, Text } = Typography;

const StudentCourseRegistration = () => {
    const {
        availableData,
        registeredData,
        loading,
        submitting,
        selectedRowKeys,
        keyword,
        selectedRegisteredTerm,
        selectedCourses,
        selectedSubjectIds,
        registeredTermOptions,
        filteredRegisteredData,
        setKeyword,
        setSelectedRowKeys,
        setSelectedRegisteredTerm,
        handleSearch,
        handleClearSearch,
        handleRegisterSelected,
        handleCancel,
        handlePayAll,
    } = useStudentCourseRegistration();

    return (
        <Card>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Title level={3} style={{ margin: 0 }}>
                    Đăng ký môn học
                </Title>
                <Text type="secondary">
                    Tích chọn môn ở bảng trên, môn sẽ xuất hiện ở bảng dưới để
                    bạn xác nhận đăng ký. Mỗi môn chỉ được chọn 1 lớp học phần.
                </Text>

                <Spin spinning={loading}>
                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            {
                                key: "1",
                                label: "Chọn môn đăng ký",
                                children: (
                                    <RegistrationTab
                                        availableData={availableData}
                                        registeredData={registeredData}
                                        selectedCourses={selectedCourses}
                                        selectedRowKeys={selectedRowKeys}
                                        selectedSubjectIds={selectedSubjectIds}
                                        keyword={keyword}
                                        loading={loading}
                                        submitting={submitting}
                                        onKeywordChange={setKeyword}
                                        onSearch={handleSearch}
                                        onClearSearch={handleClearSearch}
                                        onSelectChange={setSelectedRowKeys}
                                        onRemoveSelected={(id: any) =>
                                            setSelectedRowKeys((prev: any) =>
                                                prev.filter(
                                                    (key: any) =>
                                                        Number(key) !== id,
                                                ),
                                            )
                                        }
                                        onClearAllSelected={() =>
                                            setSelectedRowKeys([])
                                        }
                                        onRegisterSelected={
                                            handleRegisterSelected
                                        }
                                    />
                                ),
                            },
                            {
                                key: "2",
                                label: `Môn đã đăng ký (${registeredData.length})`,
                                children: (
                                    <RegisteredCoursesTab
                                        registeredData={registeredData}
                                        filteredRegisteredData={
                                            filteredRegisteredData
                                        }
                                        registeredTermOptions={
                                            registeredTermOptions
                                        }
                                        selectedRegisteredTerm={
                                            selectedRegisteredTerm
                                        }
                                        loading={loading}
                                        submitting={submitting}
                                        onChangeTerm={setSelectedRegisteredTerm}
                                        onPayAll={handlePayAll}
                                        onCancel={handleCancel}
                                    />
                                ),
                            },
                        ]}
                    />
                </Spin>
            </Space>
        </Card>
    );
};

export default StudentCourseRegistration;
