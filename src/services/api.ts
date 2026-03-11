import {
    AUTH_API,
    CAPUS_BUILDING_ROOM_API,
    CLASSES_API,
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

export const getDetailUserAPI = (id: string) => {
    return axios.get<IBackendRes<IUserDetail>>(USER_API.DETAIL(id));
};
export const deleteUserAPI = (id: number | string) => {
    return axios.delete<IBackendRes<null>>(USER_API.DELETE(id));
};

export const updateUserAPI = (
    id: number | string,
    data: Record<string, unknown>,
) => {
    return axios.put<IBackendRes<IUserDetail>>(USER_API.UPDATE(id), {
        ...data,
    });
};

export const callBulkCreateUser = (user: IUserExcel[]) => {
    return axios.post<IBackendRes<IUserExcel[]>>(
        "/api/v1/users/bulk-create",
        user,
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

//** Term API */
export const getTermsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ITerm>>>(TERMS_API.LIST(query));
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
