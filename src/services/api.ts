import {
    AUTH_API,
    CAPUS_BUILDING_ROOM_API,
    CLASSES_API,
    COURSE_OFF_API,
    Curriculum_API,
    CURRICULUM_SUBJECT_API,
    DEPARTMENT_API,
    FACULTY_API,
    MAJORS_API,
    ROLES_API,
    SUBJECT_API,
    TERMS_API,
    USER_API,
    YEARS_API,
} from "@/types/constans";
import createInstanceAxios from "./axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

export const LogoutAPI = () => {
    return axios.post<IBackendRes<IFetchAccount>>(AUTH_API.LOGOUT);
};

export const getAccountAPI = () => {
    return axios.get<IBackendRes<IFetchAccount>>(AUTH_API.ACCOUNT);
};

export const LoginAPI = (username: string, password: string) => {
    return axios.post<IBackendRes<ILoginResponse>>(AUTH_API.LOGIN, {
        username,
        password,
    });
};

//** User API */
export const getUserAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUserDetail>>>(
        USER_API.LIST(query),
    );
};

export const createUserAPI = (data: Record<string, unknown>) => {
    return axios.post<IBackendRes<IUserDetail>>(USER_API.CREATE, { ...data });
};

export const getDetailUserAPI = (id: string | number) => {
    return axios.get<IBackendRes<IUserDetail>>(USER_API.DETAIL(id));
};
export const deleteUserAPI = (id: number | string) => {
    return axios.delete<IBackendRes<null>>(USER_API.DELETE(id));
};

export const getListTeacherAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ITeacherProfile>>>(
        USER_API.LIST_TEACHER(query),
    );
};

export const updateUserAPI = (
    id: number | string,
    data: Record<string, unknown>,
) => {
    return axios.put<IBackendRes<IUserDetail>>(USER_API.UPDATE(id), {
        ...data,
    });
};

export const callBulkCreateUser = (items: IStudentExcel[]) => {
    return axios.post<IBackendRes<IStudentExcel[]>>(
        "/api/v1/users/bulk-student",
        { items },
    );
};

//** Role API */
export const getRolesAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(ROLES_API.LIST(query));
};

//** Major API */
export const getMajorsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IMajor>>>(
        MAJORS_API.LIST(query),
    );
};

export const createMajorAPI = (data: Record<string, unknown>) => {
    return axios.post<IBackendRes<IMajor>>(MAJORS_API.CREATE, {
        ...data,
    });
};

export const getMajorDetailAPI = (id: number) => {
    return axios.get<IBackendRes<any>>(MAJORS_API.DETAIL(id));
};

//** Class API */
export const getClassesAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IClass>>>(
        CLASSES_API.LIST(query),
    );
};
//** Year of Admission API */
export const getYearsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IYear>>>(YEARS_API.LIST(query));
};

export const createYearOfAdmissionAPI = (data: Record<string, unknown>) => {
    return axios.post<IBackendRes<IYear>>(YEARS_API.CREATE, {
        ...data,
    });
};

//** Campus Building Room API */
export const getRoomsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRoom>>>(
        CAPUS_BUILDING_ROOM_API.LIST_ROOM(query),
    );
};

export const createRoomAPI = (data: Record<string, unknown>) => {
    return axios.post<IBackendRes<IRoom>>(CAPUS_BUILDING_ROOM_API.CREATE_ROOM, {
        ...data,
    });
};

export const previewCodeRoomAPI = (id: string | number, query: string) => {
    return axios.get<IBackendRes<{ preview_code: string }>>(
        CAPUS_BUILDING_ROOM_API.PREVIEW_CODE_ROOM(id, query),
    );
};

export const getCampusAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICampus>>>(
        CAPUS_BUILDING_ROOM_API.LIST_CAMPUS(query),
    );
};

export const createCampusAPI = (data: Record<string, unknown>) => {
    return axios.post<IBackendRes<ICampus>>(
        CAPUS_BUILDING_ROOM_API.CREATE_CAMPUS,
        {
            ...data,
        },
    );
};

export const getDetailCampusAPI = (id: string | number) => {
    return axios.get<IBackendRes<ICampus>>(
        CAPUS_BUILDING_ROOM_API.DETAIL_CAMPUS(id),
    );
};

export const deleteCampusAPI = (id: string | number) => {
    return axios.delete<IBackendRes<null>>(
        CAPUS_BUILDING_ROOM_API.DELETE_CAMPUS(id),
    );
};

export const createBuildingAPI = (
    CampusId: string | number,
    data: Record<string, unknown>,
) => {
    return axios.post<IBackendRes<IBuilding>>(
        CAPUS_BUILDING_ROOM_API.CREATE_BUILDING(CampusId),
        { ...data },
    );
};
export const getBuildingAPI = (query: any) => {
    return axios.get(CAPUS_BUILDING_ROOM_API.LIST_BUILDING(query));
};

