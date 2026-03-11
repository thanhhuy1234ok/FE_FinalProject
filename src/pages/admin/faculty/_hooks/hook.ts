import { getFacultyAPI } from "@/services/api";
import type { ActionType } from "@ant-design/pro-components";
import { useEffect, useMemo, useRef, useState } from "react";

const facultyHook = () => {
    const tableRef = useRef<ActionType | null>(null);
    const [dataFaculty, setDataFaculty] = useState<IFaculty[]>([]);

    const facultyOptions = useMemo(
        () => (dataFaculty ?? []).map((m) => ({ label: m.name, value: m.id })),
        [dataFaculty],
    );
    useEffect(() => {
        const FacultyList = async () => {
            const res = await getFacultyAPI("current=1&pageSize=100");
            if (res?.data?.result) setDataFaculty(res.data.result);
        };

        void FacultyList();
    }, []);
    return { tableRef, facultyOptions };
};

export default facultyHook;
