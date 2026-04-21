import { getDepartmentsAPI } from "@/services/api";
import { useEffect, useMemo, useState } from "react";

const useSubjectHook = () => {
    const [dataDepartment, setDataDepartment] = useState<IDepartment[]>([]);
    const fetchDataDepartment = async () => {
        try {
            const response = await getDepartmentsAPI("current=1&pageSize=100");
            if (response?.data?.result) {
                setDataDepartment(response.data.result);
            }
        } catch (error) {
            console.error("Error fetching data department:", error);
        }
    };

    const departmentOptions = useMemo(
        () =>
            dataDepartment.map((item) => ({
                label: item.name,
                value: item.id,
            })),
        [dataDepartment],
    );
    useEffect(() => {
        fetchDataDepartment();
    }, []);
    return { departmentOptions };
};

export default useSubjectHook;
