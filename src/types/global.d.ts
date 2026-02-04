declare global {
    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
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

    interface ILogin {
        access_token: string;
        user: IUser;
    }

    interface IFetchAccount {
        user: IUser;
    }

    interface IOptionSelect {
        label: string | number;
        value: number | string;
        key?: string;
    }

    interface IDataImportProps {
        setOpenModalImport: (open: boolean) => void;
        openModalImport: boolean;
        fetchData: () => void;
        headers: string[];
        dataMapping: string[];
        templateFileUrl: string;
        uploadTitle?: string;
        apiFunction: (data: ExcelData[]) => Promise<any>;
    }

    interface IExcelData {
        fullName: string;
        email: string;
        // phone: string;
        password?: string;
    }

    interface IUser {
        id: string | number;
        email: string;
        name: string;
        avatar: string;
        role?: {
            id: string | number;
            name: string;
        };
    }

    interface IUserTable {
        id: string | number;
        name: string;
        email: string;
        date_of_birth: Date;
        gender: string;
        phone: string;
        address: string;
        avatar: string;
        role?: {
            name: string;
        };
        teacher?: ITeacherProfile;
        student?: IStudentProfile;
        role_id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }

    interface ITeacherProfile {
        id: number;
        user_id: string;
        specialization?: string;
        degree?: string;
        msgv?: string;
    }

    interface IStudentProfile {
        id: number;
        user_id: string;
        major?: IMajorsTable;
        adminClass?: IClassesTable;
        yearOfAdmission?: IYearsTable;
    }

    interface IRolesTable {
        id: string | number;
        name: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }

    interface IMajorsTable {
        id: string | number;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }

    interface IClassesTable {
        id: string | number;
        name: string;
        code: string;
        capacity: number;
        major_id: number;
        yearOfAdmissionId: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }

    interface IYearsTable {
        id: string | number;
        year: string;
        code: string;
        expectedGraduationYear: number;
        description?: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }
}

export {};
