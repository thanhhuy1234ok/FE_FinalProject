import { useCallback } from "react";
import {
    getAdminClassAPI,
    getTeacherSubjectsAPI,
    getTermsAPI,
} from "@/services/api";

export interface IOptionSelect {
    label: string;
    value: number | string;
}

const useCourseOfferingHook = () => {
    const fetchTeacherSubjectOptions = useCallback(
        async (keyword: string): Promise<IOptionSelect[]> => {
            const query = `current=1&pageSize=20&name=/${keyword || ""}/i`;

            const res = await getTeacherSubjectsAPI(query);

            return (
                res?.data?.result?.map((item: any) => ({
                    label: `${item.teacher?.user.name} - ${item.subject?.name}`,
                    value: item.id,
                })) || []
            );
        },
        [],
    );

    const fetchAdminClassOptions = async (
        search: string,
        termId?: number,
        teacherSubjectId?: number,
    ) => {
        if (!termId) return [];

        const params = new URLSearchParams();
        params.set("current", "1");
        params.set("pageSize", "100");
        params.set("status", "STUDYING");
        params.set("termId", String(termId));

        if (teacherSubjectId) {
            params.set("teacherSubjectId", String(teacherSubjectId));
        }

        if (search?.trim()) {
            params.set("keyword", search.trim());
        }

        const res = await getAdminClassAPI(params.toString());
        const data = res?.data?.result ?? [];

        return data.map((item: any) => ({
            label: `${item?.code ?? ""} - ${item?.name ?? ""} (${
                item?.currentStudentCount ?? 0
            }/${item?.capacity ?? 0})`,
            value: item.id,
        }));
    };

    const fetchTermOptions = useCallback(async (): Promise<IOptionSelect[]> => {
        const res = await getTermsAPI("current=1&pageSize=20");

        return (
            res?.data?.result?.map((item: any) => ({
                label: `${item.semester} - ${item.year}`,
                value: item.id,
            })) || []
        );
    }, []);

    return {
        fetchTeacherSubjectOptions,
        fetchTermOptions,
        fetchAdminClassOptions,
    };
};

export default useCourseOfferingHook;