//** Term API */
export const getTermsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ITerm>>>(TERMS_API.LIST(query));
};
export const createTermAPI = (data: any) => {
    return axios.post<IBackendRes<ITerm>>(TERMS_API.CREATE, {
        ...data,
    });
};

export const activateTermAPI = (id: number) => {
    return axios.patch(TERMS_API.IS_ACTIVE(id));
};

//** Curriculum API */
export const getCurriculumsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICurriculum>>>(
        Curriculum_API.LIST(query),
    );
};

export const previewCurriculumsAPI = (data: {
    majorId: number;
    yearOfAdmissionId: number;
}) => {
    return axios.post<IBackendRes<{ name: string; code: string }>>(
        Curriculum_API.Preview,
        data,
    );
};
export const createCurriculumsAPI = (data: Record<string, unknown>) => {
    return axios.post<IBackendRes<ICurriculum>>(Curriculum_API.CREATE, {
        ...data,
    });
};

//** Curriculum Subject API */
export const createBulkCurriculumSubjectAPI = (
    data: ImportCurriculumSubjectPayload,
) => {
    return axios.post<IBackendRes<null>>(
        CURRICULUM_SUBJECT_API.CREATE_BULK,
        data,
    );
};

export const createBulkCurriculumSubjectNameAPI = (
    data: ImportCurriculumSubjectByNamePayload,
) => {
    return axios.post<IBackendRes<null>>(
        CURRICULUM_SUBJECT_API.CREATE_BULK_NAME,
        data,
    );
};

export const getCurriculumSubjectAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICurriculumSubject>>>(
        CURRICULUM_SUBJECT_API.LIST(query),
    );
};

//** Subject API */
export const getSubjectsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISubject>>>(
        SUBJECT_API.LIST(query),
    );
};

export const createSubjectAPI = (data: any) => {
    return axios.post<IBackendRes<ISubject>>(SUBJECT_API.CREATE, data);
};

//** Department API */
export const getDepartmentsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IDepartment>>>(
        DEPARTMENT_API.LIST(query),
    );
};

export const createDepartmentAPI = (data: IDepartment) => {
    return axios.post<IBackendRes<IDepartment>>(DEPARTMENT_API.CREATE, data);
};

export const detailDepartmentAPI = (id: number) => {
    return axios.get<IBackendRes<IDepartment>>(DEPARTMENT_API.DETAIL(id));
};

//** Faculty API */
export const getFacultyAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IFaculty>>>(
        FACULTY_API.LIST(query),
    );
};

export const createFacultyAPI = (data: IDepartment) => {
    return axios.post<IBackendRes<IFaculty>>(FACULTY_API.CREATE, data);
};

export const detailFacultyAPI = (id: number) => {
    return axios.get<IBackendRes<IFaculty>>(FACULTY_API.DETAIL(id));
};

export const countFacultyAPI = (id: number) => {
    return axios.get<IBackendRes<any>>(FACULTY_API.COUNT_FACULTY(id));
};

//** Teacher Subject*//
export const createTeacherSubjectsAPI = (data: {
    teacherId: number | string;
    subjectIds: number[];
}) => {
    return axios.post<
        IBackendRes<{
            teacherId: number | string;
            subjectIds: number[];
        }>
    >("/api/v1/teacher-subject/many-sub", data);
};

export const getTeacherAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<any>>>(
        `/api/v1/users/teachers?${query}`,
    );
};

export const getTeacherSubjectsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<any>>>(
        `/api/v1/teacher-subject?${query}`,
    );
};
//**  */
export const getCourseOfferingAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<any>>>(
        COURSE_OFF_API.LIST(query),
    );
};
export const createCourseOfferingAPI = (data: any) => {
    return axios.post<IBackendRes<any>>(COURSE_OFF_API.CREATE, data);
};

export const updateCourseOfferingStatusAPI = async (
    id: number,
    status: string,
) => {
    return axios.patch(`/api/v1/course-offering/${id}/status`, { status });
};

export const bulkOpenCourseOfferingAPI = async (ids: number[]) => {
    return axios.post("/api/v1/course-offering/open-bulk", { ids });
};

export const getCourseOfferingDetailAPI = (id: number) => {
    return axios.get(`/api/v1/course-offering/${id}`);
};

export const getLessonByCourseOfferingAPI = (courseOfferingId: number) => {
    return axios.get(`/api/v1/lessons/course-offering/${courseOfferingId}`);
};

export const getMyTeachingCoursesAPI = (termId?: number) => {
    return axios.get("/api/v1/course-offering/teacher/my-courses", {
        params: {
            termId,
        },
    });
};

export const getTeacherCourseDetailAPI = (courseId: number | string) => {
    return axios.get(`/api/v1/course-offering/teacher/my-courses/${courseId}`);
};

