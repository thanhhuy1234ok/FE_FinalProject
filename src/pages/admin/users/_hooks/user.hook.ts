import { deleteUserAPI, getMajorsAPI, getRolesAPI } from "@/services/api";
import type { ActionType } from "@ant-design/pro-components";
import { useEffect, useMemo, useRef, useState } from "react";

const useUserHooks = () => {
    const [roles, setRoles] = useState<IRolesTable[]>([]);
    const [majors, setMajors] = useState<IMajorsTable[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMajors, setLoadingMajors] = useState(false);
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

        void fetchRoles();
        void fetchMajors();
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
        loadingMajors,
        handleDeleteUser,
        isDeleteUser,
        tableRef,
    };
};

export default useUserHooks;
