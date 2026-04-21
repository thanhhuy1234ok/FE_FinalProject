/* ===============================
   GLOBAL DOMAIN TYPES - SCHOOL AG
================================= */

declare global {
    /* ===============================
       BASE ENTITY (Audit Columns)
    ================================= */
    interface IBaseEntity {
        id: number | string;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
    }

    /* ===============================
       API RESPONSE
    ================================= */
    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
    }

    interface IBackendError {
        error?: string | string[];
        message: string;
        statusCode: number | string;
    }

    interface IModelPaginate<T> {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        };
        result: T[];
    }

    /* ===============================
       AUTH
    ================================= */
    interface IUser {
        id: number | string;
        email: string;
        name: string;
        avatar: string;
        role?: IRole;
    }

    interface ILoginResponse {
        access_token: string;
        user: IUser;
    }

    interface IFetchAccount {
        user: IUser;
    }

    interface IRole extends IBaseEntity {
        name: string;
        description: string;
        isActive: boolean;
    }

    /* ===============================
       USER PROFILE
    ================================= */
    interface ITeacherProfile {
        id: number;
        user_id: string;
        specialization?: string;
        degree?: string;
        msgv?: string;
        department?: IDepartment;
        user?: IUserDetail;
    }

    interface IStudentProfile {
        id: number;
        user_id: string;
        major?: IMajor;
        adminClass?: IClass;
        yearOfAdmission?: IYear;
        mssv?: string;
    }

    interface IUserDetail extends IBaseEntity {
        name: string;
        email: string;
        gender: string;
        phone: string;
        address: string;
        avatar: string;

        date_of_birth: string | null;

        role?: IRole;
        teacher?: ITeacherProfile;
        student?: IStudentProfile;

        role_id: number;
        isActive: boolean;
    }

    /* ===============================
       ACADEMIC STRUCTURE
    ================================= */
    interface IMajor extends IBaseEntity {
        name: string;
        code: string;
        isActive: boolean;
        department_id: number;
        department: IDepartment;
    }

    interface IYear extends IBaseEntity {
        year: string;
        code: string;
        expectedGraduationYear: number;
        description?: string;
        isActive: boolean;
    }

    interface IClass extends IBaseEntity {
        name: string;
        code: string;
        capacity: number;

        major_id: number;
        yearOfAdmissionId: number;

        isActive: boolean;
    }

    interface ITeacherSubject extends IBaseEntity {
        teacherId: string;
        subjectId: number;

        teacher?: ITeacherProfile;
        subject?: ISubject;
    }

    /* ===============================
       CAMPUS / BUILDING / ROOM
    ================================= */
    interface ICampus extends IBaseEntity {
        name: string;
        code: string;
        address: string;
        isActive: boolean;
    }

    interface IBuilding extends IBaseEntity {
        name: string;
        code: string;
        campus_id: number;
        campus: ICampus;
        isActive: boolean;
    }

    interface IRoom extends IBaseEntity {
        name: string;
        code: string;
        building_id: number;
        capacity: number;
        building: IBuilding;
        isActive: boolean;
    }

    /* ===============================
       TERM (Academic Term)
    ================================= */
    interface ITerm extends IBaseEntity {
        year: number;
        semester: "HK1" | "HK2" | "SUMMER";
        isActive?: boolean;
        startDate?: string;
        endDate?: string;
    }

    /* ===============================
       SUBJECT
    ================================= */
    interface ISubject extends IBaseEntity {
        name: string;
        code: string;
        credit: number;
        isActive: boolean;
        department_id: number;
        department: IDepartment;
    }

    /* ===============================
       CURRICULUM
    ================================= */
    type CurriculumStatus = "draft" | "published" | "archived";

    interface ICurriculum extends IBaseEntity {
        major_id: number;
        major: IMajor;

        year_of_admission_id: number;
        yearOfAdmission: IYear;

        code: string;
        name: string;
        version: string;

        effective_from: string;
        effective_to: string;

        total_credits_required: number;

        status: CurriculumStatus;
        notes: string | null;
        isActive: boolean;

        curriculumSubjects: ICurriculumSubject[];
    }

    interface ICurriculumSubject extends IBaseEntity {
        curriculumId: number;
        curriculum?: ICurriculum;

        subjectId: number;
        subject?: ISubject;

        semesterNumber: number;

        isRequired: boolean;

        ordering: number;

        prerequisiteRule?: string | null;
    }

    /* ===============================
       BULK CREATE TERM PAYLOAD
    ================================= */
    interface TermForm {
        year: number;
        semester: number;
        subjectIds: number[];
        prerequisiteRule?: string | null;
        note?: string;
    }

    interface CurriculumTermPayload {
        curriculumId: number;
        terms: TermForm[];
    }

    /* ===============================
       UI HELPERS
    ================================= */
    interface IOptionSelect {
        label: string | number;
        value: string | number;
        key?: string;
    }

    interface IStudentExcel {
        name: string;
        email: string;
        gender: string;
        phone: string;
        majorName: string;
        className: string;
        yearAdmission: number | string;
        password?: string;
    }

    interface ICurSubExcel {
        curriculumId: number | string;
        subjectId: number | string;
        semesterNumber: number | string;
        isRequired?: boolean | string | number | null;
        ordering?: number | string | null;
        prerequisiteRule?: string | null;
    }

    interface ICurSubExcelByName {
        curriculumName: string;
        subjectName: string;
        semesterNumber: number | string;
        isRequired?: boolean | string | number | null;
        ordering?: number | string | null;
        prerequisiteRule?: string | null;
    }

    interface ImportCurriculumSubjectPayload {
        items: {
            curriculumId: number;
            subjectId: number;
            semesterNumber: number;
            isRequired?: boolean;
            ordering?: number;
            prerequisiteRule?: string | null;
        }[];
    }

    interface ImportCurriculumSubjectByNamePayload {
        items: ICurSubExcelByName[];
    }

    interface IDataImportProps<T extends Record<string, any>> {
        setOpenModalImport: (open: boolean) => void;
        openModalImport: boolean;
        fetchData: () => void;

        headers: string[];
        dataMapping: (keyof T)[]; // ✅ mapping theo field của T
        templateFileUrl: string;
        uploadTitle?: string;

        apiFunction: (data: T[]) => Promise<any>;

        // ✅ optional: transform data trước khi submit (vd add password)
        transformData?: (rows: T[]) => T[];

        // ✅ optional: rowKey cho Table (default: "id")
        rowKey?: keyof T | ((record: T) => string);
    }

    /* ===============================
       DEPARTMENT
    ================================= */
    interface IDepartment extends IBaseEntity {
        name: string;
        code: string;
        description?: string;
        isActive: boolean;
        facultyId: number;
        teacherCount: number;
        studentCount: number;
    }
    /* ===============================
       Faculty
    ================================= */
    interface IFaculty extends IBaseEntity {
        name: string;
        code: string;
        isActive: boolean;
    }

    interface IAdminClass extends IBaseEntity {
        name: string;
        code?: string;
    }

    interface ICourseOffering {
        id: number;
        maxStudents?: number;
        enrolledCount?: number;
        isActive: boolean;

        adminClassId: number | null;
        adminClass: IAdminClass | null;

        teacherSubjectId: number;
        teacherSubject: ITeacherSubject;

        termId: number;
        term: ITerm;

        createdAt?: string;
        updatedAt?: string;
        deletedAt?: string | null;
    }

    interface ISchedule {
        id: number;
        dayOfWeek: number;
        lessonStart: number;
        lessonEnd: number;
        isActive: boolean;
        room?: IRoom;
        courseOffering?: ICourseOffering;
    }

    export type TPaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
    export type TPaymentItemStatus = "ACTIVE" | "CANCELLED";
    export type TPaymentMethod = "CASH" | "BANK_TRANSFER" | "MOMO";

    interface IPaymentSubject {
        id: number;
        name: string;
        code: string;
        credits: number;
    }

    interface IPaymentTeacherUser {
        id: string;
        name: string;
        email: string;
    }

    interface IPaymentTeacher {
        id: number;
        user: IPaymentTeacherUser;
    }

    interface IPaymentTeacherSubject {
        id: number;
        subject: IPaymentSubject;
        teacher: IPaymentTeacher;
    }

    interface IPaymentAdminClass {
        id: number;
        code: string;
        name: string;
    }

    interface IPaymentCourseOffering {
        id: number;
        code: string;
        adminClass?: IPaymentAdminClass;
        teacherSubject: IPaymentTeacherSubject;
    }

    interface IPaymentRegistration {
        id: number;
        status: string;
    }

    interface IPaymentItem {
        id: number;
        credits: number;
        unitPrice: number;
        amount: number;
        status: TPaymentItemStatus;
        registration: IPaymentRegistration;
        courseOffering: IPaymentCourseOffering;
    }

    interface IPaymentTerm {
        id: number;
        year: number;
        semester: string;
        startDate?: string;
        endDate?: string;
    }

    interface IPaymentStudentUser {
        id: string;
        name: string;
        email: string;
    }

    interface IPaymentStudent {
        id: number;
        code?: string;
        user: IPaymentStudentUser;
    }

    interface IPayment {
        id: number;
        code: string;
        totalCredits: number;
        totalAmount: number;
        status: TPaymentStatus;
        dueDate: string | null;
        paidAt: string | null;
        paymentMethod: TPaymentMethod | null;
        note: string | null;
        createdAt?: string;
        updatedAt?: string;
        student: IPaymentStudent;
        term: IPaymentTerm;
        items: IPaymentItem[];
    }
}

export {};