//** SCHEDULE */
export const getSchedulesAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<any>>>(
        `/api/v1/schedules?${query}`,
    );
};

export const createScheduleAPI = (data: any) => {
    return axios.post<IBackendRes<any>>(`/api/v1/schedules`, data);
};

//** Admin Class */
export const createAdminClassAPI = (data: any) => {
    return axios.post<IBackendRes<any>>(`/api/v1/admin-class`, data);
};

export const getAdminClassAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<any>>>(
        `/api/v1/admin-class?${query}`,
    );
};

export const createAdminClassAdvisorAPI = (data: any) => {
    return axios.post<IBackendRes<any>>(`/api/v1/admin-class-advisor`, data);
};

export const getDetailAdminClassAPI = (id: number) => {
    return axios.get<IBackendRes<any>>(`/api/v1/admin-class/${id}`);
};

export const getDetailAdminClassAdviorAPI = (id: number) => {
    return axios.get<IBackendRes<any>>(`/api/v1/admin-class-advisor/${id}`);
};

export const previewAdminClassAPI = (
    majorId: number,
    yearOfAdmissionId: number,
) => {
    return axios.get(
        `/api/v1/admin-class/preview?majorId=${majorId}&yearOfAdmissionId=${yearOfAdmissionId}`,
    );
};

export const getAvailableCourseOfferingsForStudentAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<any>>>(
        `/api/v1/course-registrations/open-offerings?${query}`,
    );
};

export const getMyCourseRegistrationsAPI = (query: string) => {
    return axios.get<IBackendRes<any>>(
        `/api/v1/course-registrations/registrations-me?${query}`,
    );
};

export const registerCourseAPI = (courseOfferingIds: number[]) => {
    return axios.post<IBackendRes<any>>(
        "/api/v1/course-registrations/register",
        {
            courseOfferingIds,
        },
    );
};

export const cancelCourseRegistrationAPI = (id: number) => {
    return axios.patch<IBackendRes<any>>(
        `/api/v1/course-registrations/${id}/cancel`,
    );
};

export const checkRegisterCourseConflictAPI = (
    courseOfferingId: number,
    selectedCourseOfferingIds: number[] = [],
) => {
    return axios.post("/api/v1/course-registrations/check-conflict", {
        courseOfferingId,
        selectedCourseOfferingIds,
    });
};

export const payPaymentAPI = async (
    paymentId: number,
    body: {
        paymentMethod: "CASH" | "BANK_TRANSFER" | "MOMO" | "VNPAY";
        note?: string;
    },
) => {
    return axios.patch(`/api/v1/payments/${paymentId}/pay`, body);
};

export const getMyPaymentsAPI = async () => {
    return axios.get<IBackendRes<any>>("/api/v1/payments/registered-courses");
};

export const createInvoiceAPI = async () => {
    return axios.post<IBackendRes<any>>(`/api/v1/payments/invoice`);
};

export const getPaymentHistoryAPI = async () => {
    return axios.get<IBackendRes<any>>("/api/v1/payments/history");
};

export const getPaymentDetailAPI = async (paymentId: number) => {
    return axios.get<IBackendRes<any>>(`/api/v1/payments/${paymentId}`);
};

export const getMyLessonsByDateAPI = (date: string) => {
    return axios.get(`/api/v1/lessons/my-lessons-by-date?date=${date}`);
};

export const createVNPayUrlAPI = (paymentId: number) => {
    return axios.post(`/api/v1/payments/${paymentId}/vnpay/create-url`);
};

export const updatePaymentOrderAPI = (status: string, paymentRef: any) => {
    return axios.patch(`/api/v1/payments`, { status, paymentRef });
};

export const returnURLVerifyPaymentAPI = (query: string) => {
    return axios.get(`/api/v1/payments/vnpay-return?${query}`);
};

export const getMyTimeTableAPI = async () => {
    return axios.get<IBackendRes<any>>("/api/v1/schedules/my-timetable");
};

export const getTeacherLessonsByDateAPI = (date: string) => {
    return axios.get<IBackendRes<any>>(`/api/v1/lessons/teacher/by-date`, {
        params: { date },
    });
};

export const getTeacherLessonDetailAPI = (lessonId: number) => {
    return axios.get<IBackendRes<any>>(`/api/v1/lessons/${lessonId}`);
};

export const getTeacherLessonStudentsAPI = (lessonId: number) => {
    return axios.get<IBackendRes<any>>(
        `/api/v1/lessons/teacher/${lessonId}/students`,
    );
};

export const markLessonAttendanceManualAPI = (
    lessonId: number,
    data: {
        registrationId: number;
        status: "PRESENT" | "ABSENT" | "LATE";
    },
) => {
    return axios.post(
        `/api/v1/attendance/teacher/${lessonId}/attendance/manual`,
        data,
    );
};

