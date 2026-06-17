import {
    deleteUserAPI,
    getClassesAPI,
    getDepartmentsAPI,
    getMajorsAPI,
    getRolesAPI,
    getYearsAPI,
} from "@/services/api";
import type { ActionType } from "@ant-design/pro-components";
import { useEffect, useMemo, useRef, useState } from "react";

const useUserHooks = () => {
    const [roles, setRoles] = useState<IRole[]>([]);
    const [majors, setMajors] = useState<IMajor[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [years, setYears] = useState<IYear[]>([]);
    const [departments, setDepartments] = useState<IDepartment[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMajors, setLoadingMajors] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [isDeleteUser, setIsDeleteUser] = useState<boolean>(false);

    const tableRef = useRef<ActionType | null>(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const res = await getRolesAPI("current=1&pageSize=100");
                setRoles(res?.data?.result ?? []);
            } catch (error) {
                console.error("Error fetching roles:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchMajors = async () => {
            try {
                setLoadingMajors(true);
                const res = await getMajorsAPI("current=1&pageSize=100");
                setMajors(res?.data?.result ?? []);
            } catch (error) {
                console.error("Error fetching majors:", error);
            } finally {
                setLoadingMajors(false);
            }
        };

        const fetchClasses = async () => {
            try {
                setLoadingClasses(true);
                const res = await getClassesAPI("current=1&pageSize=100");
                setClasses(res?.data?.result ?? []);
            } catch (error) {
                console.error("Error fetching classes:", error);
            } finally {
                setLoadingClasses(false);
            }
        };

        const fetchYears = async () => {
            try {
                setLoadingYears(true);
                const res = await getYearsAPI("current=1&pageSize=100");
                setYears(res?.data?.result ?? []);
            } catch (error) {
                console.error("Error fetching years:", error);
            } finally {
                setLoadingYears(false);
            }
        };

        const fetchDepartments = async () => {
            try {
                setLoadingDepartments(true);
                const res = await getDepartmentsAPI("current=1&pageSize=100");
                setDepartments(res?.data?.result ?? []);
            } catch (error) {
                console.error("Error fetching departments:", error);
            } finally {
                setLoadingDepartments(false);
            }
        };

        void fetchRoles();
        void fetchMajors();
        void fetchClasses();
        void fetchYears();
        void fetchDepartments();
    }, []);

    const roleOptions = roles
        ?.filter((role: any) => role.name !== "ADMIN")
        .map((role: any) => ({
            label: role.name,
            value: role.id,
        }));

    const majorOptions: IOptionSelect[] = useMemo(() => {
        return majors.map((item: any) => ({
            label: item.name,
            value: item.id,
            code: item.code,
            departmentId:
                item.departmentId ?? item.department_id ?? item.department?.id,
        }));
    }, [majors]);

    const classOptions: IOptionSelect[] = useMemo(() => {
        return classes.map((item: any) => ({
            label: item.name,
            value: item.id,
            code: item.code,
            majorId: item.majorId ?? item.major_id ?? item.major?.id,
            yearOfAdmissionId:
                item.yearOfAdmissionId ??
                item.year_of_admission_id ??
                item.yearId ??
                item.year_id ??
                item.yearOfAdmission?.id ??
                item.year?.id,
        }));
    }, [classes]);

    const yearOptions: IOptionSelect[] = useMemo(() => {
        return years.map((item: any) => ({
            label: String(item.year),
            value: item.id,
        }));
    }, [years]);

    const departmentOptions: IOptionSelect[] = useMemo(() => {
        return departments.map((item) => ({
            label: item.name,
            value: item.id,
        }));
    }, [departments]);

    const handleDeleteUser = async (userId: number | string) => {
        try {
            setIsDeleteUser(true);
            await deleteUserAPI(userId);
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setIsDeleteUser(false);
        }
    };

    return {
        roles,
        majors,
        classes,
        years,
        departments,

        roleOptions,
        majorOptions,
        classOptions,
        yearOptions,
        departmentOptions,

        loading,
        loadingMajors,
        loadingClasses,
        loadingYears,
        loadingDepartments,

        handleDeleteUser,
        isDeleteUser,
        tableRef,
        setRoles,
    };
};

export default useUserHooks;
