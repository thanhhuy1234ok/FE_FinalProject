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
            } finally {
                setLoadingMajors(false);
            }
        };
        const fetchClasses = async () => {
            try {
                setLoadingClasses(true);
                const res = await getClassesAPI("current=1&pageSize=100");
                setClasses(res?.data?.result ?? []);
            } finally {
                setLoadingClasses(false);
            }
        };
        const fetchYears = async () => {
            try {
                setLoadingYears(true);
                const res = await getYearsAPI("current=1&pageSize=100");
                setYears(res?.data?.result ?? []);
            } finally {
                setLoadingYears(false);
            }
        };
        const fetchDepartments = async () => {
            try {
                const res = await getDepartmentsAPI("current=1&pageSize=100");
                setDepartments(res?.data?.result ?? []);
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        void fetchClasses();
        void fetchYears();
        void fetchRoles();
        void fetchMajors();
        void fetchDepartments();
    }, []);

    const roleOptions: IOptionSelect[] = useMemo(() => {
        return roles.map((item) => ({
            label: item.name,
            value: item.id,
        }));
    }, [roles]);

    const majorOptions: IOptionSelect[] = useMemo(() => {
        return majors.map((item) => ({
            label: item.name,
            value: item.id,
        }));
    }, [majors]);

    const classOptions: IOptionSelect[] = useMemo(() => {
        return classes.map((item) => ({
            label: item.name,
            value: item.id,
        }));
    }, [classes]);
    const yearOptions: IOptionSelect[] = useMemo(() => {
        return years.map((item) => ({
            label: item.year,
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
        // Implement the delete user logic here
        setIsDeleteUser(true);
        await deleteUserAPI(userId);

        console.log(`Deleting user with ID: ${userId}`);
        setIsDeleteUser(false);
    };

    return {
        roles,
        setRoles,
        loading,
        roleOptions,
        majors,
        majorOptions,
        classOptions,
        yearOptions,
        departmentOptions,
        loadingClasses,
        loadingYears,
        loadingMajors,
        handleDeleteUser,
        isDeleteUser,
        tableRef,
    };
};

export default useUserHooks;