export const createAttendanceQrAPI = (
    lessonId: number,
    data?: {
        latitude?: number;
        longitude?: number;
    },
) => {
    return axios.post(`/api/v1/attendance/lessons/${lessonId}/qr`, data);
};

export const getTeacherTimeTableAPI = (params?: {
    date?: string;
    from?: string;
    to?: string;
}) => {
    return axios.get<IBackendRes<any>>("/api/v1/schedules/timetable", {
        params,
    });
};

export const getMyNotificationsAPI = () => {
    return axios.get<IBackendRes<any>>("/api/v1/notification/my");
};

export const markNotificationAsReadAPI = (id: number) => {
    return axios.patch(`/api/v1/notification/${id}/read`);
};

export const markAllNotificationsAsReadAPI = () => {
    return axios.patch("/api/v1/notification/read-all");
};

export const markAllNotificationsAsReadALLAPI = () => {
    return axios.patch("/api/v1/notification/read-all");
};

export const uploadCourseDocumentAPI = (
    courseOfferingId: number,
    formData: FormData,
) => {
    return axios.post(
        `/api/v1/documents/course-offering/${courseOfferingId}/upload`,
        formData,
        {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    );
};

export const getCourseDocumentsAPI = (courseOfferingId: number) => {
    return axios.get(`/api/v1/documents/course-offering/${courseOfferingId}`);
};

export const deleteCourseDocumentAPI = (documentId: number) => {
    return axios.delete(`/api/v1/documents/${documentId}`);
};

export const getMyClassesAPI = () => {
    return axios.get(`/api/v1/course-registrations/my-classes`, {
        withCredentials: true,
    });
};

export const getMyClassDetailAPI = (courseId: number) => {
    return axios.get(`/api/v1/course-registrations/my-classes/${courseId}`, {
        withCredentials: true,
    });
};

export const getTeacherTodaySchedulesAPI = () => {
    return axios.get("/api/v1/schedules/teacher/today");
};

export const getTeachingCoursesAPI = () => {
    return axios.get("/api/v1/schedules/teacher/courses");
};

export const getTeachingSessionsAPI = (fromDate?: string, toDate?: string) => {
    return axios.get("/api/v1/lessons/teacher/teaching-sessions", {
        params: {
            fromDate,
            toDate,
        },
    });
};

export const getMyConversationsAPI = () => {
    return axios.get("/api/v1/chat-app");
};

export const createCourseConversationAPI = (courseOfferingId: number) => {
    return axios.post(`/api/v1/chat-app/course/${courseOfferingId}`);
};

export const createGroupConversationAPI = (data: {
    name: string;
    memberIds: string[];
}) => {
    return axios.post("/api/v1/chat-app/group", data);
};

export const getConversationMessagesAPI = (conversationId: number) => {
    return axios.get(`/api/v1/chat-app/${conversationId}/messages`);
};

export const sendMessageAPI = (
    conversationId: number,
    data: {
        content: string;
        imgUrl?: string;
    },
) => {
    return axios.post(`/api/v1/chat-app/${conversationId}/messages`, data);
};

export const seenConversationAPI = (conversationId: number) => {
    return axios.patch(`/api/v1/chat-app/${conversationId}/seen`);
};

export const uploadChatFileAPI = (data: FormData) => {
    return axios.post("/api/v1/chat-app/upload-file", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const updateGradeAPI = (data: {
    gradeId: number;
    midtermScore: number;
    finalScore: number;
}) => {
    return axios.patch("/api/v1/grades", data);
};
export const getMyStudyResultsAPI = (query: any) => {
    return axios.get("/api/v1/grades/my-results", { params: query });
};

export const publishGradesAPI = (courseOfferingId: number) => {
    return axios.patch(`/api/v1/grades/publish/${courseOfferingId}`);
};
export const getTeacherProfileAPI = () => {
    return axios.get<IBackendRes<any>>("/api/v1/users/teachers/profile");
};

export const getStudentDashboardSummaryAPI = () => {
    return axios.get("/api/v1/users/dashboard/summary");
};

export const getStudentTodaySchedulesAPI = () => {
    return axios.get("/api/v1/users/dashboard/today-schedules");
};

export const getStudentCourseProgressAPI = () => {
    return axios.get("/api/v1/users/dashboard/course-progress");
};

export const getStudentLatestGradesAPI = () => {
    return axios.get("/api/v1/users/dashboard/latest-grades");
};

export const getStudentDeadlinesAPI = () => {
    return axios.get("/api/v1/users/dashboard/deadlines");
};

export const getMyFindStudyResultsAPI = (query = "") => {
    const url = query
        ? `/api/v1/grades/my-study-results?${query}`
        : `/api/v1/grades/my-study-results`;

    return axios.get(url);
};
